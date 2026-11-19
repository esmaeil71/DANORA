import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ProductOffer, ShopIntent } from '@danora/shared';
import { MarketplaceProvider } from './marketplace.interface';

@Injectable()
export class DigikalaProvider implements MarketplaceProvider {
  readonly id = 'digikala' as const;
  readonly label = 'دیجی‌کالا';

  constructor(private config: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(this.config.get<string>('DIGIKALA_OPEN_API_KEY')?.trim());
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
    const key = this.config.get<string>('DIGIKALA_OPEN_API_KEY')?.trim();
    const base = (
      this.config.get<string>('DIGIKALA_OPEN_API_BASE') ??
      'https://api.digikala.com/v1'
    ).replace(/\/$/, '');

    if (!key) {
      if (this.config.get('NODE_ENV') === 'production') {
        return [];
      }
      return this.mockProducts(intent, limit);
    }

    try {
      const url = new URL(`${base}/search/`);
      url.searchParams.set('q', intent.query);
      url.searchParams.set('page', '1');

      const res = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'X-API-Key': key,
        },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return [];
      const data = (await res.json()) as {
        data?: {
          products?: Array<{
            id?: number;
            title_fa?: string;
            url?: { uri?: string };
            images?: { main?: { url?: string[] } };
            default_variant?: {
              price?: { selling_price?: number };
              in_stock?: boolean;
            };
            rating?: { rate?: number };
          }>;
        };
      };

      const rows = data.data?.products ?? [];
      return rows.slice(0, limit).map((p, i) => {
        const priceRial = p.default_variant?.price?.selling_price ?? 0;
        const priceToman = Math.round(priceRial / 10);
        const path = p.url?.uri ?? '';
        const productUrl = path.startsWith('http')
          ? path
          : `https://www.digikala.com${path}`;
        return {
          id: `digikala-${p.id ?? i}`,
          marketplace: 'digikala' as const,
          title: p.title_fa ?? 'محصول',
          priceToman: priceToman || 0,
          imageUrl: p.images?.main?.url?.[0],
          productUrl,
          rating: p.rating?.rate,
          inStock: p.default_variant?.in_stock,
        } satisfies ProductOffer;
      });
    } catch {
      return [];
    }
  }

  private mockProducts(intent: ShopIntent, limit: number): ProductOffer[] {
    const base = intent.maxPriceToman ?? 5_000_000;
    return Array.from({ length: Math.min(limit, 4) }).map((_, i) => ({
      id: `digikala-mock-${i}`,
      marketplace: 'digikala' as const,
      title: `${intent.query} — نمونه دیجی‌کالا ${i + 1}`,
      priceToman: Math.round(base * (0.5 + i * 0.1)),
      imageUrl: undefined,
      productUrl: `https://www.digikala.com/search/?q=${encodeURIComponent(intent.query)}`,
      inStock: true,
    }));
  }
}