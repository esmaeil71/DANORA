import { useState } from "react";
import { Check, Zap } from "lucide-react";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { SettingsLoading } from "@/components/settings/settings-loading";
import { useSettingsSession } from "@/hooks/use-settings-session";

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
    price: "به‌زودی",
    features: [
      "سقف پیام بالاتر",
      "اولویت در صف",
      "مدل‌های پریمیوم",
      "شارژ با درگاه ایرانی",
    ],
  },
] as const;

export function SettingsBillingPage() {
  const { user, usage, loading } = useSettingsSession();
  const [notice, setNotice] = useState<string | null>(null);

  if (loading) return <SettingsLoading />;

  const active = user?.plan ?? "free";

  return (
    <main className="max-w-xl mx-auto px-4 py-6 pb-12 space-y-6">
      {usage && active === "free" && (
        <p className="text-sm text-[var(--st-muted)] text-center">
          امروز {usage.messageCount} از {usage.limit} پیام استفاده کرده‌اید.
        </p>
      )}

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
                <h3 className="font-semibold text-[var(--st-text)]">{plan.name}</h3>
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
                    <Check className="size-4 text-violet-400 shrink-0 mt-0.5" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
              {plan.id === "pro" && (
                <button
                  type="button"
                  onClick={() =>
                    setNotice(
                      "درگاه پرداخت تومان (زرین‌پال) در نسخه بعدی فعال می‌شود. فعلاً با پلن رایگان ادامه دهید.",
                    )
                  }
                  className="mt-4 min-h-10 w-full rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <Zap className="size-4" aria-hidden />
                  درخواست ارتقا
                </button>
              )}
            </article>
          );
        })}
      </div>

      {notice && (
        <SettingsPanel>
          <p className="px-4 py-4 text-sm text-[var(--st-muted)] leading-relaxed" role="status">
            {notice}
          </p>
        </SettingsPanel>
      )}
    </main>
  );
}