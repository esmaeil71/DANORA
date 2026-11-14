import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConversationDto, UpdateConversationDto } from './dto/conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(private prisma: PrismaService) {}

  async list(userId: string) {
    return this.prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        modelId: true,
        updatedAt: true,
      },
    });
  }

  async getMessages(userId: string, conversationId: string) {
    await this.assertOwner(userId, conversationId);
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true,
      },
    });
  }

  async create(userId: string, dto: CreateConversationDto) {
    let modelId = dto.modelId;
    if (!modelId) {
      const first = await this.prisma.modelCatalog.findFirst({
        where: { enabled: true },
        orderBy: { displayName: 'asc' },
      });
      if (!first) {
        throw new NotFoundException('هیچ مدلی فعال نیست');
      }
      modelId = first.id;
    }

    const model = await this.prisma.modelCatalog.findFirst({
      where: { id: modelId, enabled: true },
    });
    if (!model) {
      throw new NotFoundException('مدل نامعتبر است');
    }

    return this.prisma.conversation.create({
      data: {
        userId,
        modelId,
        title: dto.title ?? 'گفتگوی جدید',
      },
      select: {
        id: true,
        title: true,
        modelId: true,
        updatedAt: true,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateConversationDto) {
    await this.assertOwner(userId, id);
    if (dto.modelId) {
      const model = await this.prisma.modelCatalog.findFirst({
        where: { id: dto.modelId, enabled: true },
      });
      if (!model) {
        throw new NotFoundException('مدل نامعتبر است');
      }
    }
    return this.prisma.conversation.update({
      where: { id },
      data: {
        title: dto.title,
        modelId: dto.modelId,
      },
      select: {
        id: true,
        title: true,
        modelId: true,
        updatedAt: true,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.assertOwner(userId, id);
    await this.prisma.conversation.delete({ where: { id } });
    return { ok: true };
  }

  private async assertOwner(userId: string, conversationId: string) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conv) {
      throw new NotFoundException('گفتگو یافت نشد');
    }
    if (conv.userId !== userId) {
      throw new ForbiddenException();
    }
    return conv;
  }
}