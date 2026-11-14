"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { api } from "@/lib/api";

type Mode = "login" | "register";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
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
      router.push("/chat");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا");
    } finally {
      setLoading(false);
    }
  }

  const other = mode === "login" ? "register" : "login";
  const otherLabel = mode === "login" ? "ثبت‌نام" : "ورود";

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold mb-2">
          {mode === "login" ? "ورود به دانورا" : "ثبت‌نام در دانورا"}
        </h1>
        <p className="text-muted text-sm mb-6">
          {mode === "login"
            ? "با ایمیل و رمز عبور وارد شوید"
            : "حساب رایگان بسازید و چت را شروع کنید"}
        </p>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            ایمیل
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-accent"
              dir="ltr"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            رمز عبور
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-accent"
              dir="ltr"
            />
          </label>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-2.5 rounded-lg bg-accent text-white font-medium hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? "لطفاً صبر کنید…" : mode === "login" ? "ورود" : "ثبت‌نام"}
          </button>
        </form>

        <p className="mt-6 text-sm text-muted text-center">
          {mode === "login" ? "حساب ندارید؟" : "قبلاً ثبت‌نام کرده‌اید؟"}{" "}
          <Link href={`/${other}`} className="text-accent hover:underline">
            {otherLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}