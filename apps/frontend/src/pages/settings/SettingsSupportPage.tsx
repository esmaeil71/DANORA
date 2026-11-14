import { FormEvent, useCallback, useEffect, useState } from "react";
import { ChevronDown, Loader2, Mail } from "lucide-react";
import { api } from "@/lib/api";
import {
  SettingsFieldRow,
  SettingsInput,
  SettingsPanel,
} from "@/components/settings/settings-panel";
import { SettingsMenuItem } from "@/components/settings/settings-menu-item";
import { SettingsLoading } from "@/components/settings/settings-loading";
import { useSettingsSession } from "@/hooks/use-settings-session";

const faq = [
  {
    q: "چرا پیام ارسال نمی‌شود؟",
    a: "سقف روزانه، قطع backend، یا کلید API سرور را بررسی کنید.",
  },
  {
    q: "چطور با API وصل شوم؟",
    a: "از تنظیمات → توسعه‌دهندگان کلید dnr_ بسازید و در هدر Authorization بفرستید.",
  },
  {
    q: "رمز را فراموش کردم",
    a: "بازیابی خودکار هنوز نیست؛ تیکت پشتیبانی بفرستید.",
  },
];

interface Inquiry {
  id: string;
  subject: string;
  message: string;
  createdAt: string;
}

export function SettingsSupportPage() {
  const { loading } = useSettingsSession();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(() => api<Inquiry[]>("/support/inquiries"), []);

  useEffect(() => {
    if (!loading) void load().then(setInquiries).catch(() => undefined);
  }, [loading, load]);

  if (loading) return <SettingsLoading />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setErr(null);
    setOk(null);
    try {
      const res = await api<{ id: string }>("/support/inquiries", {
        method: "POST",
        json: { subject, message },
      });
      setOk(`پیام ثبت شد (${res.id.slice(0, 8)}…)`);
      setSubject("");
      setMessage("");
      const list = await load();
      setInquiries(list);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "خطا");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-6 pb-12 space-y-6">
      <SettingsPanel title="تماس سریع">
        <SettingsMenuItem
          icon={<Mail className="size-5" />}
          label="ایمیل پشتیبانی"
          description="support@danora.ir"
          href="mailto:support@danora.ir?subject=پشتیبانی%20دانورا"
        />
      </SettingsPanel>

      <SettingsPanel title="ارسال تیکت">
        <form onSubmit={(e) => void onSubmit(e)}>
          <SettingsFieldRow label="موضوع">
            <SettingsInput
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              minLength={2}
              maxLength={120}
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="پیام">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              minLength={10}
              rows={5}
              maxLength={4000}
              className="w-full rounded-xl border border-[var(--st-border)] bg-[var(--st-surface-hover)] px-3 py-2 text-sm resize-none"
            />
          </SettingsFieldRow>
          {err && (
            <p className="px-4 text-sm text-red-400" role="alert">
              {err}
            </p>
          )}
          {ok && (
            <p className="px-4 text-sm text-emerald-400" role="status">
              {ok}
            </p>
          )}
          <div className="px-4 pb-4">
            <button
              type="submit"
              disabled={sending}
              className="w-full min-h-11 rounded-xl bg-violet-600 text-white text-sm font-medium cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {sending && <Loader2 className="size-4 animate-spin" />}
              ارسال
            </button>
          </div>
        </form>
      </SettingsPanel>

      <SettingsPanel title="سؤالات متداول">
        <ul className="divide-y divide-[var(--st-border)]">
          {faq.map((item, i) => (
            <li key={item.q}>
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-4 py-3 flex items-center justify-between gap-2 text-right cursor-pointer hover:bg-[var(--st-surface-hover)]"
              >
                <span className="text-sm font-medium">{item.q}</span>
                <ChevronDown
                  className={`size-4 shrink-0 transition-transform ${
                    openFaq === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === i && (
                <p className="px-4 pb-3 text-xs text-[var(--st-muted)] leading-relaxed">
                  {item.a}
                </p>
              )}
            </li>
          ))}
        </ul>
      </SettingsPanel>

      {inquiries.length > 0 && (
        <SettingsPanel title="تیکت‌های شما">
          <ul className="divide-y divide-[var(--st-border)] max-h-64 overflow-y-auto">
            {inquiries.map((inq) => (
              <li key={inq.id} className="px-4 py-3">
                <p className="text-sm font-medium">{inq.subject}</p>
                <p className="text-xs text-[var(--st-muted)] mt-1 line-clamp-2">
                  {inq.message}
                </p>
                <p className="text-[10px] text-[var(--st-muted)] mt-1" dir="ltr">
                  {new Date(inq.createdAt).toLocaleString("fa-IR")}
                </p>
              </li>
            ))}
          </ul>
        </SettingsPanel>
      )}
    </main>
  );
}