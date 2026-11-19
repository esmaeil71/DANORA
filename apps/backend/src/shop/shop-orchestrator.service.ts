import { Injectable } from '@nestjs/common';
import type {
  MarketplaceId,
  ProductOffer,
  ShopIntent,
  ShopSearchMetadata,
} from '@danora/shared';
import { ChatMessage } from '@danora/shared';
import { ModelRouterService } from '../model-router/model-router.service';
import { ShopCacheService } from './shop-cache.service';
import { ShopConfigService } from './shop-config.service';
import { ShopIntentService } from './shop-intent.service';
import { ShopRankingService } from './shop-ranking.service';
import { DigikalaProvider } from './providers/digikala.provider';
import { TorobProvider } from './providers/torob.provider';
import { MarketplaceProvider } from './providers/marketplace.interface';

@Injectable()
export class ShopOrchestratorService {
  private providers: MarketplaceProvider[];

  constructor(
    private intent: ShopIntentService,
    private ranking: ShopRankingService,
    private cache: ShopCacheService,
    private config: ShopConfigService,
    digikala: DigikalaProvider,
    torob: TorobProvider,
    private router: ModelRouterService,
  ) {
    this.providers = [digikala, torob];
  }

  getProviderMap(): Record<MarketplaceId, boolean> {
    return {
      digikala: this.providers.find((p) => p.id === 'digikala')!.isConfigured(),
      torob: true,
      snapp: false,
    };
  }

  async runSearch(
    userMessage: string,
    modelId: string,
  ): Promise<{
    intent: ShopIntent;
    products: ProductOffer[];
    metadata: ShopSearchMetadata;
  }> {
    const shopIntent = await this.intent.extract(userMessage, modelId);
    const active = await this.activeProviders();
    const providerIds = active.map((p) => p.id);

    let products = await this.cache.get(shopIntent, providerIds);
    const providerNotes: Partial<Record<MarketplaceId, string>> = {};

    if (!products) {
      const lists = await Promise.all(
        active.map(async (p) => {
          try {
            const list = await p.search(shopIntent, 12);
            if (!list.length) {
              providerNotes[p.id] = 'نتیجه‌ای برنگشت';
            }
            return list;
          } catch (e) {
            providerNotes[p.id] =
              e instanceof Error ? e.message : 'خطای جستجو';
            return [];
          }
        }),
      );
      products = this.ranking.merge(lists, shopIntent, 24);
      if (products.length) {
        await this.cache.set(shopIntent, providerIds, products);
      }
    }

    const fetchedAt = new Date().toISOString();
    const metadata: ShopSearchMetadata = {
      products,
      intent: shopIntent,
      fetchedAt,
      providerNotes: Object.keys(providerNotes).length
        ? providerNotes
        : undefined,
    };

    return { intent: shopIntent, products, metadata };
  }

  async *streamSummary(
    modelId: string,
    userMessage: string,
    products: ProductOffer[],
    intent: ShopIntent,
  ) {
    const top = products.slice(0, 10);
    const list = top
      .map(
        (p, i) =>
          `${i + 1}. ${p.title} — ${p.priceToman.toLocaleString('fa-IR')} تومان (${p.marketplace})`,
      )
      .join('\n');

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content:
          'به فارسی و مختصر توضیح بده چه محصولاتی پیدا شد و چطور انتخاب کنند. از لیست استفاده کن. لینک نساز.',
      },
      {
        role: 'user',
        content: `درخواست کاربر: ${userMessage}\nجستجو: ${intent.query}\n\nمحصولات:\n${list || '(خالی)'}`,
      },
    ];

    return yield* this.router.streamChat(modelId, messages);
  }

  async listProviders() {
    return this.config.listProviders(this.getProviderMap());
  }

  async setProviderEnabled(id: MarketplaceId, enabled: boolean) {
    await this.config.setProviderEnabled(id, enabled);
  }

  async healthCheck() {
    const disabled = await this.config.getDisabled();
    const results = await Promise.all(
      this.providers.map(async (p) => ({
        id: p.id,
        label: p.label,
        enabled: !disabled.has(p.id),
        configured: p.isConfigured(),
        ...(await p.ping()),
      })),
    );
    return results;
  }

  private async activeProviders(): Promise<MarketplaceProvider[]> {
    const disabled = await this.config.getDisabled();
    const allowed = new Set(this.config.allProviderIds());
    return this.providers.filter(
      (p) => allowed.has(p.id) && !disabled.has(p.id),
    );
  }
}