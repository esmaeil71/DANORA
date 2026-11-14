import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatMessage } from '@danora/shared';
import { ModelProvider } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';
import {
  CompletionResult,
  ProviderAdapter,
  StreamChunk,
} from '../model-router.types';

@Injectable()
export class AnthropicAdapter implements ProviderAdapter {
  readonly provider = ModelProvider.anthropic;
  private client: Anthropic | null = null;

  constructor(private config: ConfigService) {}

  private getClient(): Anthropic {
    const key = this.config.get<string>('ANTHROPIC_API_KEY');
    if (!key) {
      throw new Error('ANTHROPIC_API_KEY تنظیم نشده است');
    }
    if (!this.client) {
      this.client = new Anthropic({ apiKey: key });
    }
    return this.client;
  }

  async *streamChat(
    apiModelName: string,
    messages: ChatMessage[],
  ): AsyncGenerator<StreamChunk, CompletionResult, undefined> {
    const client = this.getClient();
    const system = messages.find((m) => m.role === 'system')?.content;
    const chatMessages = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    const stream = client.messages.stream({
      model: apiModelName,
      max_tokens: 4096,
      system: system ?? undefined,
      messages: chatMessages,
    });

    let content = '';
    let tokenIn = 0;
    let tokenOut = 0;

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        const delta = event.delta.text;
        content += delta;
        yield { delta };
      }
    }

    const finalMessage = await stream.finalMessage();
    tokenIn = finalMessage.usage.input_tokens;
    tokenOut = finalMessage.usage.output_tokens;

    return { content, tokenIn, tokenOut };
  }
}