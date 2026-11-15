import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError("توکن بازیابی در آدرس نیست. لینک را از ایمیل دوباره باز کنید.");
      return;
    }
    if (password !== confirm) {
      setError("تکرار رمز با رمز جدید یکسان نیست");
      return;
    }
    if (password.length < 8) {
      setError("رمز جدید حداقل ۸ کاراکتر باشد");
      return;
    }
    setLoading(true);
    try {
      await api("/auth/reset-password", {
        method: "POST",
        json: { token, newPassword: password },
      });
      navigate("/login", {
        replace: true,
        state: { message: "رمز عبور به‌روز شد. وارد شوید." },
      });
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
          <h1 className="text-2xl font-bold text-card-foreground mb-2">
            رمز عبور جدید
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            رمز جدید را وارد کنید (حداقل ۸ کاراکتر).
          </p>
          {!token && (
            <p className="text-destructive text-sm mb-4" role="alert">
              لینک نامعتبر است. از صفحه{" "}
              <Link to="/forgot-password" className="underline">
                فراموشی رمز
              </Link>{" "}
              دوباره درخواست دهید.
            </p>
          )}
          <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 text-sm">
              <label htmlFor="new-password">رمز جدید</label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-h-11 bg-background border border-border rounded-lg px-3 py-2"
                dir="ltr"
                disabled={!token}
              />
            </div>
            <div className="flex flex-col gap-1.5 text-sm">
              <label htmlFor="confirm-password">تکرار رمز</label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="min-h-11 bg-background border border-border rounded-lg px-3 py-2"
                dir="ltr"
                disabled={!token}
              />
            </div>
            {error && (
              <p className="text-destructive text-sm" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || !token}
              className="min-h-11 rounded-lg bg-accent text-white font-medium disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              ذخیره رمز جدید
            </button>
          </form>
          <p className="mt-6 text-sm text-center text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">
              ورود
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}