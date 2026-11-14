import { Link } from "react-router-dom";
import {
  Bot,
  Layers,
  Shield,
  Wallet,
  MessageSquare,
  Zap,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";

const features = [
  {
    icon: Layers,
    title: "چند مدل، یک محیط",
    text: "GPT، Claude و Gemini را بدون جابه‌جایی بین سایت‌ها امتحان کنید.",
  },
  {
    icon: Shield,
    title: "کلید امن روی سرور",
    text: "API Key شما در مرورگر نیست؛ مصرف و سقف روزانه شفاف است.",
  },
  {
    icon: Wallet,
    title: "پرداخت تومان (به‌زودی)",
    text: "اعتبار روزانه رایگان الان؛ شارژ حساب با درگاه ایرانی در راه است.",
  },
];

export function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main>
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-primary bg-card border border-border rounded-full px-4 py-1.5 mb-6">
            <Zap className="size-4" aria-hidden />
            پلتفرم چت هوش مصنوعی برای ایران
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-foreground max-w-3xl mx-auto">
            همه مدل‌های محبوب در یک گفتگو
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            دانورا واسط هوشمند API است: ثبت‌نام کنید، مدل را انتخاب کنید و
            بلافاصله چت استریم را شروع کنید — بدون کلید شخصی.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="min-h-12 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 rounded-xl bg-accent text-white font-semibold cursor-pointer transition-all duration-200 hover:brightness-110"
            >
              <MessageSquare className="size-5" aria-hidden />
              شروع رایگان
            </Link>
            <Link
              to="/login"
              className="min-h-12 w-full sm:w-auto inline-flex items-center justify-center px-8 rounded-xl border border-border bg-card text-foreground font-medium cursor-pointer transition-colors duration-200 hover:bg-muted"
            >
              ورود
            </Link>
          </div>
        </section>

        <section className="border-t border-border bg-card/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid sm:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="rounded-2xl border border-border bg-card p-6 text-right shadow-sm transition-shadow duration-200 hover:shadow-md"
              >
                <div className="size-11 rounded-xl bg-muted flex items-center justify-center mb-4">
                  <Icon className="size-5 text-primary" aria-hidden />
                </div>
                <h2 className="font-semibold text-lg text-card-foreground">
                  {title}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="rounded-2xl border border-border bg-gradient-to-l from-primary/10 to-card p-8 sm:p-12 flex flex-col sm:flex-row items-center gap-8">
            <div className="shrink-0 size-24 rounded-2xl bg-primary/15 flex items-center justify-center">
              <Bot className="size-12 text-primary" aria-hidden />
            </div>
            <div className="text-right flex-1">
              <h2 className="text-2xl font-bold">آماده گفتگو هستید؟</h2>
              <p className="mt-2 text-muted-foreground">
                محیط چت با سایدبار تاریخچه، انتخاب مدل و پاسخ استریم — شبیه
                تجربه‌ای که از پلتفرم‌های بین‌المللی انتظار دارید.
              </p>
              <Link
                to="/chat"
                className="mt-6 min-h-11 inline-flex items-center px-6 rounded-lg bg-primary text-white font-medium cursor-pointer transition-opacity duration-200 hover:opacity-90"
              >
                رفتن به چت
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        پاسخ‌های مدل‌ها توسط هوش مصنوعی تولید می‌شوند؛ همیشه اطلاعات مهم را
        بررسی کنید.
      </footer>
    </div>
  );
}