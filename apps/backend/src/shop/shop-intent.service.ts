import { Injectable, Logger } from '@nestjs/common';
import { ChatMessage, ShopIntent } from '@danora/shared';
import { ModelRouterService } from '../model-router/model-router.service';

const INTENT_PROMPT = `تو یک parser جستجوی فروشگاه آنلاین هستی. فقط JSON معتبر برگردان، بدون markdown.
فیلدها:
- query: عبارت جستجوی فارسی کوتاه (اسم کالا)
- maxPriceToman: عدد تومان سقف قیمت (اختیاری)
- minPriceToman: عدد (اختیاری)
- sort: یکی از relevance | price_asc | price_desc

مثال ورودی: "کفش ورزشی تا ۲ میلیون"
خروجی: {"query":"کفش ورزشی","maxPriceToman":2000000,"sort":"relevance"}`;

@Injectable()
export class ShopIntentService {
  private readonly logger = new Logger(ShopIntentService.name);

  constructor(private router: ModelRouterService) {}

  async extract(
    userMessage: string,
    modelId: string,
  ): Promise<ShopIntent> {
    try {
      const messages: ChatMessage[] = [
        { role: 'system', content: INTENT_PROMPT },
        { role: 'user', content: userMessage },
      ];
      const result = await this.router.completeChat(modelId, messages, {
        maxTokens: 256,
        temperature: 0.1,
      });
      const parsed = this.parseJson(result.content);
      if (parsed?.query?.trim()) {
        return this.normalize(parsed);
      }
    } catch (e) {
      this.logger.warn(`intent LLM failed: ${e instanceof Error ? e.message : e}`);
    }
    return this.fallback(userMessage);
  }

  private parseJson(text: string): Partial<ShopIntent> | null {
    const trimmed = text.trim();
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    const raw = fenced ? fenced[1].trim() : trimmed;
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start < 0 || end <= start) return null;
    try {
      return JSON.parse(raw.slice(start, end + 1)) as Partial<ShopIntent>;
    } catch {
      return null;
    }
  }

  private normalize(partial: Partial<ShopIntent>): ShopIntent {
    return {
      query: partial.query!.trim(),
      maxPriceToman: this.num(partial.maxPriceToman),
      minPriceToman: this.num(partial.minPriceToman),
      sort: partial.sort ?? 'relevance',
    };
  }

  private num(v: unknown): number | undefined {
    if (v == null) return undefined;
    const n = typeof v === 'number' ? v : Number(String(v).replace(/[^\d.]/g, ''));
    return Number.isFinite(n) && n > 0 ? Math.round(n) : undefined;
  }

  private fallback(message: string): ShopIntent {
    let maxPriceToman: number | undefined;
    const millionMatch = message.match(
      /تا\s*([\d۰-۹]+(?:\.[\d۰-۹]+)?)\s*میلیون/i,
    );
    if (millionMatch) {
      maxPriceToman = Math.round(this.parseFaNumber(millionMatch[1]) * 1_000_000);
    }
    const tomanMatch = message.match(/تا\s*([\d۰-۹,]+)\s*تومان/i);
    if (!maxPriceToman && tomanMatch) {
      maxPriceToman = this.parseFaNumber(tomanMatch[1].replace(/,/g, ''));
    }

    const query = message
      .replace(/تا\s*[\d۰-۹,\.]+\s*(میلیون|تومان)/gi, '')
      .replace(/می‌?خوام|میخوام|می خوام/gi, '')
      .trim();

    return {
      query: query || message.trim(),
      maxPriceToman,
      sort: 'relevance',
    };
  }

  private parseFaNumber(s: string): number {
    const map: Record<string, string> = {
      '۰': '0',
      '۱': '1',
      '۲': '2',
      '۳': '3',
      '۴': '4',
      '۵': '5',
      '۶': '6',
      '۷': '7',
      '۸': '8',
      '۹': '9',
    };
    const normalized = s.replace(/[۰-۹]/g, (d) => map[d] ?? d);
    return Number(normalized);
  }
}