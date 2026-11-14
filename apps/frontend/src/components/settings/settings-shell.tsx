import { Link, Outlet, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
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
};

export function SettingsShell() {
  const { pathname } = useLocation();
  const title =
    titles[pathname] ??
    (pathname.startsWith("/settings/admin/users/")
      ? "جزئیات کاربر"
      : "تنظیمات");
  const backTo = pathname === "/settings" ? "/chat" : "/settings";

  return (
    <div className="settings-dark min-h-[100dvh]">
      <header className="sticky top-0 z-10 border-b border-[var(--st-border)]/80 bg-[var(--st-bg)]/90 backdrop-blur-md">
        <div className="max-w-xl mx-auto h-14 px-4 flex items-center justify-between gap-3">
          <Link
            to={backTo}
            className="min-h-10 inline-flex items-center gap-2 text-sm text-[var(--st-muted)] hover:text-[var(--st-text)] transition-colors"
          >
            <ArrowRight className="size-4" aria-hidden />
            {pathname === "/settings" ? "بازگشت به چت" : "تنظیمات"}
          </Link>
          <span className="text-sm font-semibold text-[var(--st-text)]">{title}</span>
          <span className="w-[88px]" aria-hidden />
        </div>
      </header>
      <Outlet />
    </div>
  );
}