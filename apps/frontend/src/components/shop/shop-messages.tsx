import { Bot, ShoppingBag, User } from "lucide-react";
import type { ProductOffer } from "@/lib/shop-types";
import { ShopProductGrid } from "./shop-product-grid";

export type ShopMsg = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  streaming?: boolean;
  products?: ProductOffer[];
  fetchedAt?: string;
};

export function ShopMessages({ messages }: { messages: ShopMsg[] }) {
  return (
    <div className="flex flex-col gap-8 py-6">
      {messages.map((m) =>
        m.role === "user" ? (
          <div key={m.id} className="flex justify-start">
            <div className="flex gap-3 max-w-[85%] flex-row-reverse items-start">
              <div className="rounded-2xl rounded-tr-md bg-[var(--shop-user)] px-4 py-2.5 text-sm leading-7 whitespace-pre-wrap">
                {m.content}
              </div>
              <span className="shrink-0 size-8 rounded-lg bg-[var(--shop-surface-hover)] flex items-center justify-center">
                <User className="size-4 text-[var(--shop-muted)]" aria-hidden />
              </span>
            </div>
          </div>
        ) : (
          <div key={m.id} className="space-y-4 max-w-3xl w-full">
            <div className="flex gap-3">
              <span className="shrink-0 size-8 rounded-lg bg-[var(--shop-accent-soft)] flex items-center justify-center">
                <Bot className="size-4 text-[var(--shop-accent)]" aria-hidden />
              </span>
              <div className="flex-1 text-sm leading-7 whitespace-pre-wrap text-[var(--shop-text)]">
                {m.content || (m.streaming ? (
                  <span className="text-[var(--shop-muted)]">در حال آماده‌سازی…</span>
                ) : (
                  ""
                ))}
              </div>
            </div>
            {m.products && m.products.length > 0 && (
              <div className="pr-11">
                <div className="flex items-center gap-2 text-xs text-[var(--shop-muted)] mb-2">
                  <ShoppingBag className="size-4" aria-hidden />
                  نتایج از فروشگاه‌های متصل
                </div>
                <ShopProductGrid
                  products={m.products}
                  fetchedAt={m.fetchedAt}
                />
              </div>
            )}
          </div>
        ),
      )}
    </div>
  );
}