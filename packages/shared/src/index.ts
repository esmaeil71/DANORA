export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

export type ModelProvider = 'openai' | 'anthropic' | 'google';

export interface ModelInfo {
  id: string;
  provider: ModelProvider;
  displayName: string;
  apiModelName: string;
}

export interface SseDeltaEvent {
  type: 'delta';
  delta: string;
}

export interface SseDoneEvent {
  type: 'done';
  conversationId: string;
  messageId: string;
  tokenIn?: number;
  tokenOut?: number;
}

export interface SseErrorEvent {
  type: 'error';
  message: string;
}

export type SseChatEvent = SseDeltaEvent | SseDoneEvent | SseErrorEvent;

export interface ConversationDto {
  id: string;
  title: string;
  modelId: string;
  updatedAt: string;
}

export interface MessageDto {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}