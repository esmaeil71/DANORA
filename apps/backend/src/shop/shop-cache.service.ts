import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { ProductOffer, ShopIntent } from '@danora/shared';
import { RedisService } from '../redis/redis.service';
import { ShopConfigService } from './shop-config.service';

@Injectable()
export class ShopCacheService {
  constructor(
    private redis: RedisService,
    private config: ShopConfigService,
  ) {}

  private key(intent: ShopIntent, providers: string[]): string {
    const payload = JSON.stringify({ intent, providers });
    const hash = createHash('sha256').update(payload).digest('hex').slice(0, 32);
    return `shop:search:${hash}`;
  }

  async get(
    intent: ShopIntent,
    providers: string[],
  ): Promise<ProductOffer[] | null> {
    try {
      await this.redis.client.connect();
      const raw = await this.redis.client.get(this.key(intent, providers));
      if (!raw) return null;
      return JSON.parse(raw) as ProductOffer[];
    } catch {
      return null;
    }
  }

  async set(
    intent: ShopIntent,
    providers: string[],
    products: ProductOffer[],
  ): Promise<void> {
    try {
      await this.redis.client.connect();
      await this.redis.client.setex(
        this.key(intent, providers),
        this.config.cacheTtlSec(),
        JSON.stringify(products),
      );
    } catch {
      /* optional */
    }
  }
}