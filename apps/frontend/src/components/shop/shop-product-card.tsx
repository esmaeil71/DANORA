import { ExternalLink } from "lucide-react";
import type { ProductOffer } from "@/lib/shop-types";
import { MARKETPLACE_LABELS } from "@/lib/shop-types";

function formatToman(n: number) {
  return new Intl.NumberFormat("fa-IR").format(n);
}

export function ShopProductCard({ product }: { product: ProductOffer }) {
  return (
    <article className="shop-card flex flex-col h-full text-right overflow-hidden">
      <a
        href={product.productUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block aspect-[4/3] bg-[var(--shop-surface-hover)] overflow-hidden"
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt=""
            loading="lazy"
            className="size-full object-contain p-2"
          />
        ) : (
          <div className="size-full flex items-center justify-center text-xs text-[var(--shop-muted)] px-3 text-center">
            بدون تصویر
          </div>
        )}
      </a>
      <div className="flex flex-col flex-1 p-3 gap-2">
        <span className="shop-badge self-start">{MARKETPLACE_LABELS[product.marketplace]}</span>
        <h3 className="text-sm font-medium leading-6 line-clamp-2 text-[var(--shop-text)]">
          {product.title}
        </h3>
        <p className="text-base font-bold text-[var(--shop-accent)] tabular-nums">
          {formatToman(product.priceToman)}
          <span className="text-xs font-normal text-[var(--shop-muted)] mr-1">تومان</span>
        </p>
        <a
          href={product.productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shop-cta mt-auto inline-flex items-center justify-center gap-2 min-h-11 rounded-xl text-sm font-medium"
        >
          مشاهده و خرید
          <ExternalLink className="size-4" aria-hidden />
        </a>
      </div>
    </article>
  );
}