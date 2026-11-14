import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import {
  SettingsFieldRow,
  SettingsInput,
  SettingsPanel,
} from "@/components/settings/settings-panel";
import { SettingsLoading } from "@/components/settings/settings-loading";
import { useSettingsSession } from "@/hooks/use-settings-session";

function formatJoinDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "long",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function SettingsAccountPage() {
  const { user, usage, loading } = useSettingsSession();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  if (loading) return <SettingsLoading />;

  async function onPassword(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (next !== confirm) {
      setErr("تکرار رمز عبور با رمز جدید یکسان نیست");
      return;
    }
    if (next.length < 8) {
      setErr("رمز جدید حداقل ۸ کاراکتر باشد");
      return;
    }
    setSaving(true);
    try {
      await api("/auth/password", {
        method: "PATCH",
        json: { currentPassword: current, newPassword: next },
      });
      setMsg("رمز عبور با موفقیت به‌روز شد");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (error) {
      setErr(error instanceof Error ? error.message : "خطا");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-6 pb-12 space-y-6">
      <SettingsPanel title="اطلاعات حساب">
        <SettingsFieldRow label="شناسه کاربر" hint="برای پشتیبانی قابل اشتراک است">
          <p className="text-sm font-mono text-[var(--st-muted)] break-all" dir="ltr">
            {user?.id}
          </p>
        </SettingsFieldRow>
        <SettingsFieldRow label="ایمیل">
          <p className="text-sm" dir="ltr">
            {user?.email}
          </p>
        </SettingsFieldRow>
        <SettingsFieldRow label="پلن فعال">
          <p className="text-sm">
            {user?.plan === "free" ? "رایگان" : user?.plan}
            {user?.plan === "free" && usage && (
              <span className="text-[var(--st-muted)] text-xs block mt-1">
                سقف امروز: {usage.messageCount} از {usage.limit} پیام
              </span>
            )}
          </p>
        </SettingsFieldRow>
        <SettingsFieldRow label="تاریخ عضویت">
          <p className="text-sm">{formatJoinDate(user?.createdAt)}</p>
        </SettingsFieldRow>
      </SettingsPanel>

      <SettingsPanel title="امنیت">
        <form onSubmit={(e) => void onPassword(e)} className="divide-y divide-[var(--st-border)]">
          <SettingsFieldRow label="رمز عبور فعلی">
            <SettingsInput
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              required
              dir="ltr"
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="رمز عبور جدید" hint="حداقل ۸ کاراکتر">
            <SettingsInput
              type="password"
              autoComplete="new-password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              required
              minLength={8}
              dir="ltr"
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="تکرار رمز جدید">
            <SettingsInput
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
              dir="ltr"
            />
          </SettingsFieldRow>
          <div className="px-4 py-4">
            {err && (
              <p className="text-sm text-red-400 mb-3" role="alert">
                {err}
              </p>
            )}
            {msg && (
              <p className="text-sm text-emerald-400 mb-3" role="status">
                {msg}
              </p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="w-full min-h-11 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 disabled:opacity-50 inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              {saving && <Loader2 className="size-4 animate-spin" aria-hidden />}
              ذخیره رمز عبور
            </button>
          </div>
        </form>
      </SettingsPanel>
    </main>
  );
}