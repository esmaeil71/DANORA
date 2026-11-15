import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    setDevLink(null);
    try {
      const res = await api<{
        message: string;
        devResetUrl?: string;
      }>("/auth/forgot-password", {
        method: "POST",
        json: { email: email.trim().toLowerCase() },
      });
      setMessage(res.message);
      if (res.devResetUrl) {
        try {
          const u = new URL(res.devResetUrl);
          setDevLink(`${u.pathname}${u.search}`);
        } catch {
          setDevLink(res.devResetUrl);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-md">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowRight className="size-4" aria-hidden />
            بازگشت به ورود
          </Link>
          <h1 className="text-2xl font-bold text-card-foreground mb-2">
            فراموشی رمز عبور
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            ایمیل حساب خود را وارد کنید. اگر ثبت شده باشد، لینک تنظیم رمز جدید
            برایتان ارسال می‌شود.
          </p>
          <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 text-sm">
              <label htmlFor="email">ایمیل</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-h-11 bg-background border border-border rounded-lg px-3 py-2 transition-colors focus:border-primary"
                dir="ltr"
              />
            </div>
            {error && (
              <p className="text-destructive text-sm" role="alert">
                {error}
              </p>
            )}
            {message && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400" role="status">
                {message}
              </p>
            )}
            {devLink && (
              <p className="text-xs text-muted-foreground">
                توسعه (SMTP نیست):{" "}
                <Link to={devLink} className="text-primary underline">
                  باز کردن لینک بازیابی
                </Link>
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="min-h-11 rounded-lg bg-accent text-white font-medium disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              ارسال لینک بازیابی
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}