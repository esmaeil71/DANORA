import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Loader2, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SettingsFieldRow, SettingsPanel } from "@/components/settings/settings-panel";
import { SettingsToggle } from "@/components/settings/settings-toggle";
import { SettingsLoading } from "@/components/settings/settings-loading";
import { useAdminGuard } from "@/hooks/use-admin-guard";

interface UserDetail {
  id: string;
  email: string;
  plan: string;
  role: string;
  suspended: boolean;
  createdAt: string;
  conversationCount: number;
  usageToday: { messageCount: number; tokenTotal: number };
}

interface ConversationRow {
  id: string;
  title: string;
  modelId: string;
  messageCount: number;
  updatedAt: string;
}

interface MessagesPayload {
  conversation: { id: string; title: string; userEmail: string };
  messages: Array<{
    id: string;
    role: string;
    content: string;
    createdAt: string;
  }>;
}

export function SettingsAdminUserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const { user: admin, loading: authLoading } = useAdminGuard();
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [openConv, setOpenConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessagesPayload | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      setError(null);
      const [d, convs] = await Promise.all([
        api<UserDetail>(`/admin/users/${userId}`),
        api<ConversationRow[]>(`/admin/users/${userId}/conversations`),
      ]);
      setDetail(d);
      setConversations(convs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!authLoading && userId) void load();
  }, [authLoading, userId, load]);

  const patch = async (body: Record<string, unknown>) => {
    if (!userId) return;
    setBusy(true);
    setError(null);
    try {
      await api(`/admin/users/${userId}`, { method: "PATCH", json: body });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا");
    } finally {
      setBusy(false);
    }
  };

  const resetUsage = async () => {
    if (!userId) return;
    setBusy(true);
    try {
      await api(`/admin/users/${userId}/reset-usage-today`, { method: "POST" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا");
    } finally {
      setBusy(false);
    }
  };

  const removeUser = async () => {
    if (!userId || !window.confirm("حذف این کاربر غیرقابل بازگشت است. ادامه می‌دهید؟")) {
      return;
    }
    setBusy(true);
    try {
      await api(`/admin/users/${userId}`, { method: "DELETE" });
      window.location.href = "/settings/admin/users";
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا");
      setBusy(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    if (openConv === conversationId) {
      setOpenConv(null);
      setMessages(null);
      return;
    }
    setOpenConv(conversationId);
    setMessages(null);
    try {
      const data = await api<MessagesPayload>(
        `/admin/conversations/${conversationId}/messages`,
      );
      setMessages(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا");
    }
  };

  if (authLoading || loading) return <SettingsLoading />;
  if (!detail) {
    return (
      <main className="p-6 text-sm text-red-400" role="alert">
        {error ?? "کاربر یافت نشد"}
      </main>
    );
  }

  const isSelf = admin?.id === detail.id;

  return (
    <main className="max-w-xl mx-auto px-4 py-6 pb-12 space-y-4">
      <Link
        to="/settings/admin/users"
        className="inline-flex items-center gap-2 text-sm text-[var(--st-muted)] hover:text-[var(--st-text)]"
      >
        <ChevronLeft className="size-4" />
        فهرست کاربران
      </Link>

      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <SettingsPanel title={detail.email}>
        <SettingsFieldRow label="پلن">
          <div className="flex gap-2">
            {(["free", "pro"] as const).map((p) => (
              <button
                key={p}
                type="button"
                disabled={busy}
                onClick={() => void patch({ plan: p })}
                className={`flex-1 min-h-10 rounded-lg text-sm border ${
                  detail.plan === p
                    ? "border-violet-500 bg-violet-500/20"
                    : "border-[var(--st-border)]"
                }`}
              >
                {p === "free" ? "رایگان" : "پیشرفته"}
              </button>
            ))}
          </div>
        </SettingsFieldRow>
        <SettingsFieldRow label="نقش">
          <div className="flex gap-2">
            {(["user", "admin"] as const).map((r) => (
              <button
                key={r}
                type="button"
                disabled={busy || (isSelf && r === "user")}
                onClick={() => void patch({ role: r })}
                className={`flex-1 min-h-10 rounded-lg text-sm border ${
                  detail.role === r
                    ? "border-violet-500 bg-violet-500/20"
                    : "border-[var(--st-border)]"
                }`}
              >
                {r === "admin" ? "ادمین" : "کاربر"}
              </button>
            ))}
          </div>
        </SettingsFieldRow>
        <SettingsFieldRow label="مسدود" hint="ورود و چت غیرفعال می‌شود">
          <SettingsToggle
            checked={detail.suspended}
            disabled={busy || isSelf}
            onChange={(v) => void patch({ suspended: v })}
            label={detail.suspended ? "مسدود" : "فعال"}
          />
        </SettingsFieldRow>
        <div className="px-4 py-4 text-[11px] text-[var(--st-muted)] space-y-1">
          <p>گفتگوها: {detail.conversationCount}</p>
          <p>
            مصرف امروز: {detail.usageToday.messageCount} پیام ·{" "}
            {detail.usageToday.tokenTotal} توکن
          </p>
          <p>عضویت: {new Date(detail.createdAt).toLocaleDateString("fa-IR")}</p>
        </div>
        <div className="px-4 py-4 flex flex-wrap gap-2 border-t border-[var(--st-border)]">
          <button
            type="button"
            disabled={busy}
            onClick={() => void resetUsage()}
            className="min-h-10 px-4 rounded-lg text-sm border border-[var(--st-border)] hover:bg-[var(--st-surface-hover)]"
          >
            صفر کردن مصرف امروز
          </button>
          {!isSelf && detail.role !== "admin" && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void removeUser()}
              className="min-h-10 px-4 rounded-lg text-sm border border-red-500/40 text-red-400 hover:bg-red-500/10 inline-flex items-center gap-2"
            >
              <Trash2 className="size-4" />
              حذف کاربر
            </button>
          )}
          {busy && <Loader2 className="size-5 animate-spin text-violet-400" />}
        </div>
      </SettingsPanel>

      <SettingsPanel title="ممیزی گفتگوها">
        <ul className="divide-y divide-[var(--st-border)]">
          {conversations.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => void loadMessages(c.id)}
                className="w-full text-right px-4 py-3 hover:bg-[var(--st-surface-hover)]"
              >
                <p className="text-sm font-medium">{c.title}</p>
                <p className="text-[11px] text-[var(--st-muted)]">
                  {c.messageCount} پیام · {c.modelId}
                </p>
              </button>
              {openConv === c.id && messages && (
                <div className="px-4 pb-4 space-y-2 bg-[var(--st-surface-hover)]/50">
                  {messages.messages.map((m) => (
                    <AdminMessageArticle key={m.id} message={m} />
                  ))}
                </div>
              )}
            </li>
          ))}
          {conversations.length === 0 && (
            <li className="px-4 py-6 text-sm text-[var(--st-muted)] text-center">
              گفتگویی نیست
            </li>
          )}
        </ul>
      </SettingsPanel>
    </main>
  );
}

function AdminMessageArticle({
  message,
}: {
  message: { role: string; content: string; createdAt: string };
}) {
  return (
    <article className="rounded-lg border border-[var(--st-border)] p-2 text-xs">
      <p className="text-[var(--st-muted)] mb-1">
        {message.role} · {new Date(message.createdAt).toLocaleString("fa-IR")}
      </p>
      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
    </article>
  );
}