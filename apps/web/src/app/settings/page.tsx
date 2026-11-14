"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, UserMe } from "@/lib/api";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserMe | null>(null);

  useEffect(() => {
    api<UserMe>("/auth/me")
      .then(setUser)
      .catch(() => router.replace("/login"));
  }, [router]);

  return (
    <div className="min-h-screen max-w-lg mx-auto px-6 py-10">
      <Link href="/chat" className="text-accent text-sm hover:underline">
        بازگشت به چت
      </Link>
      <h1 className="text-2xl font-bold mt-4 mb-6">تنظیمات</h1>
      {user && (
        <dl className="bg-surface border border-border rounded-xl p-6 space-y-4 text-sm">
          <div>
            <dt className="text-muted">ایمیل</dt>
            <dd dir="ltr" className="mt-1">
              {user.email}
            </dd>
          </div>
          <div>
            <dt className="text-muted">پلن</dt>
            <dd className="mt-1">
              {user.plan === "free" ? "رایگان" : user.plan}
            </dd>
          </div>
          <p className="text-muted text-xs pt-2 border-t border-border">
            خرید اعتباری با تومان و درگاه ایرانی در به‌روزرسانی بعدی فعال می‌شود.
          </p>
        </dl>
      )}
    </div>
  );
}