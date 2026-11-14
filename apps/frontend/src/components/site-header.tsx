import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-foreground cursor-pointer transition-opacity hover:opacity-90 min-h-11"
        >
          <Sparkles className="size-5 text-primary" aria-hidden />
          <span>دانورا</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            to="/login"
            className="min-h-11 min-w-[4.5rem] inline-flex items-center justify-center px-4 rounded-lg text-foreground cursor-pointer transition-colors duration-200 hover:bg-muted"
          >
            ورود
          </Link>
          <Link
            to="/register"
            className="min-h-11 inline-flex items-center justify-center px-5 rounded-lg bg-accent text-white font-medium cursor-pointer transition-colors duration-200 hover:brightness-110"
          >
            ثبت‌نام رایگان
          </Link>
        </nav>
      </div>
    </header>
  );
}