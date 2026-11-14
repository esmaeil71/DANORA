import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";
import { loadUserPrefs, saveUserPrefs } from "@/lib/user-prefs";
import {
  SettingsFieldRow,
  SettingsInput,
  SettingsPanel,
} from "@/components/settings/settings-panel";
import { SettingsLoading } from "@/components/settings/settings-loading";
import { useSettingsSession } from "@/hooks/use-settings-session";

export function SettingsProfilePage() {
  const { user, loading } = useSettingsSession();
  const [displayName, setDisplayName] = useState(() => loadUserPrefs().displayName);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  if (loading) return <SettingsLoading />;

  function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    saveUserPrefs({ displayName: displayName.trim() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-6 pb-12 space-y-6">
      <SettingsPanel title="پروفایل عمومی">
        <form onSubmit={onSave}>
          <SettingsFieldRow
            label="نام نمایشی"
            hint="در سایدبار چت و کارت حساب نشان داده می‌شود (فقط روی این دستگاه)"
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