import type { MouseEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Loader2, PanelRight, PanelRightClose } from "lucide-react";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatEmptyState } from "@/components/chat/chat-empty-state";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatModelMenu } from "@/components/chat/chat-model-menu";
import {
  api,
  ConversationRow,
  MessageRow,
  ModelRow,
  streamChat,
} from "@/lib/api";
import { useUserPrefs } from "@/hooks/use-user-prefs";
import { loadUserPrefs } from "@/lib/user-prefs";
import {
  isPendingConversationId,
  titleFromUserMessage,
} from "@/lib/chat-title";

type LocalMessage = MessageRow & { streaming?: boolean };

export function ChatClient() {
  const navigate = useNavigate();
  const location = useLocation();
  const { prefs } = useUserPrefs(true);
  const themeClass = prefs.chatTheme === "light" ? "chat-light" : "chat-dark";
  const [models, setModels] = useState<ModelRow[]>([]);
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [activeId, setActiveId] = useState<string | undefined>();
  const [messages, setMessages] = useState<LocalMessage[]>([]);
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
        if (modelList.length === 0) {
          setError(
            "هیچ مدلی فعال نیست. در ترمینال پروژه npm run db:seed را اجرا کنید و صفحه را رفرش کنید.",
          );
        }
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
    if (activeId || models.length === 0) return;
    const preferred = prefs.defaultModelId;
    if (preferred && models.some((m) => m.id === preferred)) {
      setModelId(preferred);
    }
  }, [prefs.defaultModelId, models, activeId]);

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

  useEffect(() => {
    const picked = (location.state as { modelId?: string } | null)?.modelId;
    if (!picked || models.length === 0) return;
    if (models.some((m) => m.id === picked)) {
      setModelId(picked);
      navigate("/chat", { replace: true, state: {} });
    }
  }, [location.state, models, navigate]);

  function upsertSidebarConversation(row: ConversationRow, replacePending?: boolean) {
    setConversations((list) => {
      const withoutPending = replacePending
        ? list.filter((c) => !isPendingConversationId(c.id))
        : list;
      const idx = withoutPending.findIndex((c) => c.id === row.id);
      if (idx >= 0) {
        const next = [...withoutPending];
        next[idx] = { ...next[idx], ...row };
        return next.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
      }
      return [row, ...withoutPending].sort(
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
    if (conv) setModelId(conv.modelId);
    const msgs = await api<MessageRow[]>(`/conversations/${id}/messages`);
    setMessages(msgs);
  }

  function newChat() {
    abortRef.current?.abort();
    setActiveId(undefined);
    setMessages([]);
    setInput("");
    setError(null);
    const preferred = loadUserPrefs().defaultModelId;
    const nextModel =
      preferred && models.some((m) => m.id === preferred)
        ? preferred
        : (models[0]?.id ?? "");
    setModelId(nextModel);
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
      });
    } else {
      upsertSidebarConversation({
        id: requestConvId,
        title:
          conversations.find((c) => c.id === requestConvId)?.title ===
          "گفتگوی جدید"
            ? sidebarTitle
            : (conversations.find((c) => c.id === requestConvId)?.title ??
              sidebarTitle),
        modelId,
        updatedAt: now,
      });
    }

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    try {
      await streamChat(
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
              },
              true,
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
            setError(ev.message ?? "خطا در چت");
            if (ev.conversationId) {
              setActiveId(ev.conversationId);
              upsertSidebarConversation(
                {
                  id: ev.conversationId,
                  title: sidebarTitle,
                  modelId,
                  updatedAt: now,
                },
                true,
              );
            } else if (!requestConvId) {
              setConversations((list) =>
                list.filter((c) => !isPendingConversationId(c.id)),
              );
              setActiveId(undefined);
            }
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
      if (!requestConvId) {
        setConversations((list) =>
          list.filter((c) => !isPendingConversationId(c.id)),
        );
        setActiveId(undefined);
      }
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setSending(false);
    }
  }

  async function logout() {
    await api("/auth/logout", { method: "POST" });
    navigate("/");
  }

  const currentModel = models.find((m) => m.id === modelId);

  if (loading) {
    return (
      <div className={`${themeClass} min-h-screen flex items-center justify-center gap-2 text-[var(--chat-muted)]`}>
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
        conversations={conversations}
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

      <main className="flex-1 flex flex-col min-w-0 min-h-0 bg-[var(--chat-bg)]">
        <header className="shrink-0 h-14 box-border grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 sm:px-4 border-b border-[var(--chat-border)]/80 bg-[var(--chat-bg)]/95 backdrop-blur-sm relative z-20 overflow-visible">
          <div className="flex justify-start min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label={
                sidebarOpen ? "بستن فهرست گفتگوها" : "نمایش فهرست گفتگوها"
              }
              aria-expanded={sidebarOpen}
              aria-controls="chat-conversations-sidebar"
              className="inline-flex items-center gap-2 min-h-11 min-w-11 px-2.5 sm:px-3 rounded-xl text-sm text-[var(--chat-muted)] hover:text-[var(--chat-text)] hover:bg-[var(--chat-surface-hover)] cursor-pointer transition-colors duration-200"
            >
              {sidebarOpen ? (
                <PanelRightClose className="size-5 shrink-0" aria-hidden />
              ) : (
                <PanelRight className="size-5 shrink-0" aria-hidden />
              )}
              <span className="hidden sm:inline font-medium text-[var(--chat-text)]">
                گفتگوها
              </span>
            </button>
          </div>
          <div className="relative justify-self-center" ref={modelMenuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setModelOpen((o) => !o);
              }}
              className="inline-flex items-center gap-2 min-h-11 px-4 rounded-xl border border-[var(--chat-border)] bg-[var(--chat-surface)] text-sm text-[var(--chat-text)] cursor-pointer hover:bg-[var(--chat-surface-hover)] transition-colors duration-200"
              aria-expanded={modelOpen}
              aria-haspopup="listbox"
            >
              <span className="text-[var(--chat-muted)]">مدل:</span>
              <span className="font-medium max-w-[40vw] sm:max-w-none truncate">
                {currentModel?.displayName ?? "انتخاب مدل"}
              </span>
              <ChevronDown
                className={`size-4 text-[var(--chat-muted)] shrink-0 transition-transform duration-200 ${
                  modelOpen ? "rotate-180" : ""
                }`}
                aria-hidden
              />
            </button>
            {modelOpen && (
              <ChatModelMenu
                models={models}
                modelId={modelId}
                onSelect={(id) => {
                  setModelId(id);
                  setModelOpen(false);
                }}
                onOpenAllModels={() => {
                  setModelOpen(false);
                  navigate("/chat/models");
                }}
              />
            )}
          </div>
          <div className="min-w-0" aria-hidden />
        </header>

        <div className="chat-scroll flex-1 min-h-0">
          <div className="max-w-3xl mx-auto px-4 min-h-full flex flex-col">
            {messages.length === 0 ? (
              <ChatEmptyState onPick={(t) => setInput(t)} />
            ) : (
              <ChatMessages messages={messages} />
            )}
            <div ref={bottomRef} className="h-2 shrink-0" />
          </div>
        </div>

        {error && (
          <p
            className="text-center text-sm text-red-400 px-4 py-1 shrink-0"
            role="alert"
          >
            {error}
          </p>
        )}

        <ChatComposer
          value={input}
          onChange={setInput}
          onSubmit={send}
          sending={sending}
          disabled={!modelId}
          disabledHint={
            !modelId && models.length === 0
              ? "ابتدا مدل‌ها را با npm run db:seed بارگذاری کنید"
              : !modelId
                ? "یک مدل از منوی بالا انتخاب کنید"
                : undefined
          }
        />
      </main>
    </div>
  );
}