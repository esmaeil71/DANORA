import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatCompletionDto } from './dto/chat.dto';
import { ChatService } from './chat.service';

type AuthRequest = Request & {
  user: { id: string; email: string; plan: string; suspended?: boolean };
};

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chat: ChatService) {}

  @Post('completions')
  async completions(
    @Req() req: AuthRequest,
    @Body() dto: ChatCompletionDto,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const send = (data: object) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      if (req.user.suspended) {
        throw new ForbiddenException('حساب کاربری مسدود شده است');
      }
      const conversation = await this.chat.prepareConversation(
        req.user.id,
        dto.conversationId,
        dto.modelId,
        req.user.plan,
      );

      const history = await this.chat.loadHistory(conversation.id);
      await this.chat.saveUserMessage(conversation.id, dto.message);

      const messages = [
        ...history,
        { role: 'user' as const, content: dto.message },
      ];

      if (!dto.conversationId && history.length === 0) {
        await this.chat.maybeSetTitle(conversation.id, dto.message);
      }

      const gen = this.chat.stream(conversation.modelId, messages);
      let result = await gen.next();

      while (!result.done) {
        send({ type: 'delta', delta: result.value.delta });
        result = await gen.next();
      }

      const completion = result.value;
      const assistant = await this.chat.saveAssistantMessage(
        conversation.id,
        completion.content,
        completion.tokenIn,
        completion.tokenOut,
      );

      await this.chat.recordUsage(
        req.user.id,
        completion.tokenIn,
        completion.tokenOut,
      );

      send({
        type: 'done',
        conversationId: conversation.id,
        messageId: assistant.id,
        tokenIn: completion.tokenIn,
        tokenOut: completion.tokenOut,
      });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'خطای ناشناخته در پردازش چت';
      send({ type: 'error', message });
    }

    res.end();
  }
}