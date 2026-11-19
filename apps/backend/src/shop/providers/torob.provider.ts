import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ProductOffer, ShopIntent } from '@danora/shared';
import { MarketplaceProvider } from './marketplace.interface';

@Injectable()
export class TorobProvider implements MarketplaceProvider {
  readonly id = 'torob' as const;
  readonly label = 'ترب';

  constructor(private config: ConfigService) {}

  isConfigured(): boolean {
    return true;
  }

  async ping(): Promise<{ ok: boolean; message?: string }> {
    try {
      const items = await this.search({ query: 'ماوس' }, 1);
      return { ok: items.length > 0, message: items.length ? undefined : 'نتیجه خالی' };
    } catch (e) {
      return { ok: false, message: e instanceof Error ? e.message : 'خطا' };
    }
  }

  async search(intent: ShopIntent, limit = 12): Promise<ProductOffer[]> {
    const base = (
      this.config.get<string>('TOROB_API_URL') ??
      'https://api.torob.com/v4/base-product/search/'
    ).replace(/\/$/, '');

    try {
      const url = new URL(`${base}/`);
      url.searchParams.set('query', intent.query);
      url.searchParams.set('page', '1');
      url.searchParams.set('size', String(Math.min(limit, 24)));
      url.searchParams.set('sort', 'popularity');

      const key = this.config.get<string>('TOROB_API_KEY')?.trim();
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (key) headers.Authorization = `Bearer ${key}`;

      const res = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) {
        if (this.config.get('NODE_ENV') !== 'production') {
          return this.mockProducts(intent, limit);
        }
        return [];
      }

      const data = (await res.json()) as {
        results?: Array<Record<string, unknown>>;
      };

      const rows = data.results ?? [];
      return rows.slice(0, limit).map((row, i) => this.mapRow(row, i));
    } catch {
      if (this.config.get('NODE_ENV') !== 'production') {
        return this.mockProducts(intent, limit);
      }
      return [];
    }
  }

  private mapRow(row: Record<string, unknown>, i: number): ProductOffer {
    const title =
      (row.name1 as string) ??
      (row.name as string) ??
      (row.title as string) ??
      'محصول';
    const priceRaw =
      (row.price as number) ??
      (row.price_text as string | number) ??
      (row.shop_list as Array<{ price?: number }> | undefined)?.[0]?.price ??
      0;
    const priceToman = this.toToman(priceRaw);
    const randomKey = (row.random_key as string) ?? String(row.id ?? i);
    const webUrl =
      (row.web_client_absolute_url as string) ??
      (row.more_info_url as string) ??
      `https://torob.com/search/?query=${encodeURIComponent(title)}`;
    const imageUrl =
      (row.image_url as string) ??
      (row.image as string) ??
      (row.media_urls as string[] | undefined)?.[0];

    return {
      id: `torob-${randomKey}`,
      marketplace: 'torob',
      title,
      priceToman,
      imageUrl,
      productUrl: webUrl.startsWith('http')
        ? webUrl
        : `https://torob.com${webUrl}`,
      inStock: true,
    };
  }

  private toToman(value: string | number): number {
    if (typeof value === 'number') {
      return value > 1_000_000 ? Math.round(value / 10) : value;
    }
    const digits = value.replace(/[^\d]/g, '');
    const n = Number(digits);
    return Number.isFinite(n) ? n : 0;
  }

  private mockProducts(intent: ShopIntent, limit: number): ProductOffer[] {
    const base = intent.maxPriceToman ?? 4_000_000;
    return Array.from({ length: Math.min(limit, 4) }).map((_, i) => ({
      id: `torob-mock-${i}`,
      marketplace: 'torob' as const,
      title: `${intent.query} — پیشنهاد ترب ${i + 1}`,
      priceToman: Math.round(base * (0.45 + i * 0.12)),
      productUrl: `https://torob.com/search/?query=${encodeURIComponent(intent.query)}`,
      inStock: true,
    }));
  }
}