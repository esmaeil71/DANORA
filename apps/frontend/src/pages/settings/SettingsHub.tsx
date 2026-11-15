import { Link, useNavigate } from "react-router-dom";
import { useCallback } from "react";
import {
  BookOpen,
  Code2,
  CreditCard,
  Gauge,
  Headphones,
  LogOut,
  Palette,
  Shield,
  UserCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import { displayLabel } from "@/lib/user-prefs";
import { useUserPrefs } from "@/hooks/use-user-prefs";
import { SettingsMenuItem } from "@/components/settings/settings-menu-item";
import { SettingsLoading } from "@/components/settings/settings-loading";
import { useSettingsSession } from "@/hooks/use-settings-session";

export function SettingsHub() {
  const navigate = useNavigate();
  const { user, usage, loading } = useSettingsSession();
  const { prefs } = useUserPrefs(true);

  const logout = useCallback(async () => {
    await api("/auth/logout", { method: "POST" });
    navigate("/");
  }, [navigate]);

  if (loading) return <SettingsLoading />;

  const limit = usage?.limit ?? 50;
  const used = usage?.messageCount ?? 0;
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const planLabel = user?.plan === "free" ? "رایگان" : (user?.plan ?? "—");
  const label = user ? displayLabel(user.email, prefs) : "—";
  const initial = label.charAt(0).toUpperCase();

  return (
    <main className="max-w-xl mx-auto px-4 py-6 pb-12 space-y-6">
      <Link
        to="/settings/account"
        className="block rounded-2xl border border-[var(--st-border)] bg-[var(--st-surface)] p-5 hover:bg-[var(--st-surface-hover)] transition-colors"
      >
        <div className="flex items-center gap-4">
          <div
            className="size-14 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-violet-900/30"
            aria-hidden
          >
            {initial}
          </div>
          <div className="min-w-0 flex-1 text-right">
            <p className="text-xs text-[var(--st-muted)]">حساب کاربری</p>
            <p className="text-base font-semibold truncate">{label}</p>
            <p className="text-xs text-[var(--st-muted)] truncate" dir="ltr">
              {user?.email}
            </p>
            <p className="text-xs text-violet-300 mt-1">پلن {planLabel}</p>
          </div>
        </div>
      </Link>

      <section aria-labelledby="quota-heading">
        <h2
          id="quota-heading"
          className="text-xs font-medium text-[var(--st-muted)] mb-2 px-1"
        >
          سهمیه و بسته
        </h2>
        <div className="rounded-2xl border border-[var(--st-border)] bg-[var(--st-surface)] overflow-hidden divide-y divide-[var(--st-border)]">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-sm font-medium flex items-center gap-2">
                <Gauge className="size-4 text-violet-400" aria-hidden />
                سهمیه پیشرفته (امروز)
              </span>
              <span className="text-xs text-[var(--st-muted)]" dir="ltr">
                {used} / {limit}
              </span>
            </div>
            <div
              className="h-2 rounded-full bg-[var(--st-surface-hover)] overflow-hidden"
              role="progressbar"
              aria-valuenow={used}
              aria-valuemin={0}
              aria-valuemax={limit}
            >
              <div
                className="h-full rounded-full bg-gradient-to-l from-violet-500 to-violet-400"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <SettingsMenuItem
            icon={<CreditCard className="size-5" />}
            label="تمدید و ارتقا بسته"
            description="مقایسه پلن‌ها و شارژ تومانی"
            href="/settings/billing"
          />
        </div>
      </section>

      <section aria-labelledby="prefs-heading">
        <h2
          id="prefs-heading"
          className="text-xs font-medium text-[var(--st-muted)] mb-2 px-1"
        >
          ترجیحات
        </h2>
        <div className="rounded-2xl border border-[var(--st-border)] bg-[var(--st-surface)] overflow-hidden divide-y divide-[var(--st-border)]">
          <SettingsMenuItem
            icon={<Palette className="size-5" />}
            label="شخصی‌سازی"
            description="پیشنهادها، چگالی رابط و حرکت"
            href="/settings/personalization"
          />
          <SettingsMenuItem
            icon={<UserCircle2 className="size-5" />}
            label="پروفایل"
            description="نام نمایشی در اپ"
            href="/settings/profile"
          />
        </div>
      </section>

      {user?.role === "admin" && (
        <section aria-labelledby="admin-heading">
          <h2
            id="admin-heading"
            className="text-xs font-medium text-[var(--st-muted)] mb-2 px-1"
          >
            مدیریت سامانه
          </h2>
          <div className="rounded-2xl border border-violet-500/30 bg-violet-500/5 overflow-hidden">
            <SettingsMenuItem
              icon={<Shield className="size-5" />}
              label="پنل ادمین"
              description="کاربران، درخواست‌ها و مدل‌ها"
              href="/settings/admin"
            />
          </div>
        </section>
      )}

      <section aria-labelledby="more-heading">
        <h2
          id="more-heading"
          className="text-xs font-medium text-[var(--st-muted)] mb-2 px-1"
        >
          بیشتر
        </h2>
        <div className="rounded-2xl border border-[var(--st-border)] bg-[var(--st-surface)] overflow-hidden divide-y divide-[var(--st-border)]">
            <SettingsMenuItem
              icon={<Code2 className="size-5" />}
              label="پلتفرم توسعه‌دهندگان"
              description="کلید API، مستندات و نمونه cURL"
              href="/settings/developer"
            />
          <SettingsMenuItem
            icon={<Headphones className="size-5" />}
            label="پشتیبانی"
            description="تیکت، FAQ و ایمیل"
            href="/settings/support"
          />
          <SettingsMenuItem
            icon={<BookOpen className="size-5" />}
            label="درباره دانورا"
            description="معرفی، قوانین و نسخه"
            href="/settings/about"
          />
        </div>
      </section>

      <section>
        <div className="rounded-2xl border border-[var(--st-border)] bg-[var(--st-surface)] overflow-hidden">
          <SettingsMenuItem
            icon={<LogOut className="size-5" />}
            label="خروج"
            description="پایان نشست در این مرورگر"
            onClick={() => void logout()}
            destructive
          />
        </div>
      </section>
    </main>
  );
}