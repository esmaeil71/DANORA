import { FormEvent, useCallback, useEffect, useState } from "react";
import { Check, Loader2, Zap } from "lucide-react";
import { api } from "@/lib/api";
import { SettingsFieldRow, SettingsInput, SettingsPanel } from "@/components/settings/settings-panel";
import { SettingsLoading } from "@/components/settings/settings-loading";
import { useSettingsSession } from "@/hooks/use-settings-session";

interface UsageDay {
  date: string;
  messageCount: number;
  tokenTotal: number;
}

interface UpgradeRow {
  id: string;
  status: string;
  note: string | null;
  phone: string | null;
  createdAt: string;
}

const plans = [
  {
    id: "free",
    name: "رایگان",
    price: "۰ تومان",
    features: ["۵۰ پیام در روز", "دسترسی به مدل‌های پایه", "تاریخچه گفتگو"],
  },
  {
    id: "pro",
    name: "پیشرفته",
    price: "شارژ اعتباری",
    features: [
      "سقف پیام بالاتر",
      "اولویت در صف",
      "مدل‌های پریمیوم",
      "پرداخت تومان (زرین‌پال)",
    ],
  },
] as const;

export function SettingsBillingPage() {
  const { user, usage, loading } = useSettingsSession();
  const [history, setHistory] = useState<UsageDay[]>([]);
  const [requests, setRequests] = useState<UpgradeRow[]>([]);
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [h, r] = await Promise.all([
      api<UsageDay[]>("/billing/usage-history"),
      api<UpgradeRow[]>("/billing/upgrade-requests"),
    ]);
    setHistory(h);
    setRequests(r);
  }, []);

  useEffect(() => {
    if (!loading) void load().catch(() => undefined);
  }, [loading, load]);

  if (loading) return <SettingsLoading />;

  const active = user?.plan ?? "free";
  const maxHist = Math.max(1, ...history.map((d) => d.messageCount));

  async function onUpgrade(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    setSuccess(null);
    try {
      const res = await api<{ id: string }>("/billing/upgrade-request", {
        method: "POST",
        json: { phone: phone.trim() || undefined, note: note.trim() || undefined },
      });
      setSuccess(`درخواست ثبت شد. کد پیگیری: ${res.id.slice(0, 8)}…`);
      setPhone("");
      setNote("");
      await load();
    } catch (error) {
      setErr(error instanceof Error ? error.message : "خطا");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-6 pb-12 space-y-6">
      {usage && active === "free" && (
        <p className="text-sm text-[var(--st-muted)] text-center">
          امروز {usage.messageCount} از {usage.limit} پیام
        </p>
      )}

      <SettingsPanel title="مصرف ۷ روز اخیر">
        {history.length === 0 ? (
          <p className="px-4 py-4 text-sm text-[var(--st-muted)]">
            هنوز مصرفی ثبت نشده
          </p>
        ) : (
          <ul className="px-4 py-4 space-y-3">
            {history.map((d) => (
              <li key={d.date}>
                <div className="flex justify-between text-xs text-[var(--st-muted)] mb-1">
                  <span dir="ltr">{d.date}</span>
                  <span>
                    {d.messageCount} پیام · {d.tokenTotal.toLocaleString("fa-IR")}{" "}
                    توکن
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--st-surface-hover)] overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full"
                    style={{
                      width: `${Math.round((d.messageCount / maxHist) * 100)}%`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </SettingsPanel>

      <div className="grid gap-4 sm:grid-cols-2">
        {plans.map((plan) => {
          const isActive = plan.id === active;
          return (
            <article
              key={plan.id}
              className={`rounded-2xl border p-4 flex flex-col ${
                isActive
                  ? "border-violet-500 bg-violet-500/10"
                  : "border-[var(--st-border)] bg-[var(--st-surface)]"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="font-semibold">{plan.name}</h3>
                {isActive && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-violet-600 text-white">
                    فعال
                  </span>
                )}
              </div>
              <p className="text-lg font-bold text-violet-300 mb-3">{plan.price}</p>
              <ul className="space-y-2 flex-1 text-sm text-[var(--st-muted)]">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="size-4 text-violet-400 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      {active === "free" && (
        <SettingsPanel title="درخواست ارتقا به پیشرفته">
          <form onSubmit={(e) => void onUpgrade(e)}>
            <SettingsFieldRow label="شماره تماس (اختیاری)" hint="برای هماهنگی شارژ">
              <SettingsInput
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09..."
                dir="ltr"
                inputMode="tel"
              />
            </SettingsFieldRow>
            <SettingsFieldRow label="توضیح (اختیاری)">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full rounded-xl border border-[var(--st-border)] bg-[var(--st-surface-hover)] px-3 py-2 text-sm resize-none"
              />
            </SettingsFieldRow>
            {err && (
              <p className="px-4 text-sm text-red-400" role="alert">
                {err}
              </p>
            )}
            {success && (
              <p className="px-4 text-sm text-emerald-400" role="status">
                {success}
              </p>
            )}
            <div className="px-4 pb-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full min-h-11 rounded-xl bg-violet-600 text-white text-sm font-medium inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Zap className="size-4" />
                )}
                ثبت درخواست ارتقا
              </button>
              <p className="text-[11px] text-[var(--st-muted)] mt-2 leading-relaxed">
                پرداخت آنلاین پس از تأیید تیم فعال می‌شود؛ فعلاً درخواست در صف
                بررسی قرار می‌گیرد.
              </p>
            </div>
          </form>
        </SettingsPanel>
      )}

      {requests.length > 0 && (
        <SettingsPanel title="درخواست‌های قبلی">
          <ul className="divide-y divide-[var(--st-border)]">
            {requests.map((r) => (
              <li key={r.id} className="px-4 py-3 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-violet-300">{r.status}</span>
                  <span className="text-xs text-[var(--st-muted)]" dir="ltr">
                    {new Date(r.createdAt).toLocaleDateString("fa-IR")}
                  </span>
                </div>
                {r.note && (
                  <p className="text-xs text-[var(--st-muted)] mt-1">{r.note}</p>
                )}
              </li>
            ))}
          </ul>
        </SettingsPanel>
      )}
    </main>
  );
}