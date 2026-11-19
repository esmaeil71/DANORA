import { Link, Outlet, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useUserPrefs } from "@/hooks/use-user-prefs";
import "../../pages/settings/settings-theme.css";

const titles: Record<string, string> = {
  "/settings": "تنظیمات",
  "/settings/account": "حساب کاربری",
  "/settings/profile": "پروفایل",
  "/settings/personalization": "شخصی‌سازی",
  "/settings/billing": "بسته و پرداخت",
  "/settings/developer": "توسعه‌دهندگان",
  "/settings/support": "پشتیبانی",
  "/settings/about": "درباره دانورا",
  "/settings/admin": "مدیریت",
  "/settings/admin/users": "کاربران",
  "/settings/admin/requests": "درخواست‌ها",
  "/settings/admin/models": "مدل‌ها",
  "/settings/admin/shop": "مارکت‌پلیس",
};

export function SettingsShell() {
  const { prefs } = useUserPrefs(true);
  const { pathname } = useLocation();
  const title =
    titles[pathname] ??
    (pathname.startsWith("/settings/admin/users/")
      ? "جزئیات کاربر"
      : "تنظیمات");
  const backTo = pathname === "/settings" ? "/chat" : "/settings";

  return (
    <div
      className={`settings-root ${prefs.chatTheme === "light" ? "settings-light" : "settings-dark"} min-h-[100dvh]`}
    >
      <header className="sticky top-0 z-10 border-b border-[var(--st-border)]/70 bg-[color-mix(in_srgb,var(--st-bg)_88%,transparent)] backdrop-blur-md">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 min-h-11">
            <Link
              to={backTo}
              className="settings-header-link inline-flex items-center gap-1.5 text-sm text-[var(--st-muted)] justify-self-start"
            >
              <ArrowRight className="size-4 shrink-0" aria-hidden />
              <span className="truncate max-w-[9rem] sm:max-w-none">
                {pathname === "/settings" ? "بازگشت به چت" : "تنظیمات"}
              </span>
            </Link>
            <h1 className="text-sm font-semibold text-[var(--st-text)] text-center px-1">
              {title}
            </h1>
            <span className="justify-self-end w-11" aria-hidden />
          </div>
          {pathname === "/settings" && (
            <p className="mt-1 text-center text-xs text-[var(--st-muted)] leading-relaxed">
              حساب، سهمیه، ترجیحات و ابزارهای شما
            </p>
          )}
        </div>
      </header>
      <Outlet />
    </div>
  );
}