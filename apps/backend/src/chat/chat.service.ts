import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatMessage } from '@danora/shared';
import { MessageRole } from '@prisma/client';
import { ConversationsService } from '../conversations/conversations.service';
import { ModelRouterService } from '../model-router/model-router.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsageService } from '../usage/usage.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private router: ModelRouterService,
    private usage: UsageService,
    private conversations: ConversationsService,
  ) {}

  async prepareConversation(
    userId: string,
    conversationId: string | undefined,
    modelId: string,
    plan: string,
  ) {
    await this.usage.assertCanSendMessage(userId, plan);

    let conversation;
    if (conversationId) {
      conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
      });
      if (!conversation || conversation.userId !== userId) {
        throw new NotFoundException('گفتگو یافت نشد');
      }
      if (modelId && modelId !== conversation.modelId) {
        conversation = await this.prisma.conversation.update({
          where: { id: conversationId },
          data: { modelId },
        });
      }
    } else {
      conversation = await this.prisma.conversation.create({
        data: {
          userId,
          modelId,
          title: 'گفتگوی جدید',
        },
      });
    }

    return conversation;
  }

  async loadHistory(conversationId: string): Promise<ChatMessage[]> {
    const rows = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((m) => ({
      role: m.role as ChatMessage['role'],
      content: m.content,
    }));
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
    tokenIn: number,
    tokenOut: number,
  ) {
    return this.prisma.message.create({
      data: {
        conversationId,
        role: MessageRole.assistant,
        content,
        tokenIn,
        tokenOut,
      },
    });
  }

  titleFromFirstMessage(firstMessage: string) {
    return firstMessage.length > 48
      ? firstMessage.slice(0, 48) + '…'
      : firstMessage;
  }

  async getConversationSidebarMeta(conversationId: string) {
    const row = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true, title: true, modelId: true, updatedAt: true },
    });
    if (!row) {
      throw new NotFoundException('گفتگو یافت نشد');
    }
    return {
      id: row.id,
      title: row.title,
      modelId: row.modelId,
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async maybeSetTitle(conversationId: string, firstMessage: string) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conv || conv.title !== 'گفتگوی جدید') {
      return;
    }
    const title = this.titleFromFirstMessage(firstMessage);
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { title },
    });
  }

  stream(modelId: string, messages: ChatMessage[]) {
    return this.router.streamChat(modelId, messages);
  }

  async recordUsage(userId: string, tokenIn: number, tokenOut: number) {
    await this.usage.recordMessage(userId, tokenIn, tokenOut);
  }
}