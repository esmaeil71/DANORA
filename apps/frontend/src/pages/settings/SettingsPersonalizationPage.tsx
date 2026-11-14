import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { api, ModelRow } from "@/lib/api";
import { useUserPrefs } from "@/hooks/use-user-prefs";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { SettingsToggle } from "@/components/settings/settings-toggle";

export function SettingsPersonalizationPage() {
  const { prefs, update } = useUserPrefs(true);
  const [models, setModels] = useState<ModelRow[]>([]);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    api<ModelRow[]>("/models")
      .then(setModels)
      .catch(() => setModels([]));
  }, []);

  async function save(patch: Parameters<typeof update>[0], key: string) {
    setSaving(key);
    try {
      await update(patch);
    } finally {
      setSaving(null);
    }
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-6 pb-12 space-y-6">
      <SettingsPanel title="چت">
        <SettingsToggle
          label="چیپ‌های پیشنهادی"
          description="نمایش پیشنهادها در شروع گفتگوی خالی"
          checked={prefs.showSuggestionChips}
          onChange={(v) => void save({ showSuggestionChips: v }, "chips")}
        />
        <div className="px-4 py-4 border-b border-[var(--st-border)] space-y-2">
          <p className="text-sm font-medium flex items-center gap-2">
            چگالی فهرست گفتگو
            {saving === "density" && (
              <Loader2 className="size-3 animate-spin text-[var(--st-muted)]" />
            )}
          </p>
          <div className="flex gap-2">
            {(["comfortable", "compact"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => void save({ density: d }, "density")}
                className={`flex-1 min-h-10 rounded-lg text-sm cursor-pointer border transition-colors ${
                  prefs.density === d
                    ? "border-violet-500 bg-violet-500/20 text-[var(--st-text)]"
                    : "border-[var(--st-border)] text-[var(--st-muted)] hover:bg-[var(--st-surface-hover)]"
                }`}
              >
                {d === "comfortable" ? "معمولی" : "فشرده"}
              </button>
            ))}
          </div>
        </div>
        <div className="px-4 py-4 border-b border-[var(--st-border)] space-y-2">
          <p className="text-sm font-medium">تم محیط چت</p>
          <div className="flex gap-2">
            {(
              [
                { id: "dark", label: "تیره (دانورا)" },
                { id: "light", label: "روشن" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() =>
                  void save({ chatTheme: t.id }, "theme")
                }
                className={`flex-1 min-h-10 rounded-lg text-sm cursor-pointer border transition-colors ${
                  prefs.chatTheme === t.id
                    ? "border-violet-500 bg-violet-500/20"
                    : "border-[var(--st-border)] text-[var(--st-muted)] hover:bg-[var(--st-surface-hover)]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        {models.length > 0 && (
          <div className="px-4 py-4 border-b border-[var(--st-border)] space-y-2">
            <label htmlFor="default-model" className="text-sm font-medium block">
              مدل پیش‌فرض گفتگوی جدید
            </label>
            <select
              id="default-model"
              value={prefs.defaultModelId || models[0]?.id || ""}
              onChange={(e) =>
                void save({ defaultModelId: e.target.value }, "model")
              }
              className="w-full min-h-11 rounded-xl border border-[var(--st-border)] bg-[var(--st-surface-hover)] px-3 text-sm"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.displayName}
                </option>
              ))}
            </select>
          </div>
        )}
        <SettingsToggle
          label="کاهش حرکت"
          description="انیمیشن‌های کمتر (علاوه بر تنظیم سیستم‌عامل)"
          checked={prefs.reduceMotionOverride === true}
          onChange={(v) =>
            void save({ reduceMotionOverride: v }, "motion")
          }
        />
      </SettingsPanel>

      <p className="text-[11px] text-center text-[var(--st-muted)] px-2">
        ترجیحات روی حساب شما ذخیره می‌شود و در هر دستگاه پس از ورود همگام
        می‌شود.
      </p>
    </main>
  );
}