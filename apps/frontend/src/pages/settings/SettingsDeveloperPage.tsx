import { useCallback, useState } from "react";
import { Check, Copy } from "lucide-react";
import { SettingsPanel } from "@/components/settings/settings-panel";

const apiBase = (
  import.meta.env.VITE_API_URL ?? "http://localhost:4000"
).replace(/\/$/, "");

const sample = `curl -X POST ${apiBase}/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Cookie: access_token=<JWT>" \\
  -d '{"modelId":"gpt-4o-mini","message":"سلام"}'`;

export function SettingsDeveloperPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  }, []);

  const endpoints = [
    { method: "POST", path: "/auth/register", note: "ثبت‌نام" },
    { method: "POST", path: "/auth/login", note: "ورود (کوکی JWT)" },
    { method: "GET", path: "/auth/me", note: "پروفایل" },
    { method: "GET", path: "/auth/usage", note: "سهمیه روزانه" },
    { method: "POST", path: "/chat/completions", note: "چت SSE" },
    { method: "GET", path: "/models", note: "فهرست مدل‌ها" },
    { method: "GET", path: "/conversations", note: "تاریخچه" },
  ];

  return (
    <main className="max-w-xl mx-auto px-4 py-6 pb-12 space-y-6">
      <SettingsPanel title="آدرس API">
        <div className="px-4 py-4 flex items-center gap-2">
          <code className="flex-1 text-xs break-all text-violet-200" dir="ltr">
            {apiBase}
          </code>
          <button
            type="button"
            aria-label="کپی آدرس"
            onClick={() => void copy(apiBase, "base")}
            className="shrink-0 size-10 rounded-lg border border-[var(--st-border)] hover:bg-[var(--st-surface-hover)] inline-flex items-center justify-center cursor-pointer"
          >
            {copied === "base" ? (
              <Check className="size-4 text-emerald-400" />
            ) : (
              <Copy className="size-4 text-[var(--st-muted)]" />
            )}
          </button>
        </div>
      </SettingsPanel>

      <SettingsPanel title="مسیرهای عمومی">
        <ul className="divide-y divide-[var(--st-border)]">
          {endpoints.map((ep) => (
            <li
              key={ep.path}
              className="px-4 py-3 flex items-center justify-between gap-2 text-sm"
            >
              <span className="font-mono text-violet-300" dir="ltr">
                {ep.method} {ep.path}
              </span>
              <span className="text-[var(--st-muted)] text-xs">{ep.note}</span>
            </li>
          ))}
        </ul>
      </SettingsPanel>

      <SettingsPanel title="نمونه درخواست">
        <div className="px-4 py-4 space-y-3">
          <pre className="text-[11px] leading-relaxed overflow-x-auto text-[var(--st-muted)] p-3 rounded-xl bg-[var(--st-surface-hover)]" dir="ltr">
            {sample}
          </pre>
          <button
            type="button"
            onClick={() => void copy(sample, "curl")}
            className="min-h-10 w-full rounded-xl border border-[var(--st-border)] text-sm hover:bg-[var(--st-surface-hover)] cursor-pointer inline-flex items-center justify-center gap-2"
          >
            {copied === "curl" ? (
              <>
                <Check className="size-4 text-emerald-400" /> کپی شد
              </>
            ) : (
              <>
                <Copy className="size-4" /> کپی cURL
              </>
            )}
          </button>
          <p className="text-[11px] text-[var(--st-muted)]">
            API Key شخصی (BYOK) در MVP فعال نیست؛ احراز هویت با کوکی مرورگر پس از
            login انجام می‌شود.
          </p>
        </div>
      </SettingsPanel>
    </main>
  );
}