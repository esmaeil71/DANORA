"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
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
      <div className="min-h-screen flex items-center justify-center text-muted">
        در حال بارگذاری…
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background">
      <aside className="w-72 border-l border-border bg-surface flex flex-col shrink-0">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Link href="/" className="font-bold text-accent">
            دانورا
          </Link>
          <button
            type="button"
            onClick={newChat}
            className="text-xs px-2 py-1 rounded bg-accent text-white hover:bg-accent-hover"
          >
            گفتگوی جدید
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => loadConversation(c.id)}
              className={`w-full text-right px-3 py-2 rounded-lg text-sm truncate group flex items-center gap-2 ${
                activeId === c.id
                  ? "bg-surface-hover"
                  : "hover:bg-surface-hover/60"
              }`}
            >
              <span className="flex-1 truncate">{c.title}</span>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => removeChat(c.id, e)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") removeChat(c.id, e as unknown as MouseEvent);
                }}
                className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-400 text-xs"
              >
                حذف
              </span>
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-border text-xs text-muted">
          {user?.email}
          <div className="mt-1">
            <Link href="/settings" className="text-accent hover:underline block mt-1">
              تنظیمات
            </Link>
            <button type="button" onClick={logout} className="hover:text-foreground mt-1">
              خروج
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center px-4 gap-4">
          <label className="text-sm text-muted flex items-center gap-2">
            مدل
            <select
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              className="bg-surface border border-border rounded-lg px-2 py-1 text-foreground text-sm"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.displayName}
                </option>
              ))}
            </select>
          </label>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted mt-20">
              پیام خود را بنویسید تا گفتگو شروع شود.
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-3xl mx-auto rounded-2xl px-4 py-3 text-sm leading-7 whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-accent/20 mr-0 ml-12"
                  : "bg-surface border border-border ml-0 mr-12"
              }`}
            >
              {m.content || (m.streaming ? "…" : "")}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center px-4 pb-2">{error}</p>
        )}

        <div className="p-4 border-t border-border max-w-3xl w-full mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={2}
              placeholder="پیام خود را بنویسید…"
              className="flex-1 resize-none bg-surface border border-border rounded-xl px-3 py-2 outline-none focus:border-accent text-sm"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="px-5 rounded-xl bg-accent text-white hover:bg-accent-hover disabled:opacity-50 self-end"
            >
              ارسال
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}