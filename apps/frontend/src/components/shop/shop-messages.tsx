import { Bot, ShoppingBag, User } from "lucide-react";
import type { ProductOffer } from "@/lib/shop-types";
import { ChatMessageBody } from "@/components/chat/chat-message-body";
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
    <div className="chat-thread">
      {messages.map((m) =>
        m.role === "user" ? (
          <article key={m.id} className="chat-row chat-row--user">
            <span className="chat-avatar chat-avatar--user" aria-hidden>
              <User className="size-4 text-[var(--shop-muted)]" />
            </span>
            <div className="chat-user-bubble bg-[var(--shop-user)] border-[var(--shop-border)]">
              <ChatMessageBody content={m.content} variant="user" />
            </div>
          </article>
        ) : (
          <article key={m.id} className="chat-row chat-row--assistant">
            <span
              className="chat-avatar bg-[var(--shop-accent-soft)] text-[var(--shop-accent)]"
              aria-hidden
            >
              <Bot className="size-4" />
            </span>
            <div className="chat-assistant-block flex-1 min-w-0">
              <div className="chat-assistant-surface">
                {m.content.trim() ? (
                  <ChatMessageBody content={m.content} variant="assistant" />
                ) : m.streaming ? (
                  <p className="chat-msg-streaming text-[var(--shop-muted)]">
                    <span className="chat-msg-streaming-dot bg-[var(--shop-accent)]" />
                    در حال آماده‌سازی…
                  </p>
                ) : null}
              </div>
              {m.products && m.products.length > 0 && (
                <div className="chat-shop-embed border-[var(--shop-border)] bg-[var(--shop-surface)]">
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
          </article>
        ),
      )}
    </div>
  );
}