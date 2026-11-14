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

export interface ProviderAdapter {
  provider: ModelProvider;
  streamChat(
    apiModelName: string,
    messages: ChatMessage[],
  ): AsyncGenerator<StreamChunk, CompletionResult, undefined>;
}