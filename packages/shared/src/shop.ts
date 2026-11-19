export type MarketplaceId = 'digikala' | 'torob' | 'snapp';

export type ShopSort = 'relevance' | 'price_asc' | 'price_desc';

export interface ShopIntent {
  query: string;
  maxPriceToman?: number;
  minPriceToman?: number;
  sort?: ShopSort;
}

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

export interface ShopSearchMetadata {
  products: ProductOffer[];
  intent?: ShopIntent;
  fetchedAt: string;
  providerNotes?: Partial<Record<MarketplaceId, string>>;
}

export interface SseProductsEvent {
  type: 'products';
  products: ProductOffer[];
  fetchedAt: string;
  intent?: ShopIntent;
  providerNotes?: Partial<Record<MarketplaceId, string>>;
}

export interface SseConversationMetaEvent {
  type: 'conversation';
  conversationId: string;
  title?: string;
  modelId?: string;
  updatedAt?: string;
  kind?: 'chat' | 'shop';
}

export interface ShopProviderInfo {
  id: MarketplaceId;
  label: string;
  enabled: boolean;
  configured: boolean;
}