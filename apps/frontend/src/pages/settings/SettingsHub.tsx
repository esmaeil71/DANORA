import { Link, useNavigate } from "react-router-dom";
import { useCallback } from "react";
import {
  BookOpen,
  ChevronLeft,
  Code2,
  CreditCard,
  Gauge,
  Headphones,
  LogOut,
  MessageSquare,
  ShoppingBag,
  Palette,
  Shield,
  UserCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import { displayLabel } from "@/lib/user-prefs";
import { useUserPrefs } from "@/hooks/use-user-prefs";
import { SettingsMenuItem } from "@/components/settings/settings-menu-item";
import { SettingsSection } from "@/components/settings/settings-section";
import { SettingsLoading } from "@/components/settings/settings-loading";
import { useSettingsSession } from "@/hooks/use-settings-session";

function quotaLevel(pct: number): "ok" | "warn" | "critical" {
  if (pct >= 90) return "critical";
  if (pct >= 70) return "warn";
  return "ok";
}

export function SettingsHub() {
  const navigate = useNavigate();
  const { user, usage, loading } = useSettingsSession();
  const { prefs } = useUserPrefs(true);

  const logout = useCallback(async () => {
    await api("/auth/logout", { method: "POST" });
    navigate("/");
  }, [navigate]);

  const limit = usage?.limit ?? 50;
  const used = usage?.messageCount ?? 0;
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const level = quotaLevel(pct);
  const quotaHint =
    level === "critical"
      ? "سهمیه امروز نزدیک به اتمام است."
      : level === "warn"
        ? "بیش از ۷۰٪ سهمیه امروز مصرف شده."
        : "باقی‌مانده تا پایان روز (بر اساس پلن شما)";

  if (loading) return <SettingsLoading />;

  const planLabel = user?.plan === "free" ? "رایگان" : (user?.plan ?? "—");
  const label = user ? displayLabel(user.email, prefs) : "—";
  const initial = label.charAt(0).toUpperCase();

  return (
    <main className="max-w-lg mx-auto px-4 py-5 pb-14 space-y-7">
      <div
        className="flex gap-2 overflow-x-auto pb-0.5 snap-x snap-mandatory [scrollbar-width:none]"
        role="navigation"
        aria-label="دسترسی سریع"
      >
        <Link to="/chat" className="settings-pill snap-start">
          <MessageSquare className="size-4 text-[var(--st-accent)]" aria-hidden />
          گفتگو
        </Link>
        <Link
          to="/settings/personalization"
          className="settings-pill snap-start"
        >
          <Palette className="size-4 text-[var(--st-accent)]" aria-hidden />
          ظاهر
        </Link>
        <Link to="/settings/billing" className="settings-pill snap-start">
          <CreditCard className="size-4 text-[var(--st-accent)]" aria-hidden />
          بسته
        </Link>
        <Link to="/shop" className="settings-pill snap-start">
          <ShoppingBag className="size-4 text-[var(--st-accent)]" aria-hidden />
          خرید
        </Link>
      </div>

      <Link
        to="/settings/account"
        className="settings-row-link p-4 block"
        aria-label="مشاهده و ویرایش حساب کاربری"
      >
        <div className="flex items-center gap-4">
          <div
            className="settings-avatar size-14 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0"
            aria-hidden
          >
            {initial}
          </div>
          <div className="min-w-0 flex-1 text-right">
            <div className="flex items-center justify-end gap-2 flex-wrap">
              <span className="settings-badge">پلن {planLabel}</span>
            </div>
            <p className="text-base font-semibold truncate mt-1">{label}</p>
            <p className="text-xs text-[var(--st-muted)] truncate" dir="ltr">
              {user?.email}
            </p>
            <p className="text-xs text-[var(--st-accent)] mt-1.5">
              رمز عبور و امنیت حساب
            </p>
          </div>
          <ChevronLeft
            className="size-5 shrink-0 text-[var(--st-muted)]"
            aria-hidden
          />
        </div>
      </Link>

      <SettingsSection title="سهمیه و بسته" id="quota-heading">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-sm font-medium inline-flex items-center gap-2">
              <Gauge className="size-4 text-[var(--st-accent)]" aria-hidden />
              پیام پیشرفته (امروز)
            </span>
            <span
              className="text-xs font-medium text-[var(--st-muted)] tabular-nums"
              dir="ltr"
            >
              {used} / {limit}
            </span>
          </div>
          <div
            className="settings-progress-track"
            role="progressbar"
            aria-valuenow={used}
            aria-valuemin={0}
            aria-valuemax={limit}
            aria-label="مصرف سهمیه روزانه"
          >
            <div
              className="settings-progress-fill"
              data-level={level === "ok" ? undefined : level}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[11px] text-[var(--st-muted)] mt-2 leading-relaxed">
            {quotaHint}
          </p>
        </div>
        <SettingsMenuItem
          icon={<CreditCard className="size-5" />}
          label="تمدید و ارتقا بسته"
          description="مقایسه پلن‌ها و شارژ تومانی"
          href="/settings/billing"
        />
      </SettingsSection>

      <SettingsSection title="ترجیحات" id="prefs-heading">
        <SettingsMenuItem
          icon={<Palette className="size-5" />}
          label="شخصی‌سازی"
          description="تم، چگالی رابط، مدل پیش‌فرض و حرکت"
          href="/settings/personalization"
        />
        <SettingsMenuItem
          icon={<UserCircle2 className="size-5" />}
          label="پروفایل"
          description="نام نمایشی در اپ و چت"
          href="/settings/profile"
        />
      </SettingsSection>

      {user?.role === "admin" && (
        <SettingsSection
          title="مدیریت سامانه"
          id="admin-heading"
          variant="admin"
        >
          <SettingsMenuItem
            icon={<Shield className="size-5" />}
            label="پنل ادمین"
            description="کاربران، درخواست‌ها و مدل‌ها"
            href="/settings/admin"
            badge="Admin"
          />
        </SettingsSection>
      )}

      <SettingsSection title="بیشتر" id="more-heading">
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
      </SettingsSection>

      <section aria-label="خروج از حساب">
        <div className="settings-card">
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