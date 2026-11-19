import { Injectable, NotFoundException } from '@nestjs/common';
import { ChatMessage } from '@danora/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AnthropicAdapter } from './adapters/anthropic.adapter';
import { GoogleAdapter } from './adapters/google.adapter';
import { OpenAiAdapter } from './adapters/openai.adapter';
import {
  CompleteOptions,
  CompletionResult,
  StreamChunk,
  ProviderAdapter,
} from './model-router.types';

@Injectable()
export class ModelRouterService {
  private adapters: ProviderAdapter[];

  constructor(
    private prisma: PrismaService,
    openai: OpenAiAdapter,
    anthropic: AnthropicAdapter,
    google: GoogleAdapter,
  ) {
    this.adapters = [openai, anthropic, google];
  }

  async *streamChat(
    modelId: string,
    messages: ChatMessage[],
  ): AsyncGenerator<StreamChunk, CompletionResult, undefined> {
    const model = await this.prisma.modelCatalog.findFirst({
      where: { id: modelId, enabled: true },
    });
    if (!model) {
      throw new NotFoundException('مدل یافت نشد یا غیرفعال است');
    }

    const adapter = this.adapters.find((a) => a.provider === model.provider);
    if (!adapter) {
      throw new NotFoundException('ارائه‌دهنده مدل پشتیبانی نمی‌شود');
    }

    return yield* adapter.streamChat(
      {
        apiModelName: model.apiModelName,
        apiBaseUrl: model.apiBaseUrl,
        apiKeyEnv: model.apiKeyEnv,
      },
      messages,
    );
  }

  async completeChat(
    modelId: string,
    messages: ChatMessage[],
    options?: CompleteOptions,
  ): Promise<CompletionResult> {
    const model = await this.prisma.modelCatalog.findFirst({
      where: { id: modelId, enabled: true },
    });
    if (!model) {
      throw new NotFoundException('مدل یافت نشد یا غیرفعال است');
    }
    const adapter = this.adapters.find((a) => a.provider === model.provider);
    if (!adapter) {
      throw new NotFoundException('ارائه‌دهنده مدل پشتیبانی نمی‌شود');
    }
    return adapter.completeChat(
      {
        apiModelName: model.apiModelName,
        apiBaseUrl: model.apiBaseUrl,
        apiKeyEnv: model.apiKeyEnv,
      },
      messages,
      options,
    );
  }
}