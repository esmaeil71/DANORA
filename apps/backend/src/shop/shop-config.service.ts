import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { MarketplaceId, ShopProviderInfo } from '@danora/shared';
import { RedisService } from '../redis/redis.service';

const DISABLED_KEY = 'shop:providers:disabled';

const LABELS: Record<MarketplaceId, string> = {
  digikala: 'دیجی‌کالا',
  torob: 'ترب',
  snapp: 'اسنپ‌مارکت',
};

@Injectable()
export class ShopConfigService {
  constructor(
    private config: ConfigService,
    private redis: RedisService,
  ) {}

  allProviderIds(): MarketplaceId[] {
    const raw =
      this.config.get<string>('SHOP_PROVIDERS_ENABLED') ?? 'digikala,torob';
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter((s): s is MarketplaceId =>
        ['digikala', 'torob', 'snapp'].includes(s),
      );
  }

  async getDisabled(): Promise<Set<MarketplaceId>> {
    try {
      await this.redis.client.connect();
      const members = await this.redis.client.smembers(DISABLED_KEY);
      return new Set(
        members.filter((m): m is MarketplaceId =>
          ['digikala', 'torob', 'snapp'].includes(m),
        ),
      );
    } catch {
      return new Set();
    }
  }

  async setProviderEnabled(id: MarketplaceId, enabled: boolean): Promise<void> {
    try {
      await this.redis.client.connect();
      if (enabled) {
        await this.redis.client.srem(DISABLED_KEY, id);
      } else {
        await this.redis.client.sadd(DISABLED_KEY, id);
      }
    } catch {
      /* redis optional */
    }
  }

  async listProviders(configured: Record<MarketplaceId, boolean>): Promise<ShopProviderInfo[]> {
    const disabled = await this.getDisabled();
    return this.allProviderIds().map((id) => ({
      id,
      label: LABELS[id],
      enabled: !disabled.has(id),
      configured: configured[id] ?? false,
    }));
  }

  cacheTtlSec(): number {
    const n = Number(this.config.get('SHOP_CACHE_TTL_SEC') ?? 900);
    return Number.isFinite(n) && n > 0 ? n : 900;
  }
}