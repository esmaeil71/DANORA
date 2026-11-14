"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, User } from "lucide-react";
import { api, UserMe } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserMe | null>(null);

  useEffect(() => {
    api<UserMe>("/auth/me")
      .then(setUser)
      .catch(() => router.replace("/login"));
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-lg mx-auto px-4 sm:px-6 py-10">
        <Link
          href="/chat"
          className="min-h-11 inline-flex items-center gap-2 text-primary text-sm cursor-pointer hover:underline"
        >
          <ArrowRight className="size-4" aria-hidden />
          بازگشت به چت
        </Link>
        <h1 className="text-2xl font-bold mt-4 mb-6 text-foreground">تنظیمات</h1>
        {user && (
          <dl className="bg-card border border-border rounded-2xl p-6 space-y-4 text-sm shadow-sm">
            <div className="flex items-start gap-3">
              <div className="size-11 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <User className="size-5 text-primary" aria-hidden />
              </div>
              <div>
                <dt className="text-muted-foreground">ایمیل</dt>
                <dd dir="ltr" className="mt-1 font-medium">
                  {user.email}
                </dd>
              </div>
            </div>
            <div>
              <dt className="text-muted-foreground">پلن</dt>
              <dd className="mt-1 font-medium">
                {user.plan === "free" ? "رایگان" : user.plan}
              </dd>
            </div>
            <p className="text-muted-foreground text-xs pt-2 border-t border-border leading-relaxed">
              خرید اعتباری با تومان و درگاه ایرانی در به‌روزرسانی بعدی فعال
              می‌شود.
            </p>
          </dl>
        )}
      </main>
    </div>
  );
}