export type MarketplaceId = "digikala" | "torob" | "snapp";

export interface ProductOffer {
  id: string;
  marketplace: MarketplaceId;
  title: string;
  priceToman: number;
  imageUrl?: string;
  productUrl: string;
  rating?: number;
  inStock?: boolean;
}

export interface ShopIntent {
  query: string;
  maxPriceToman?: number;
  minPriceToman?: number;
  sort?: "relevance" | "price_asc" | "price_desc";
}

export interface ShopSearchMetadata {
  products: ProductOffer[];
  intent?: ShopIntent;
  fetchedAt: string;
  providerNotes?: Partial<Record<MarketplaceId, string>>;
}

export interface ShopProviderInfo {
  id: MarketplaceId;
  label: string;
  enabled: boolean;
  configured: boolean;
}

export const MARKETPLACE_LABELS: Record<MarketplaceId, string> = {
  digikala: "دیجی‌کالا",
  torob: "ترب",
  snapp: "اسنپ‌مارکت",
};