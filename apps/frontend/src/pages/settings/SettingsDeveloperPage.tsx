import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  KeyRound,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { api } from "@/lib/api";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import {
  SettingsFieldRow,
  SettingsInput,
  SettingsPanel,
} from "@/components/settings/settings-panel";
import { SettingsLoading } from "@/components/settings/settings-loading";

const apiBase = (
  import.meta.env.VITE_API_URL ?? "http://localhost:4000"
).replace(/\/$/, "");

export interface ApiTokenRow {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
}

interface CreatedToken extends ApiTokenRow {
  token: string;
}

export function SettingsDeveloperPage() {
  const [tokens, setTokens] = useState<ApiTokenRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("اسکریپت محلی");
  const [revealed, setRevealed] = useState<CreatedToken | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const list = await api<ApiTokenRow[]>("/developer/tokens");
      setTokens(list);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "خطا");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const sampleToken = revealed?.token ?? "dnr_XXXXXXXXXXXX";

  const curlModels = useMemo(
    () =>
      `curl -s ${apiBase}/models \\
  -H "Authorization: Bearer ${sampleToken}"`,
    [sampleToken],
  );

  const curlChat = useMemo(
    () =>
      `curl -N ${apiBase}/chat/completions \\
  -H "Authorization: Bearer ${sampleToken}" \\
  -H "Content-Type: application/json" \\
  -d '{"modelId":"gpt-4o-mini","message":"سلام"}'`,
    [sampleToken],
  );

  const copy = useCallback(async (text: string, id: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } else {
      setErr("کپی در مرورگر ناموفق بود — متن را دستی انتخاب کنید");
    }
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setCreating(true);
    setErr(null);
    try {
      const created = await api<CreatedToken>("/developer/tokens", {
        method: "POST",
        json: { name: newName.trim() || "کلید جدید" },
      });
      setRevealed(created);
      setTokens((prev) => [
        {
          id: created.id,
          name: created.name,
          prefix: created.prefix,
          createdAt: created.createdAt,
          lastUsedAt: null,
        },
        ...prev,
      ]);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "خطا");
    } finally {
      setCreating(false);
    }
  }

  async function revoke(id: string) {
    setErr(null);
    try {
      await api(`/developer/tokens/${id}`, { method: "DELETE" });
      setTokens((prev) => prev.filter((t) => t.id !== id));
      if (revealed?.id === id) setRevealed(null);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "خطا");
    }
  }

  const endpoints = [
    { method: "GET", path: "/models", note: "فهرست مدل‌ها" },
    { method: "GET", path: "/conversations", note: "گفتگوها" },
    { method: "GET", path: "/conversations/:id/messages", note: "پیام‌های یک گفتگو" },
    { method: "POST", path: "/chat/completions", note: "چت (SSE)" },
    { method: "GET", path: "/auth/me", note: "پروفایل" },
    { method: "GET", path: "/auth/usage", note: "سهمیه روزانه" },
  ];

  if (loading) return <SettingsLoading />;

  return (
    <main className="max-w-xl mx-auto px-4 py-6 pb-12 space-y-6">
      <p className="text-sm text-[var(--st-muted)] leading-relaxed px-1">
        با کلید API می‌توانید اسکریپت، بات یا اپ خود را به دانورا وصل کنید. کلید
        فقط یک‌بار نمایش داده می‌شود — آن را امن نگه دارید.
      </p>

      {err && (
        <p className="text-sm text-red-400 px-1" role="alert">
          {err}
        </p>
      )}

      <SettingsPanel title="کلیدهای API">
        {revealed && (
          <div className="mx-4 mt-4 p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10">
            <p className="text-sm font-medium text-emerald-300 mb-2">
              کلید جدید ساخته شد — همین الان کپی کن
            </p>
            <code
              className="block text-xs break-all text-[var(--st-text)] mb-3"
              dir="ltr"
            >
              {revealed.token}
            </code>
            <button
              type="button"
              onClick={() => void copy(revealed.token, "new-token")}
              className="min-h-10 w-full rounded-lg bg-emerald-600 text-white text-sm font-medium cursor-pointer inline-flex items-center justify-center gap-2"
            >
              {copied === "new-token" ? (
                <>
                  <Check className="size-4" /> کپی شد
                </>
              ) : (
                <>
                  <Copy className="size-4" /> کپی کلید
                </>
              )}
            </button>
          </div>
        )}

        <form onSubmit={(e) => void onCreate(e)}>
          <SettingsFieldRow label="نام کلید" hint="مثلاً: سرور n8n، تست لوکال">
            <SettingsInput
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              maxLength={64}
            />
          </SettingsFieldRow>
          <div className="px-4 pb-4">
            <button
              type="submit"
              disabled={creating}
              className="w-full min-h-11 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 disabled:opacity-50 cursor-pointer inline-flex items-center justify-center gap-2"
            >
              {creating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              ساخت کلید جدید
            </button>
          </div>
        </form>

        <ul className="divide-y divide-[var(--st-border)] border-t border-[var(--st-border)]">
          {tokens.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-[var(--st-muted)]">
              هنوز کلیدی نساخته‌اید
            </li>
          )}
          {tokens.map((t) => (
            <li
              key={t.id}
              className="px-4 py-3 flex items-center gap-3"
            >
              <span className="size-10 rounded-xl bg-[var(--st-surface-hover)] inline-flex items-center justify-center shrink-0 text-[var(--st-muted)]">
                <KeyRound className="size-5" aria-hidden />
              </span>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-sm font-medium truncate">{t.name}</p>
                <p className="text-xs text-[var(--st-muted)] font-mono" dir="ltr">
                  {t.prefix}
                </p>
              </div>
              <button
                type="button"
                aria-label={`حذف ${t.name}`}
                onClick={() => void revoke(t.id)}
                className="size-10 rounded-lg text-[var(--st-muted)] hover:text-red-400 hover:bg-red-500/10 cursor-pointer inline-flex items-center justify-center"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      </SettingsPanel>

      <SettingsPanel title="آدرس پایه">
        <div className="px-4 py-4 flex items-center gap-2">
          <code className="flex-1 text-xs break-all text-violet-200" dir="ltr">
            {apiBase}
          </code>
          <button
            type="button"
            aria-label="کپی"
            onClick={() => void copy(apiBase, "base")}
            className="size-10 rounded-lg border border-[var(--st-border)] hover:bg-[var(--st-surface-hover)] cursor-pointer inline-flex items-center justify-center"
          >
            {copied === "base" ? (
              <Check className="size-4 text-emerald-400" />
            ) : (
              <Copy className="size-4 text-[var(--st-muted)]" />
            )}
          </button>
        </div>
      </SettingsPanel>

      <SettingsPanel title="احراز هویت">
        <div className="px-4 py-4 text-sm text-[var(--st-muted)] space-y-2 leading-relaxed">
          <p>
            هدر:{" "}
            <code className="text-violet-300 text-xs" dir="ltr">
              Authorization: Bearer &lt;کلید dnr_...&gt;
            </code>
          </p>
          <p>
            در مرورگر بعد از login کوکی{" "}
            <code className="text-xs" dir="ltr">
              access_token
            </code>{" "}
            هم معتبر است؛ برای اتوماسیون از کلید API استفاده کنید.
          </p>
        </div>
      </SettingsPanel>

      <SettingsPanel title="مسیرها">
        <ul className="divide-y divide-[var(--st-border)]">
          {endpoints.map((ep) => (
            <li
              key={ep.path}
              className="px-4 py-3 flex items-center justify-between gap-2 text-sm"
            >
              <span className="font-mono text-violet-300 text-xs" dir="ltr">
                {ep.method} {ep.path}
              </span>
              <span className="text-[var(--st-muted)] text-xs">{ep.note}</span>
            </li>
          ))}
        </ul>
      </SettingsPanel>

      <SettingsPanel title="نمونه کد">
        <div className="px-4 py-4 space-y-4">
          <div>
            <p className="text-xs text-[var(--st-muted)] mb-2">لیست مدل‌ها</p>
            <pre
              className="text-[10px] leading-relaxed overflow-x-auto text-[var(--st-muted)] p-3 rounded-xl bg-[var(--st-surface-hover)]"
              dir="ltr"
            >
              {curlModels}
            </pre>
            <button
              type="button"
              onClick={() => void copy(curlModels, "curl-models")}
              className="mt-2 text-xs text-violet-300 hover:underline cursor-pointer"
            >
              {copied === "curl-models" ? "کپی شد" : "کپی"}
            </button>
          </div>
          <div>
            <p className="text-xs text-[var(--st-muted)] mb-2">چت استریم (SSE)</p>
            <pre
              className="text-[10px] leading-relaxed overflow-x-auto text-[var(--st-muted)] p-3 rounded-xl bg-[var(--st-surface-hover)]"
              dir="ltr"
            >
              {curlChat}
            </pre>
            <button
              type="button"
              onClick={() => void copy(curlChat, "curl-chat")}
              className="mt-2 text-xs text-violet-300 hover:underline cursor-pointer"
            >
              {copied === "curl-chat" ? "کپی شد" : "کپی"}
            </button>
          </div>
        </div>
      </SettingsPanel>
    </main>
  );
}