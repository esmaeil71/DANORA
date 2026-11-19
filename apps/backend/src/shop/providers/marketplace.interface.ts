import type { ProductOffer, ShopIntent } from '@danora/shared';

export interface MarketplaceProvider {
  readonly id: ProductOffer['marketplace'];
  readonly label: string;
  isConfigured(): boolean;
  search(intent: ShopIntent, limit?: number): Promise<ProductOffer[]>;
  ping(): Promise<{ ok: boolean; message?: string }>;
}