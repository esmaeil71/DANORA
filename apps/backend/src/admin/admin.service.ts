import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserPlan, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ModelsService } from '../models/models.service';
import {
  PatchAdminModelDto,
  PatchAdminUserDto,
  PatchUpgradeRequestDto,
} from './dto/admin.dto';

function startOfDayUTC(d = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private models: ModelsService,
  ) {}

  async overview() {
    const today = startOfDayUTC();
    const weekAgo = new Date(today);
    weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);

    const [
      userCount,
      usageAgg,
      pendingUpgrades,
      recentSupport,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.usageDaily.aggregate({
        where: { date: today },
        _sum: { messageCount: true, tokenTotal: true },
      }),
      this.prisma.upgradeRequest.count({ where: { status: 'pending' } }),
      this.prisma.supportInquiry.count({
        where: { createdAt: { gte: weekAgo } },
      }),
    ]);

    return {
      userCount,
      messagesToday: usageAgg._sum.messageCount ?? 0,
      tokensToday: usageAgg._sum.tokenTotal ?? 0,
      pendingUpgradeRequests: pendingUpgrades,
      supportInquiriesLast7Days: recentSupport,
    };
  }

  async listUsers(page = 1, limit = 20, q?: string) {
    const take = Math.min(50, Math.max(1, limit));
    const skip = Math.max(0, (Math.max(1, page) - 1) * take);
    const where = q?.trim()
      ? { email: { contains: q.trim().toLowerCase(), mode: 'insensitive' as const } }
      : {};

    const [total, rows] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        select: {
          id: true,
          email: true,
          plan: true,
          role: true,
          suspended: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      total,
      page: Math.max(1, page),
      limit: take,
      users: rows.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      })),
    };
  }

  async getUser(targetId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!user) {
      throw new NotFoundException('کاربر یافت نشد');
    }
    const today = startOfDayUTC();
    const [usage, conversationCount] = await Promise.all([
      this.prisma.usageDaily.findUnique({
        where: { userId_date: { userId: targetId, date: today } },
      }),
      this.prisma.conversation.count({ where: { userId: targetId } }),
    ]);

    return {
      id: user.id,
      email: user.email,
      plan: user.plan,
      role: user.role,
      suspended: user.suspended,
      createdAt: user.createdAt.toISOString(),
      conversationCount,
      usageToday: {
        messageCount: usage?.messageCount ?? 0,
        tokenTotal: usage?.tokenTotal ?? 0,
      },
    };
  }

  private async assertCanModifyUser(actorId: string, targetId: string) {
    const target = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!target) {
      throw new NotFoundException('کاربر یافت نشد');
    }

    if (actorId === targetId) {
      return target;
    }
    return target;
  }

  private async countAdmins() {
    return this.prisma.user.count({ where: { role: UserRole.admin, suspended: false } });
  }

  async patchUser(actorId: string, targetId: string, dto: PatchAdminUserDto) {
    const target = await this.assertCanModifyUser(actorId, targetId);

    if (actorId === targetId) {
      if (dto.suspended === true) {
        throw new BadRequestException('نمی‌توانید حساب خود را مسدود کنید');
      }
      if (dto.role === UserRole.user) {
        throw new BadRequestException('نمی‌توانید نقش ادمین خود را حذف کنید');
      }
    }

    if (
      target.role === UserRole.admin &&
      dto.role === UserRole.user &&
      targetId !== actorId
    ) {
      const admins = await this.countAdmins();
      if (admins <= 1) {
        throw new BadRequestException('حداقل یک ادمین فعال باید باقی بماند');
      }
    }

    const data: {
      plan?: UserPlan;
      role?: UserRole;
      suspended?: boolean;
    } = {};
    if (dto.plan !== undefined) data.plan = dto.plan;
    if (dto.role !== undefined) data.role = dto.role;
    if (dto.suspended !== undefined) data.suspended = dto.suspended;

    const updated = await this.prisma.user.update({
      where: { id: targetId },
      data,
      select: {
        id: true,
        email: true,
        plan: true,
        role: true,
        suspended: true,
        createdAt: true,
      },
    });

    return {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  async deleteUser(actorId: string, targetId: string) {
    if (actorId === targetId) {
      throw new BadRequestException('نمی‌توانید حساب خود را حذف کنید');
    }

    const target = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!target) {
      throw new NotFoundException('کاربر یافت نشد');
    }
    if (target.role === UserRole.admin) {
      const admins = await this.countAdmins();
      if (admins <= 1) {
        throw new BadRequestException('حداقل یک ادمین فعال باید باقی بماند');
      }
      throw new ForbiddenException('حذف کاربر ادمین مجاز نیست');
    }

    await this.prisma.user.delete({ where: { id: targetId } });
    return { ok: true };
  }

  async resetUsageToday(targetId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!user) {
      throw new NotFoundException('کاربر یافت نشد');
    }
    const date = startOfDayUTC();
    await this.prisma.usageDaily.upsert({
      where: { userId_date: { userId: targetId, date } },
      create: {
        userId: targetId,
        date,
        messageCount: 0,
        tokenTotal: 0,
      },
      update: {
        messageCount: 0,
        tokenTotal: 0,
      },
    });
    return { ok: true };
  }

  async listUserConversations(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('کاربر یافت نشد');
    }
    const rows = await this.prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        modelId: true,
        updatedAt: true,
        createdAt: true,
        _count: { select: { messages: true } },
      },
    });
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      modelId: r.modelId,
      messageCount: r._count.messages,
      updatedAt: r.updatedAt.toISOString(),
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async listConversationMessages(conversationId: string) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { user: { select: { id: true, email: true } } },
    });
    if (!conv) {
      throw new NotFoundException('گفتگو یافت نشد');
    }
    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        role: true,
        content: true,
        tokenIn: true,
        tokenOut: true,
        createdAt: true,
      },
    });
    return {
      conversation: {
        id: conv.id,
        title: conv.title,
        userId: conv.userId,
        userEmail: conv.user.email,
      },
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        tokenIn: m.tokenIn,
        tokenOut: m.tokenOut,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  }

  async listUpgradeRequests() {
    const rows = await this.prisma.upgradeRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { user: { select: { id: true, email: true, plan: true } } },
    });
    return rows.map((r) => ({
      id: r.id,
      status: r.status,
      note: r.note,
      phone: r.phone,
      createdAt: r.createdAt.toISOString(),
      user: r.user,
    }));
  }

  async patchUpgradeRequest(id: string, dto: PatchUpgradeRequestDto) {
    const row = await this.prisma.upgradeRequest.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException('درخواست یافت نشد');
    }
    const updated = await this.prisma.upgradeRequest.update({
      where: { id },
      data: { status: dto.status },
    });
    if (dto.status === 'approved') {
      await this.prisma.user.update({
        where: { id: row.userId },
        data: { plan: UserPlan.pro },
      });
    }
    return {
      id: updated.id,
      status: updated.status,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  async listSupportInquiries() {
    const rows = await this.prisma.supportInquiry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { user: { select: { id: true, email: true } } },
    });
    return rows.map((r) => ({
      id: r.id,
      subject: r.subject,
      message: r.message,
      createdAt: r.createdAt.toISOString(),
      user: r.user,
    }));
  }

  async listModels() {
    const rows = await this.models.listAllForAdmin();
    return rows.map((m) => ({
      id: m.id,
      provider: m.provider,
      displayName: m.displayName,
      apiModelName: m.apiModelName,
      enabled: m.enabled,
      inputPricePer1k: m.inputPricePer1k.toString(),
      outputPricePer1k: m.outputPricePer1k.toString(),
    }));
  }

  async patchModel(id: string, dto: PatchAdminModelDto) {
    const existing = await this.prisma.modelCatalog.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('مدل یافت نشد');
    }
    const row = await this.models.updateForAdmin(id, dto);
    return {
      id: row.id,
      displayName: row.displayName,
      enabled: row.enabled,
    };
  }
}