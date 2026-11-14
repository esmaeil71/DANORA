import { IsOptional, IsString, MinLength } from 'class-validator';

export class ChatCompletionDto {
  @IsOptional()
  @IsString()
  conversationId?: string;

  @IsString()
  modelId!: string;

  @IsString()
  @MinLength(1)
  message!: string;
}