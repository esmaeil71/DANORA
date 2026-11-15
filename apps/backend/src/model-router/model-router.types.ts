import { ChatMessage } from '@danora/shared';
import { ModelProvider } from '@prisma/client';

export interface StreamChunk {
  delta: string;
}

export interface CompletionResult {
  content: string;
  tokenIn: number;
  tokenOut: number;
}

export interface ModelStreamConfig {
  apiModelName: string;
  apiBaseUrl?: string | null;
  apiKeyEnv?: string | null;
}

export interface ProviderAdapter {
  provider: ModelProvider;
  streamChat(
    config: ModelStreamConfig,
    messages: ChatMessage[],
  ): AsyncGenerator<StreamChunk, CompletionResult, undefined>;
}