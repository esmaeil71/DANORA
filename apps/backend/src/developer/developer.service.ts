import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

const MAX_TOKENS_PER_USER = 10;

@Injectable()
export class DeveloperService {
  constructor(private prisma: PrismaService) {}

  private hashToken(plain: string) {
    return createHash('sha256').update(plain).digest('hex');
  }

  async listTokens(userId: string) {
    const rows = await this.prisma.apiToken.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        prefix: true,
        createdAt: true,
        lastUsedAt: true,
      },
    });
    return rows.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      lastUsedAt: r.lastUsedAt?.toISOString() ?? null,
    }));
  }

  async createToken(userId: string, name: string) {
    const count = await this.prisma.apiToken.count({ where: { userId } });
    if (count >= MAX_TOKENS_PER_USER) {
      throw new BadRequestException(
        `حداکثر ${MAX_TOKENS_PER_USER} کلید فعال مجاز است`,
      );
    }

    const plain = `dnr_${randomBytes(24).toString('base64url')}`;
    const tokenHash = this.hashToken(plain);
    const prefix = `${plain.slice(0, 16)}…`;

    const row = await this.prisma.apiToken.create({
      data: {
        userId,
        name: name.trim(),
        tokenHash,
        prefix,
      },
      select: { id: true, name: true, prefix: true, createdAt: true },
    });

    return {
      token: plain,
      id: row.id,
      name: row.name,
      prefix: row.prefix,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async revokeToken(userId: string, tokenId: string) {
    const row = await this.prisma.apiToken.findFirst({
      where: { id: tokenId, userId },
    });
    if (!row) {
      throw new NotFoundException('کلید یافت نشد');
    }
    await this.prisma.apiToken.delete({ where: { id: tokenId } });
    return { ok: true };
  }

  async resolveUserFromApiKey(bearerValue: string) {
    const plain = bearerValue.startsWith('dnr_')
      ? bearerValue
      : `dnr_${bearerValue}`;
    if (!plain.startsWith('dnr_') || plain.length < 20) {
      throw new UnauthorizedException();
    }

    const tokenHash = this.hashToken(plain);
    const record = await this.prisma.apiToken.findFirst({
      where: { tokenHash },
      include: { user: true },
    });
    if (!record) {
      throw new UnauthorizedException('کلید API نامعتبر است');
    }

    void this.prisma.apiToken
      .update({
        where: { id: record.id },
        data: { lastUsedAt: new Date() },
      })
      .catch(() => undefined);

    const u = record.user;
    return {
      id: u.id,
      email: u.email,
      plan: u.plan,
      role: u.role,
      suspended: u.suspended,
      createdAt: u.createdAt,
    };
  }
}