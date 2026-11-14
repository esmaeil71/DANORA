import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-accent">دانورا</span>
        <nav className="flex gap-3 text-sm">
          <Link href="/login" className="px-4 py-2 rounded-lg hover:bg-surface">
            ورود
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent-hover"
          >
            ثبت‌نام رایگان
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-8 max-w-2xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
          همه مدل‌های هوش مصنوعی در یک چت
        </h1>
        <p className="text-muted text-lg leading-relaxed">
          GPT، Claude و Gemini — بدون نیاز به VPN یا کلید API شخصی. مصرف روزانه
          شفاف و پرداخت به‌زودی با تومان.
        </p>
        <Link
          href="/register"
          className="px-8 py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent-hover transition"
        >
          شروع چت
        </Link>
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted">
        پلتفرم واسط API — مدل‌ها روی زیرساخت ارائه‌دهندگان اجرا می‌شوند
      </footer>
    </div>
  );
}