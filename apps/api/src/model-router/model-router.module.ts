import { Module } from '@nestjs/common';
import { AnthropicAdapter } from './adapters/anthropic.adapter';
import { GoogleAdapter } from './adapters/google.adapter';
import { OpenAiAdapter } from './adapters/openai.adapter';
import { ModelRouterService } from './model-router.service';

@Module({
  providers: [
    OpenAiAdapter,
    AnthropicAdapter,
    GoogleAdapter,
    ModelRouterService,
  ],
  exports: [ModelRouterService],
})
export class ModelRouterModule {}