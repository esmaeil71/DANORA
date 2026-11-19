import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatMessage } from '@danora/shared';
import { ModelProvider } from '@prisma/client';
import OpenAI from 'openai';
import {
  CompleteOptions,
  CompletionResult,
  ModelStreamConfig,
  ProviderAdapter,
  StreamChunk,
} from '../model-router.types';

@Injectable()
export class OpenAiAdapter implements ProviderAdapter {
  readonly provider = ModelProvider.openai;
  private readonly clients = new Map<string, OpenAI>();

  constructor(private config: ConfigService) {}

  private getClient(baseUrl?: string | null, apiKeyEnv?: string | null): OpenAI {
    const envName = apiKeyEnv?.trim() || 'OPENAI_API_KEY';
    const key = this.config.get<string>(envName);
    if (!key) {
      throw new Error(`${envName} تنظیم نشده است`);
    }
    const cacheKey = `${baseUrl ?? 'default'}:${envName}`;
    let client = this.clients.get(cacheKey);
    if (!client) {
      client = new OpenAI({
        apiKey: key,
        ...(baseUrl ? { baseURL: baseUrl.replace(/\/$/, '') } : {}),
      });
      this.clients.set(cacheKey, client);
    }
    return client;
  }

  async *streamChat(
    { apiModelName, apiBaseUrl, apiKeyEnv }: ModelStreamConfig,
    messages: ChatMessage[],
  ): AsyncGenerator<StreamChunk, CompletionResult, undefined> {
    const client = this.getClient(apiBaseUrl, apiKeyEnv);
    const stream = await client.chat.completions.create({
      model: apiModelName,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: true,
      stream_options: { include_usage: true },
    });

    let content = '';
    let tokenIn = 0;
    let tokenOut = 0;

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content ?? '';
      if (delta) {
        content += delta;
        yield { delta };
      }
      if (chunk.usage) {
        tokenIn = chunk.usage.prompt_tokens ?? tokenIn;
        tokenOut = chunk.usage.completion_tokens ?? tokenOut;
      }
    }

    if (!tokenIn && !tokenOut) {
      tokenOut = Math.ceil(content.length / 4);
      tokenIn = Math.ceil(
        messages.reduce((s, m) => s + m.content.length, 0) / 4,
      );
    }

    return { content, tokenIn, tokenOut };
  }

  async completeChat(
    { apiModelName, apiBaseUrl, apiKeyEnv }: ModelStreamConfig,
    messages: ChatMessage[],
    options?: CompleteOptions,
  ): Promise<CompletionResult> {
    const client = this.getClient(apiBaseUrl, apiKeyEnv);
    const res = await client.chat.completions.create({
      model: apiModelName,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: options?.maxTokens ?? 512,
      temperature: options?.temperature ?? 0.2,
    });
    const content = res.choices[0]?.message?.content ?? '';
    const tokenIn = res.usage?.prompt_tokens ?? 0;
    const tokenOut = res.usage?.completion_tokens ?? 0;
    return { content, tokenIn, tokenOut };
  }
}