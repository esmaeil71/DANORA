import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatMessage } from '@danora/shared';
import { ModelProvider } from '@prisma/client';
import {
  GoogleGenerativeAI,
  Content,
} from '@google/generative-ai';
import {
  CompletionResult,
  ProviderAdapter,
  StreamChunk,
} from '../model-router.types';

@Injectable()
export class GoogleAdapter implements ProviderAdapter {
  readonly provider = ModelProvider.google;
  private client: GoogleGenerativeAI | null = null;

  constructor(private config: ConfigService) {}

  private getClient(): GoogleGenerativeAI {
    const key = this.config.get<string>('GOOGLE_GENERATIVE_AI_API_KEY');
    if (!key) {
      throw new Error('GOOGLE_GENERATIVE_AI_API_KEY تنظیم نشده است');
    }
    if (!this.client) {
      this.client = new GoogleGenerativeAI(key);
    }
    return this.client;
  }

  private toGeminiHistory(messages: ChatMessage[]): Content[] {
    return messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));
  }

  async *streamChat(
    apiModelName: string,
    messages: ChatMessage[],
  ): AsyncGenerator<StreamChunk, CompletionResult, undefined> {
    const client = this.getClient();
    const system = messages.find((m) => m.role === 'system')?.content;
    const model = client.getGenerativeModel({
      model: apiModelName,
      systemInstruction: system,
    });

    const history = this.toGeminiHistory(messages.slice(0, -1));
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser) {
      throw new Error('پیام کاربر یافت نشد');
    }

    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(lastUser.content);

    let content = '';
    for await (const chunk of result.stream) {
      const delta = chunk.text();
      if (delta) {
        content += delta;
        yield { delta };
      }
    }

    const tokenIn = Math.ceil(
      messages.reduce((s, m) => s + m.content.length, 0) / 4,
    );
    const tokenOut = Math.ceil(content.length / 4);

    return { content, tokenIn, tokenOut };
  }
}