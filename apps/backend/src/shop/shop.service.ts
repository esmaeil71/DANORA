import { Injectable, NotFoundException } from '@nestjs/common';
import { ShopSearchMetadata } from '@danora/shared';
import { ConversationKind, MessageRole, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsageService } from '../usage/usage.service';

@Injectable()
export class ShopService {
  constructor(
    private prisma: PrismaService,
    private usage: UsageService,
  ) {}

  async prepareConversation(
    userId: string,
    conversationId: string | undefined,
    modelId: string,
    plan: string,
  ) {
    await this.usage.assertCanSendMessage(userId, plan);

    if (conversationId) {
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
      });
      if (!conversation || conversation.userId !== userId) {
        throw new NotFoundException('گفتگو یافت نشد');
      }
      if (conversation.kind !== ConversationKind.shop) {
        throw new NotFoundException('این گفتگو مربوط به خرید نیست');
      }
      if (modelId && modelId !== conversation.modelId) {
        return this.prisma.conversation.update({
          where: { id: conversationId },
          data: { modelId },
        });
      }
      return conversation;
    }

    return this.prisma.conversation.create({
      data: {
        userId,
        modelId,
        kind: ConversationKind.shop,
        title: 'جستجوی خرید',
      },
    });
  }

  async saveUserMessage(conversationId: string, content: string) {
    await this.prisma.message.create({
      data: {
        conversationId,
        role: MessageRole.user,
        content,
      },
    });
  }

  async saveAssistantMessage(
    conversationId: string,
    content: string,
    metadata: ShopSearchMetadata,
    tokenIn: number,
    tokenOut: number,
  ) {
    return this.prisma.message.create({
      data: {
        conversationId,
        role: MessageRole.assistant,
        content,
        metadata: metadata as unknown as Prisma.InputJsonValue,
        tokenIn,
        tokenOut,
      },
    });
  }

  async setTitle(conversationId: string, query: string) {
    const title =
      query.length > 40 ? `خرید: ${query.slice(0, 40)}…` : `خرید: ${query}`;
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { title },
    });
    return title;
  }

  async getConversationMeta(conversationId: string) {
    const row = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        id: true,
        title: true,
        modelId: true,
        updatedAt: true,
        kind: true,
      },
    });
    if (!row) throw new NotFoundException('گفتگو یافت نشد');
    return {
      id: row.id,
      title: row.title,
      modelId: row.modelId,
      updatedAt: row.updatedAt.toISOString(),
      kind: row.kind,
    };
  }

  async recordUsage(userId: string, tokenIn: number, tokenOut: number) {
    await this.usage.recordMessage(userId, tokenIn, tokenOut);
  }
}