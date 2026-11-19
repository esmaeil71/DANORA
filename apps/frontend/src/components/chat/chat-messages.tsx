import { Bot, User } from "lucide-react";
import type { ProductOffer } from "@/lib/shop-types";
import { ShopProductGrid } from "@/components/shop/shop-product-grid";
import { ChatMessageBody } from "./chat-message-body";

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
    <div className="chat-thread" role="log" aria-live="polite" aria-relevant="additions">
      {messages.map((m) =>
        m.role === "user" ? (
          <article
            key={m.id}
            className="chat-row chat-row--user"
            aria-label="پیام شما"
          >
            <span className="chat-avatar chat-avatar--user" aria-hidden>
              <User className="size-4" />
            </span>
            <div className="chat-user-bubble">
              <ChatMessageBody content={m.content} variant="user" />
            </div>
          </article>
        ) : (
          <article
            key={m.id}
            className="chat-row chat-row--assistant"
            aria-label="پاسخ دستیار"
          >
            <span className="chat-avatar chat-avatar--assistant" aria-hidden>
              <Bot className="size-4" />
            </span>
            <div className="chat-assistant-block min-w-0 flex-1">
              <div className="chat-assistant-surface">
                {m.content.trim() ? (
                  <ChatMessageBody content={m.content} variant="assistant" />
                ) : m.streaming ? (
                  <p className="chat-msg-streaming" role="status">
                    <span className="chat-msg-streaming-dot" aria-hidden />
                    در حال نوشتن…
                  </p>
                ) : null}
              </div>
              {m.products && m.products.length > 0 && (
                <div className="chat-shop-embed shop-light">
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