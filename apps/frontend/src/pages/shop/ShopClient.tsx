import type { MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Loader2,
  MessageSquare,
  PanelRight,
  PanelRightClose,
} from "lucide-react";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatModelMenu } from "@/components/chat/chat-model-menu";
import { ShopEmptyState } from "@/components/shop/shop-empty-state";
import { ShopMessages, type ShopMsg } from "@/components/shop/shop-messages";
import {
  api,
  ConversationRow,
  MessageRow,
  ModelRow,
  streamShop,
} from "@/lib/api";
import type { ProductOffer } from "@/lib/shop-types";
import { useUserPrefs } from "@/hooks/use-user-prefs";
import { loadUserPrefs } from "@/lib/user-prefs";
import { isPendingConversationId, titleFromUserMessage } from "@/lib/chat-title";
import "./shop-theme.css";

function mapMessages(rows: MessageRow[]): ShopMsg[] {
  return rows.map((m) => {
    const meta = m.metadata;
    return {
      id: m.id,
      role: m.role,
      content: m.content,
      products: meta?.products,
      fetchedAt: meta?.fetchedAt,
    };
  });
}

export function ShopClient() {
  const navigate = useNavigate();
  const { prefs } = useUserPrefs(true);
  const themeClass = prefs.chatTheme === "light" ? "shop-light" : "shop-dark";
  const [models, setModels] = useState<ModelRow[]>([]);
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [activeId, setActiveId] = useState<string | undefined>();
  const [messages, setMessages] = useState<ShopMsg[]>([]);
  const [modelId, setModelId] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modelOpen, setModelOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);

  const shopConversations = conversations.filter(
    (c) => c.kind === "shop" || isPendingConversationId(c.id),
  );

  const scrollDown = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await api("/auth/me");
        if (cancelled) return;
        const [modelList, convList] = await Promise.all([
          api<ModelRow[]>("/models"),
          api<ConversationRow[]>("/conversations"),
        ]);
        if (cancelled) return;
        setModels(modelList);
        setConversations(convList);
        const preferred = loadUserPrefs().defaultModelId;
        const initial =
          preferred && modelList.some((m) => m.id === preferred)
            ? preferred
            : (modelList[0]?.id ?? "");
        setModelId(initial);
      } catch {
        navigate("/login", { replace: true });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    if (messages.length) scrollDown();
  }, [messages, scrollDown]);

  useEffect(() => {
    function onDocClick(e: globalThis.MouseEvent) {
      if (
        modelMenuRef.current &&
        !modelMenuRef.current.contains(e.target as Node)
      ) {
        setModelOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  function upsertSidebarConversation(row: ConversationRow, replacePending?: boolean) {
    setConversations((list) => {
      const withoutPending = replacePending
        ? list.filter((c) => !isPendingConversationId(c.id))
        : list;
      const idx = withoutPending.findIndex((c) => c.id === row.id);
      const withKind = { ...row, kind: "shop" as const };
      if (idx >= 0) {
        const next = [...withoutPending];
        next[idx] = { ...next[idx], ...withKind };
        return next.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
      }
      return [withKind, ...withoutPending].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    });
  }

  async function loadConversation(id: string) {
    if (isPendingConversationId(id)) return;
    setActiveId(id);
    setError(null);
    const conv = conversations.find((c) => c.id === id);
    if (conv?.kind === "chat") {
      navigate(`/chat`);
      return;
    }
    if (conv) setModelId(conv.modelId);
    const msgs = await api<MessageRow[]>(`/conversations/${id}/messages`);
    setMessages(mapMessages(msgs));
  }

  function newChat() {
    abortRef.current?.abort();
    setActiveId(undefined);
    setMessages([]);
    setInput("");
    setError(null);
  }

  async function removeChat(id: string, e: MouseEvent) {
    e.stopPropagation();
    if (isPendingConversationId(id)) {
      setConversations((list) => list.filter((c) => c.id !== id));
      if (activeId === id) newChat();
      return;
    }
    await api(`/conversations/${id}`, { method: "DELETE" });
    setConversations((list) => list.filter((c) => c.id !== id));
    if (activeId === id) newChat();
  }

  async function send(messageOverride?: string) {
    const text = (messageOverride ?? input).trim();
    if (!text || !modelId || sending) return;

    setInput("");
    setSending(true);
    setError(null);

    const userMsg: ShopMsg = {
      id: `temp-u-${Date.now()}`,
      role: "user",
      content: text,
    };
    const assistantId = `temp-a-${Date.now()}`;
    const assistantMsg: ShopMsg = {
      id: assistantId,
      role: "assistant",
      content: "",
      streaming: true,
      products: [],
    };

    setMessages((m) => [...m, userMsg, assistantMsg]);
    scrollDown();

    const sidebarTitle = titleFromUserMessage(text);
    const now = new Date().toISOString();
    const requestConvId = isPendingConversationId(activeId)
      ? undefined
      : activeId;

    if (!requestConvId) {
      const pendingId = `pending-${Date.now()}`;
      setActiveId(pendingId);
      upsertSidebarConversation({
        id: pendingId,
        title: sidebarTitle,
        modelId,
        updatedAt: now,
        kind: "shop",
      });
    }

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    let lastProducts: ProductOffer[] = [];
    let fetchedAt: string | undefined;

    try {
      await streamShop(
        { conversationId: requestConvId, modelId, message: text },
        (ev) => {
          if (ev.type === "conversation" && ev.conversationId) {
            setActiveId(ev.conversationId);
            upsertSidebarConversation(
              {
                id: ev.conversationId,
                title: ev.title ?? sidebarTitle,
                modelId: ev.modelId ?? modelId,
                updatedAt: ev.updatedAt ?? now,
                kind: "shop",
              },
              true,
            );
          }
          if (ev.type === "products" && ev.products) {
            lastProducts = ev.products;
            fetchedAt = ev.fetchedAt;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? {
                      ...m,
                      products: ev.products,
                      fetchedAt: ev.fetchedAt,
                    }
                  : m,
              ),
            );
          }
          if (ev.type === "delta" && ev.delta) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: m.content + ev.delta }
                  : m,
              ),
            );
          }
          if (ev.type === "done" && ev.conversationId) {
            setActiveId(ev.conversationId);
            api<ConversationRow[]>("/conversations").then(setConversations);
          }
          if (ev.type === "error") {
            setError(ev.message ?? "خطا در جستجو");
          }
        },
        ac.signal,
      );

      if (!lastProducts.length) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, streaming: false, products: m.products ?? [] }
              : m,
          ),
        );
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  streaming: false,
                  products: lastProducts,
                  fetchedAt,
                }
              : m,
          ),
        );
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError(err instanceof Error ? err.message : "خطا");
      }
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setSending(false);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, streaming: false } : m,
        ),
      );
    }
  }

  async function logout() {
    await api("/auth/logout", { method: "POST" });
    navigate("/");
  }

  const currentModel = models.find((m) => m.id === modelId);

  if (loading) {
    return (
      <div
        className={`${themeClass} min-h-screen flex items-center justify-center gap-2 text-[var(--shop-muted)]`}
      >
        <Loader2 className="size-5 animate-spin" aria-hidden />
        در حال بارگذاری…
      </div>
    );
  }

  return (
    <div className={`${themeClass} h-[100dvh] flex overflow-hidden`}>
      <ChatSidebar
        compact={prefs.density === "compact"}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={shopConversations}
        activeId={activeId}
        onNewChat={() => {
          newChat();
          if (window.matchMedia("(max-width: 767px)").matches) {
            setSidebarOpen(false);
          }
        }}
        onSelect={loadConversation}
        onRemove={removeChat}
        onLogout={logout}
      />

      <main className="flex-1 flex flex-col min-w-0 min-h-0 bg-[var(--shop-bg)]">
        <header className="shrink-0 h-14 grid grid-cols-[1fr_auto_1fr] items-center px-3 sm:px-4 border-b border-[var(--shop-border)]">
          <div className="flex justify-start gap-2">
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-[var(--shop-muted)] hover:bg-[var(--shop-surface-hover)] cursor-pointer"
              aria-label="فهرست جستجوها"
            >
              {sidebarOpen ? (
                <PanelRightClose className="size-5" />
              ) : (
                <PanelRight className="size-5" />
              )}
            </button>
            <Link
              to="/chat"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[var(--shop-muted)] hover:text-[var(--shop-text)] px-2 min-h-11 rounded-xl hover:bg-[var(--shop-surface-hover)]"
            >
              <MessageSquare className="size-4" aria-hidden />
              چت
            </Link>
          </div>
          <div className="relative" ref={modelMenuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setModelOpen((o) => !o);
              }}
              className="inline-flex items-center gap-2 min-h-11 px-3 rounded-xl border border-[var(--shop-border)] text-sm"
            >
              <span className="text-[var(--shop-muted)]">مدل:</span>
              <span className="font-medium truncate max-w-[30vw]">
                {currentModel?.displayName ?? "—"}
              </span>
              <ChevronDown className="size-4" />
            </button>
            {modelOpen && (
              <ChatModelMenu
                models={models}
                modelId={modelId}
                onSelect={(id) => {
                  setModelId(id);
                  setModelOpen(false);
                }}
                onOpenAllModels={() => navigate("/chat/models")}
              />
            )}
          </div>
          <span className="text-xs text-[var(--shop-accent)] justify-self-end hidden sm:block">
            خرید هوشمند
          </span>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 min-h-full flex flex-col">
            {messages.length === 0 ? (
              <ShopEmptyState onPick={(t) => void send(t)} />
            ) : (
              <ShopMessages messages={messages} />
            )}
            <div ref={bottomRef} className="h-2" />
          </div>
        </div>

        {error && (
          <p className="text-center text-sm text-red-400 px-4 py-1" role="alert">
            {error}
          </p>
        )}

        <ChatComposer
          value={input}
          onChange={setInput}
          onSubmit={send}
          sending={sending}
          disabled={!modelId}
          placeholder="مثلاً: کفش رانینگ تا ۳ میلیون تومان"
          shopMode
          footerHint="نتایج از فروشگاه‌های متصل است؛ قیمت نهایی را در سایت فروشنده ببینید."
        />
      </main>
    </div>
  );
}