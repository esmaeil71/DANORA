import { Injectable } from '@nestjs/common';
import type { ProductOffer, ShopIntent } from '@danora/shared';

@Injectable()
export class ShopRankingService {
  merge(
    lists: ProductOffer[][],
    intent: ShopIntent,
    max = 24,
  ): ProductOffer[] {
    let items = lists.flat();

    if (intent.minPriceToman != null) {
      items = items.filter((p) => p.priceToman >= intent.minPriceToman!);
    }
    if (intent.maxPriceToman != null) {
      items = items.filter((p) => p.priceToman <= intent.maxPriceToman!);
    }

    const seen = new Set<string>();
    const deduped: ProductOffer[] = [];
    for (const p of items) {
      const key = this.normalizedTitle(p.title);
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(p);
    }

    const sort = intent.sort ?? 'relevance';
    if (sort === 'price_asc') {
      deduped.sort((a, b) => a.priceToman - b.priceToman);
    } else if (sort === 'price_desc') {
      deduped.sort((a, b) => b.priceToman - a.priceToman);
    }

    return deduped.slice(0, max);
  }

  private normalizedTitle(title: string): string {
    return title
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
      .slice(0, 80);
  }
}