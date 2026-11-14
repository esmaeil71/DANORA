import { Module } from '@nestjs/common';
import { ConversationsModule } from '../conversations/conversations.module';
import { ModelRouterModule } from '../model-router/model-router.module';
import { UsageModule } from '../usage/usage.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [ModelRouterModule, UsageModule, ConversationsModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}