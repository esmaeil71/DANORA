import { useEffect, useState } from "react";
import { loadUserPrefs, saveUserPrefs, type UserPrefs } from "@/lib/user-prefs";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { SettingsToggle } from "@/components/settings/settings-toggle";

export function SettingsPersonalizationPage() {
  const [prefs, setPrefs] = useState<UserPrefs>(() => loadUserPrefs());

  useEffect(() => {
    const root = document.documentElement;
    if (prefs.reduceMotionOverride === true) {
      root.classList.add("danora-reduce-motion");
    } else if (prefs.reduceMotionOverride === false) {
      root.classList.remove("danora-reduce-motion");
    } else {
      root.classList.remove("danora-reduce-motion");
    }
  }, [prefs.reduceMotionOverride]);

  function patch(p: Partial<UserPrefs>) {
    setPrefs(saveUserPrefs(p));
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-6 pb-12 space-y-6">
      <SettingsPanel title="چت">
        <SettingsToggle
          label="چیپ‌های پیشنهادی"
          description="نمایش پیشنهادها در شروع گفتگوی خالی"
          checked={prefs.showSuggestionChips}
          onChange={(v) => patch({ showSuggestionChips: v })}
        />
        <div className="px-4 py-4 border-b border-[var(--st-border)] space-y-2">
          <p className="text-sm font-medium">چگالی فهرست گفتگو</p>
          <div className="flex gap-2">
            {(["comfortable", "compact"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => patch({ density: d })}
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
        <SettingsToggle
          label="کاهش حرکت"
          description="انیمیشن‌های کمتر (علاوه بر تنظیم سیستم‌عامل)"
          checked={prefs.reduceMotionOverride === true}
          onChange={(v) => patch({ reduceMotionOverride: v })}
        />
      </SettingsPanel>

      <SettingsPanel title="ظاهر">
        <p className="px-4 py-4 text-sm text-[var(--st-muted)] leading-relaxed">
          محیط چت با تم تیره GapGPT فعال است. تم روشن صفحات عمومی در به‌روزرسانی
          بعدی اضافه می‌شود.
        </p>
      </SettingsPanel>
    </main>
  );
}