import { useMemo, useState } from "react";
import type { MarketplaceId, ProductOffer } from "@/lib/shop-types";
import { ShopProductCard } from "./shop-product-card";

export function ShopProductGrid({
  products,
  fetchedAt,
}: {
  products: ProductOffer[];
  fetchedAt?: string;
}) {
  const [market, setMarket] = useState<MarketplaceId | "all">("all");
  const [sort, setSort] = useState<"relevance" | "price_asc" | "price_desc">(
    "relevance",
  );

  const filtered = useMemo(() => {
    let list = [...products];
    if (market !== "all") {
      list = list.filter((p) => p.marketplace === market);
    }
    if (sort === "price_asc") {
      list.sort((a, b) => a.priceToman - b.priceToman);
    } else if (sort === "price_desc") {
      list.sort((a, b) => b.priceToman - a.priceToman);
    }
    return list;
  }, [products, market, sort]);

  if (!products.length) return null;

  const fetchedLabel = fetchedAt
    ? new Intl.DateTimeFormat("fa-IR", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(fetchedAt))
    : null;

  return (
    <div className="space-y-3 w-full">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--shop-muted)]">
        <span>{filtered.length} پیشنهاد</span>
        {fetchedLabel && <span>به‌روزرسانی: {fetchedLabel}</span>}
      </div>
      <div className="flex flex-wrap gap-2" role="toolbar" aria-label="فیلتر نتایج">
        {(
          [
            ["all", "همه"],
            ["digikala", "دیجی‌کالا"],
            ["torob", "ترب"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMarket(id)}
            className={`shop-pill ${market === id ? "shop-pill-active" : ""}`}
          >
            {label}
          </button>
        ))}
        <select
          value={sort}
          onChange={(e) =>
            setSort(e.target.value as typeof sort)
          }
          className="shop-select text-xs min-h-9 rounded-full px-3"
          aria-label="مرتب‌سازی قیمت"
        >
          <option value="relevance">مرتب‌سازی پیش‌فرض</option>
          <option value="price_asc">ارزان‌ترین</option>
          <option value="price_desc">گران‌ترین</option>
        </select>
      </div>
      <p className="text-[11px] text-[var(--shop-muted)] leading-relaxed">
        قیمت و موجودی در سایت فروشنده ممکن است متفاوت باشد.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((p) => (
          <ShopProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}