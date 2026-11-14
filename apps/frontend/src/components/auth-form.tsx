import { Link, useNavigate } from "react-router-dom";
import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api(`/auth/${mode}`, { method: "POST", json: { email, password } });
      navigate("/chat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا");
    } finally {
      setLoading(false);
    }
  }

  const other = mode === "login" ? "register" : "login";
  const otherLabel = mode === "login" ? "ثبت‌نام" : "ورود";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-md">
          <h1 className="text-2xl font-bold text-card-foreground mb-2">
            {mode === "login" ? "ورود به دانورا" : "ثبت‌نام در دانورا"}
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            {mode === "login"
              ? "با ایمیل و رمز عبور وارد شوید"
              : "حساب رایگان بسازید و چت را شروع کنید"}
          </p>

          <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5 text-sm">
              <label htmlFor="email">ایمیل</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-h-11 bg-background border border-border rounded-lg px-3 py-2 text-foreground transition-colors duration-200 focus:border-primary"
                dir="ltr"
              />
            </div>
            <div className="flex flex-col gap-1.5 text-sm">
              <label htmlFor="password">رمز عبور</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-h-11 bg-background border border-border rounded-lg px-3 py-2 transition-colors duration-200 focus:border-primary"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">حداقل ۸ کاراکتر</p>
            </div>

            {error && (
              <p
                className="text-destructive text-sm bg-destructive/10 rounded-lg px-3 py-2"
                role="alert"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 min-h-11 rounded-lg bg-accent text-white font-medium cursor-pointer transition-opacity duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {loading ? "لطفاً صبر کنید…" : mode === "login" ? "ورود" : "ثبت‌نام"}
            </button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground text-center">
            {mode === "login" ? "حساب ندارید؟" : "قبلاً ثبت‌نام کرده‌اید؟"}{" "}
            <Link
              to={`/${other}`}
              className="text-primary font-medium cursor-pointer hover:underline"
            >
              {otherLabel}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}