import { Link, useLocation } from "react-router-dom";
import { MessageSquare, Settings, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const marketingLinks = [
  { href: "/#features", label: "امکانات" },
  { href: "/#models", label: "مدل‌ها" },
  { href: "/#faq", label: "سوالات" },
];

export function SiteHeader() {
  const [loggedIn, setLoggedIn] = useState(false);
  const { pathname } = useLocation();
  const onHome = pathname === "/";

  useEffect(() => {
    let cancelled = false;
    void api("/auth/me")
      .then(() => {
        if (!cancelled) setLoggedIn(true);
      })
      .catch(() => {
        if (!cancelled) setLoggedIn(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const linkClass =
    "landing-focus min-h-11 inline-flex items-center justify-center px-3 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer";

  return (
    <header className="border-b border-border bg-card/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-[var(--landing-max,72rem)] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Link
          to="/"
          className="landing-focus flex items-center gap-2 font-semibold text-foreground cursor-pointer min-h-11"
        >
          <Sparkles className="size-5 text-primary" aria-hidden />
          <span>دانورا</span>
        </Link>

        {onHome && !loggedIn && (
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="بخش‌های صفحه"
          >
            {marketingLinks.map((l) => (
              <a key={l.href} href={l.href} className={linkClass}>
                {l.label}
              </a>
            ))}
          </nav>
        )}

        <nav className="flex items-center gap-1 sm:gap-2 text-sm ms-auto">
          {loggedIn ? (
            <>
              <Link to="/chat" className={linkClass}>
                <MessageSquare className="size-4 sm:hidden" aria-hidden />
                <span>چت</span>
              </Link>
              <Link to="/settings" className={`${linkClass} hidden sm:inline-flex`}>
                <Settings className="size-4" aria-hidden />
                <span className="ms-1.5">تنظیمات</span>
              </Link>
              <Link
                to="/chat"
                className="landing-focus min-h-11 inline-flex items-center justify-center px-4 sm:px-5 rounded-lg bg-accent text-white font-medium cursor-pointer transition-all duration-200 hover:brightness-110"
              >
                ادامه گفتگو
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className={linkClass}>
                ورود
              </Link>
              <Link
                to="/register"
                className="landing-focus min-h-11 inline-flex items-center justify-center px-4 sm:px-5 rounded-lg bg-accent text-white font-medium cursor-pointer transition-all duration-200 hover:brightness-110"
              >
                ثبت‌نام رایگان
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}