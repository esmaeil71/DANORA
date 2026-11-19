"use client";

import { Bot, User } from "lucide-react";
import type { ProductOffer } from "@/lib/shop-types";
import { ShopProductGrid } from "@/components/shop/shop-product-grid";

type Msg = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  streaming?: boolean;
  products?: ProductOffer[];
  fetchedAt?: string;
};

export function ChatMessages({ messages }: { messages: Msg[] }) {
  return (
    <div className="flex flex-col gap-6 py-6">
      {messages.map((m) =>
        m.role === "user" ? (
          <div key={m.id} className="flex justify-start">
            <div className="flex gap-3 max-w-[85%] sm:max-w-2xl flex-row-reverse items-start">
              <div className="rounded-2xl rounded-tr-md bg-[var(--chat-user)] px-4 py-2.5 text-sm leading-7 whitespace-pre-wrap text-[var(--chat-text)]">
                {m.content}
              </div>
              <span className="shrink-0 size-8 rounded-lg bg-[var(--chat-surface-hover)] flex items-center justify-center mt-0.5">
                <User className="size-4 text-[var(--chat-muted)]" aria-hidden />
              </span>
            </div>
          </div>
        ) : (
          <div key={m.id} className="flex gap-3 max-w-3xl w-full">
            <span className="shrink-0 size-8 rounded-lg bg-[var(--chat-accent)]/20 flex items-center justify-center">
              <Bot className="size-4 text-[var(--chat-accent)]" aria-hidden />
            </span>
            <div className="flex-1 min-w-0 space-y-4">
              <div className="text-sm leading-7 whitespace-pre-wrap text-[var(--chat-text)]">
                {m.content || (m.streaming ? (
                  <span className="inline-flex gap-1 text-[var(--chat-muted)]">
                    <span className="animate-pulse">در حال نوشتن</span>
                    <span className="animate-bounce">…</span>
                  </span>
                ) : (
                  ""
                ))}
              </div>
              {m.products && m.products.length > 0 && (
                <div className="shop-light rounded-xl p-3 border border-[var(--chat-border)]">
                  <ShopProductGrid
                    products={m.products}
                    fetchedAt={m.fetchedAt}
                  />
                </div>
              )}
            </div>
          </div>
        ),
      )}
    </div>
  );
}