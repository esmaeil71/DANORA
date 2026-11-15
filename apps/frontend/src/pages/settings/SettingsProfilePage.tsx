import { FormEvent, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useUserPrefs } from "@/hooks/use-user-prefs";
import {
  SettingsFieldRow,
  SettingsInput,
  SettingsPanel,
} from "@/components/settings/settings-panel";
import { SettingsLoading } from "@/components/settings/settings-loading";
import { useSettingsSession } from "@/hooks/use-settings-session";

export function SettingsProfilePage() {
  const { user, loading } = useSettingsSession();
  const { prefs, update } = useUserPrefs(true);
  const [displayName, setDisplayName] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setDisplayName(prefs.displayName);
  }, [prefs.displayName]);

  if (loading) return <SettingsLoading />;

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      await update({ displayName: displayName.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "ذخیره نشد");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-6 pb-12 space-y-6">
      <SettingsPanel title="پروفایل عمومی">
        <form onSubmit={(e) => void onSave(e)}>
          <SettingsFieldRow
            label="نام نمایشی"
            hint="در سایدبار چت و کارت حساب نمایش داده می‌شود"
          >
            <SettingsInput
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={user?.email.split("@")[0] ?? ""}
              maxLength={32}
            />
          </SettingsFieldRow>
          <SettingsFieldRow label="ایمیل (غیرقابل تغییر)">
            <SettingsInput value={user?.email ?? ""} disabled dir="ltr" />
          </SettingsFieldRow>
          <div className="px-4 py-4 border-t border-[var(--st-border)]">
            {err && (
              <p className="text-sm text-red-400 mb-3" role="alert">
                {err}
              </p>
            )}
            {saved && (
              <p className="text-sm text-emerald-400 mb-3" role="status">
                ذخیره شد
              </p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="w-full min-h-11 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 disabled:opacity-50 inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              {saving && <Loader2 className="size-4 animate-spin" aria-hidden />}
              ذخیره پروفایل
            </button>
          </div>
        </form>
      </SettingsPanel>
    </main>
  );
}