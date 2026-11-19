import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ShopCompletionDto } from './dto/shop.dto';
import { ShopOrchestratorService } from './shop-orchestrator.service';
import { ShopService } from './shop.service';

type AuthRequest = Request & {
  user: { id: string; email: string; plan: string; suspended?: boolean };
};

@Controller('shop')
@UseGuards(JwtAuthGuard)
export class ShopController {
  constructor(
    private shop: ShopService,
    private orchestrator: ShopOrchestratorService,
  ) {}

  @Get('providers')
  listProviders() {
    return this.orchestrator.listProviders();
  }

  @Post('completions')
  async completions(
    @Req() req: AuthRequest,
    @Body() dto: ShopCompletionDto,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const send = (data: object) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    let conversationId: string | undefined;
    try {
      if (req.user.suspended) {
        throw new ForbiddenException('حساب کاربری مسدود شده است');
      }

      const conversation = await this.shop.prepareConversation(
        req.user.id,
        dto.conversationId,
        dto.modelId,
        req.user.plan,
      );
      conversationId = conversation.id;

      await this.shop.saveUserMessage(conversation.id, dto.message);

      const { intent, products, metadata } = await this.orchestrator.runSearch(
        dto.message,
        dto.modelId,
      );

      const title = await this.shop.setTitle(conversation.id, intent.query);
      const meta = await this.shop.getConversationMeta(conversation.id);

      send({
        type: 'conversation',
        conversationId: meta.id,
        title,
        modelId: meta.modelId,
        updatedAt: meta.updatedAt,
        kind: 'shop',
      });

      send({
        type: 'products',
        products,
        fetchedAt: metadata.fetchedAt,
        intent,
        providerNotes: metadata.providerNotes,
      });

      const gen = this.orchestrator.streamSummary(
        dto.modelId,
        dto.message,
        products,
        intent,
      );
      let result = await gen.next();
      let tokenIn = 0;
      let tokenOut = 0;

      while (!result.done) {
        send({ type: 'delta', delta: result.value.delta });
        result = await gen.next();
      }

      const completion = result.value;
      tokenIn += completion.tokenIn;
      tokenOut += completion.tokenOut;

      const defaultText =
        products.length === 0
          ? 'متأسفانه محصولی با این شرایط پیدا نکردم. عبارت یا بازهٔ قیمت را تغییر دهید.'
          : `${products.length} پیشنهاد از فروشگاه‌های متصل پیدا شد. کارت‌ها را مقایسه کنید و روی «مشاهده» بزنید.`;

      const content = completion.content.trim() || defaultText;

      const assistant = await this.shop.saveAssistantMessage(
        conversation.id,
        content,
        metadata,
        tokenIn,
        tokenOut,
      );

      await this.shop.recordUsage(req.user.id, tokenIn, tokenOut);

      send({
        type: 'done',
        conversationId: conversation.id,
        messageId: assistant.id,
        tokenIn,
        tokenOut,
      });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'خطا در جستجوی خرید';
      send({
        type: 'error',
        message,
        conversationId,
      });
    } finally {
      res.end();
    }
  }
}