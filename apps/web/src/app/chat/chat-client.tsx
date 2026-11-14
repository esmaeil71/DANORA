"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bot,
  Loader2,
  LogOut,
  MessageSquarePlus,
  Send,
  Settings,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  api,
  ConversationRow,
  MessageRow,
  ModelRow,
  streamChat,
  UserMe,
} from "@/lib/api";

type LocalMessage = MessageRow & { streaming?: boolean };

export function ChatClient() {
  const router = useRouter();
  const [user, setUser] = useState<UserMe | null>(null);
  const [models, setModels] = useState<ModelRow[]>([]);
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [activeId, setActiveId] = useState<string | undefined>();
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [modelId, setModelId] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollDown = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await api<UserMe>("/auth/me");
        if (cancelled) return;
        setUser(me);
        const [modelList, convList] = await Promise.all([
          api<ModelRow[]>("/models"),
          api<ConversationRow[]>("/conversations"),
        ]);
        if (cancelled) return;
        setModels(modelList);
        setConversations(convList);
        setModelId(modelList[0]?.id ?? "");
      } catch {
        router.replace("/login");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    scrollDown();
  }, [messages, scrollDown]);

  async function loadConversation(id: string) {
    setActiveId(id);
    setError(null);
    const conv = conversations.find((c) => c.id === id);
    if (conv) setModelId(conv.modelId);
    const msgs = await api<MessageRow[]>(`/conversations/${id}/messages`);
    setMessages(msgs);
  }

  async function newChat() {
    setActiveId(undefined);
    setMessages([]);
    setError(null);
    if (models[0]) setModelId(models[0].id);
  }

  async function removeChat(id: string, e: MouseEvent) {
    e.stopPropagation();
    await api(`/conversations/${id}`, { method: "DELETE" });
    setConversations((list) => list.filter((c) => c.id !== id));
    if (activeId === id) {
      setActiveId(undefined);
      setMessages([]);
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || !modelId || sending) return;

    setInput("");
    setSending(true);
    setError(null);

    const userMsg: LocalMessage = {
      id: `temp-u-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    const assistantId = `temp-a-${Date.now()}`;
    const assistantMsg: LocalMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
      streaming: true,
    };

    setMessages((m) => [...m, userMsg, assistantMsg]);
    scrollDown();

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      let conversationId = activeId;
      await streamChat(
        { conversationId, modelId, message: text },
        (ev) => {
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
            conversationId = ev.conversationId;
            setActiveId(ev.conversationId);
            api<ConversationRow[]>("/conversations").then(setConversations);
          }
          if (ev.type === "error") {
            setError(ev.message ?? "خطا در چت");
          }
        },
        ac.signal,
      );

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, streaming: false } : m,
        ),
      );
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError(err instanceof Error ? err.message : "خطا");
      }
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setSending(false);
    }
  }

  async function logout() {
    await api("/auth/logout", { method: "POST" });
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground gap-2">
        <Loader2 className="size-5 animate-spin" aria-hidden />
        در حال بارگذاری…
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col md:flex-row bg-background">
      <aside className="w-full md:w-80 border-b md:border-b-0 md:border-l border-border bg-card flex flex-col shrink-0 max-h-48 md:max-h-none">
        <div className="p-4 border-b border-border flex items-center justify-between gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-foreground cursor-pointer min-h-11"
          >
            <Sparkles className="size-5 text-primary" aria-hidden />
            دانورا
          </Link>
          <button
            type="button"
            onClick={newChat}
            aria-label="گفتگوی جدید"
            className="min-h-11 min-w-11 inline-flex items-center justify-center gap-1 px-3 rounded-lg bg-primary text-white text-sm cursor-pointer transition-opacity duration-200 hover:opacity-90"
          >
            <MessageSquarePlus className="size-4" aria-hidden />
            <span className="hidden sm:inline">جدید</span>
          </button>
        </div>
        <div
          className="flex-1 overflow-y-auto p-2 space-y-1 min-h-0"
          aria-label="فهرست گفتگوها"
        >
          {conversations.map((c) => (
            <div key={c.id} className="group relative">
              <button
                type="button"
                onClick={() => loadConversation(c.id)}
                className={`w-full text-right min-h-11 px-3 py-2 rounded-lg text-sm truncate cursor-pointer transition-colors duration-200 ${
                  activeId === c.id
                    ? "bg-muted text-foreground"
                    : "hover:bg-muted/70"
                }`}
              >
                {c.title}
              </button>
              <button
                type="button"
                aria-label={`حذف گفتگو ${c.title}`}
                onClick={(e) => removeChat(c.id, e)}
                className="absolute left-2 top-1/2 -translate-y-1/2 min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 text-muted-foreground hover:text-destructive cursor-pointer transition-opacity duration-200"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-border text-xs text-muted-foreground hidden md:block">
          <p className="truncate" dir="ltr">
            {user?.email}
          </p>
          <div className="mt-2 flex flex-col gap-1">
            <Link
              href="/settings"
              className="min-h-11 inline-flex items-center gap-2 text-primary cursor-pointer hover:underline"
            >
              <Settings className="size-4" aria-hidden />
              تنظیمات
            </Link>
            <button
              type="button"
              onClick={logout}
              className="min-h-11 inline-flex items-center gap-2 text-left cursor-pointer hover:text-foreground transition-colors duration-200"
            >
              <LogOut className="size-4" aria-hidden />
              خروج
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 min-h-0">
        <header className="min-h-14 border-b border-border flex items-center px-4 gap-4 bg-card/60">
          <label htmlFor="model-select" className="text-sm text-muted-foreground">
            مدل
          </label>
          <select
            id="model-select"
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            className="min-h-11 bg-card border border-border rounded-lg px-3 text-sm text-foreground cursor-pointer"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.displayName}
              </option>
            ))}
          </select>
        </header>

        <div
          className="flex-1 overflow-y-auto p-4 space-y-4"
          aria-live="polite"
          aria-relevant="additions"
        >
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground mt-16 max-w-md mx-auto leading-relaxed">
              <Bot className="size-10 text-primary mx-auto mb-3" aria-hidden />
              پیام خود را بنویسید. پاسخ‌ها توسط هوش مصنوعی تولید می‌شوند.
            </div>
          )}
          {messages.map((m) => (
            <article
              key={m.id}
              className={`max-w-3xl mx-auto rounded-2xl px-4 py-3 text-sm leading-7 whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-[var(--color-user-bubble)] mr-0 ml-8 sm:ml-16"
                  : "bg-[var(--color-ai-bubble)] border border-border ml-0 mr-8 sm:mr-16 shadow-sm"
              }`}
            >
              {m.role === "assistant" && (
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Bot className="size-3.5" aria-hidden />
                  پاسخ هوش مصنوعی
                </p>
              )}
              {m.content || (m.streaming ? "…" : "")}
            </article>
          ))}
          <div ref={bottomRef} />
        </div>

        {error && (
          <p className="text-destructive text-sm text-center px-4 pb-2" role="alert">
            {error}
          </p>
        )}

        <footer className="p-4 border-t border-border bg-card/40">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex gap-2 max-w-3xl mx-auto w-full items-end"
          >
            <label className="sr-only" htmlFor="chat-input">
              پیام چت
            </label>
            <textarea
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={2}
              placeholder="پیام خود را بنویسید… (Shift+Enter برای خط جدید)"
              className="flex-1 resize-none min-h-11 bg-card border border-border rounded-xl px-3 py-2.5 text-sm transition-colors duration-200 focus:border-primary"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="ارسال پیام"
              className="min-h-11 min-w-11 sm:min-w-auto sm:px-5 rounded-xl bg-accent text-white cursor-pointer transition-opacity duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {sending ? (
                <Loader2 className="size-5 animate-spin" aria-hidden />
              ) : (
                <Send className="size-5" aria-hidden />
              )}
              <span className="hidden sm:inline">ارسال</span>
            </button>
          </form>
          <p className="text-center text-xs text-muted-foreground mt-2 max-w-3xl mx-auto">
            محتوای تولیدشده توسط AI است؛ برای تصمیم‌های مهم منابع را بررسی کنید.
          </p>
        </footer>
      </main>
    </div>
  );
}