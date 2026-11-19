import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Bot,
  Check,
  ChevronDown,
  Code2,
  FileText,
  Headphones,
  Layers,
  List,
  Lock,
  Mic,
  MessageSquare,
  Palette,
  Radio,
  Shield,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { LandingMockup } from "@/components/landing/landing-mockup";
import { LandingSection } from "@/components/landing/landing-section";
import "./home/home-landing.css";

const stats = [
  { value: "۴+", label: "مدل فعال" },
  { value: "RTL", label: "رابط فارسی" },
  { value: "SSE", label: "پاسخ استریم" },
  { value: "API", label: "برای توسعه‌دهندگان" },
];

const trustItems = [
  { icon: Lock, text: "کلید API روی سرور" },
  { icon: Shield, text: "احراز هویت JWT" },
  { icon: Radio, text: "مصرف روزانه شفاف" },
];

const features = [
  {
    icon: Layers,
    title: "چند مدل، یک محیط",
    text: "OpenAI، Anthropic، Google و مدل‌های سفارشی از یک منو.",
  },
  {
    icon: MessageSquare,
    title: "چت استریم",
    text: "پاسخ لحظه‌ای؛ تاریخچه در سایدبار.",
  },
  {
    icon: List,
    title: "لیست مدل‌ها",
    text: "صفحه اختصاصی انتخاب مدل.",
  },
  {
    icon: Shield,
    title: "امنیت کلید",
    text: "بدون افشای کلید provider در مرورگر.",
  },
  {
    icon: FileText,
    title: "پیوست متنی",
    text: "ارسال فایل txt و md در پیام.",
  },
  {
    icon: Mic,
    title: "ورودی صوتی",
    text: "تبدیل گفتار به متن در مرورگر.",
  },
  {
    icon: Palette,
    title: "شخصی‌سازی",
    text: "تم، چگالی و مدل پیش‌فرض.",
  },
  {
    icon: Wallet,
    title: "بسته و مصرف",
    text: "سهمیه روزانه و درخواست ارتقا.",
  },
];

const steps = [
  {
    n: "01",
    title: "ثبت‌نام",
    text: "حساب بسازید و وارد شوید.",
  },
  {
    n: "02",
    title: "انتخاب مدل",
    text: "از هدر چت یا لیست مدل‌ها.",
  },
  {
    n: "03",
    title: "شروع گفتگو",
    text: "متن، فایل یا صدا — پاسخ استریم.",
  },
];

const models = [
  { name: "GPT-4o Mini", provider: "OpenAI" },
  { name: "Claude 3.5 Haiku", provider: "Anthropic" },
  { name: "Gemini 2.0 Flash", provider: "Google" },
  { name: "DeepSeek V4 Pro", provider: "سفارشی" },
];

const comparison = [
  { feature: "چند مدل در یک حساب", danora: true, other: false },
  { feature: "رابط فارسی RTL", danora: true, other: false },
  { feature: "تاریخچه گفتگو", danora: true, other: true },
  { feature: "کلید API یکپارچه (dnr)", danora: true, other: false },
  { feature: "بدون کلید شخصی OpenAI", danora: true, other: false },
];

const faqs = [
  {
    q: "آیا به کلید OpenAI شخصی نیاز دارم؟",
    a: "خیر. کلیدهای provider روی سرور نگهداری می‌شوند؛ شما با حساب دانورا چت می‌کنید.",
  },
  {
    q: "سقف روزانه چگونه است؟",
    a: "در پلن رایگان سقف پیام روزانه اعمال می‌شود. جزئیات در تنظیمات › بسته و پرداخت.",
  },
  {
    q: "می‌توانم از API استفاده کنم؟",
    a: "بله. در تنظیمات › توسعه‌دهندگان کلید dnr_ بسازید و درخواست را به backend دانورا بفرستید.",
  },
  {
    q: "کدام مدل‌ها فعال‌اند؟",
    a: "بسته به پیکربندی سرور و seed دیتابیس. فهرست به‌روز را در چت یا /chat/models می‌بینید.",
  },
];

export function HomePage() {
  return (
    <div className="landing-page min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <main>
        <section className="relative border-b border-border overflow-hidden">
          <div className="absolute inset-0 landing-dot-grid pointer-events-none" aria-hidden />
          <div className="relative max-w-[var(--landing-max)] mx-auto px-4 sm:px-6 pt-12 pb-16 sm:pt-16 sm:pb-20">
            <div className="grid lg:grid-cols-[1fr_minmax(0,22rem)] gap-12 lg:gap-16 items-center">
              <div className="text-right order-2 lg:order-1">
                <p className="inline-flex items-center gap-2 text-sm font-medium text-primary border border-border bg-card rounded-full px-4 py-1.5 mb-6">
                  <Zap className="size-4" aria-hidden />
                  پلتفرم چت هوش مصنوعی برای ایران
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold leading-[1.15] text-foreground tracking-tight">
                  یک محیط حرفه‌ای
                  <span className="block text-primary mt-2">برای همه مدل‌ها</span>
                </h1>
                <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
                  دانورا واسط API است: ثبت‌نام، انتخاب مدل، گفتگوی استریم،
                  تنظیمات حساب و API توسعه‌دهندگان — با تمرکز بر تجربه فارسی.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/register"
                    className="landing-focus min-h-12 inline-flex items-center justify-center gap-2 px-8 rounded-xl bg-accent text-white font-semibold cursor-pointer transition-all duration-200 hover:brightness-110"
                  >
                    <MessageSquare className="size-5" aria-hidden />
                    شروع رایگان
                  </Link>
                  <Link
                    to="/login"
                    className="landing-focus min-h-12 inline-flex items-center justify-center px-8 rounded-xl border border-border bg-card text-foreground font-medium cursor-pointer transition-colors duration-200 hover:bg-muted"
                  >
                    ورود به حساب
                  </Link>
                </div>
                <ul className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {stats.map((s) => (
                    <li
                      key={s.label}
                      className="landing-card px-3 py-3 text-right"
                    >
                      <p className="text-lg font-bold text-foreground tabular-nums">
                        {s.value}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {s.label}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="order-1 lg:order-2">
                <LandingMockup />
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-card/40 py-6">
          <div className="max-w-[var(--landing-max)] mx-auto px-4 sm:px-6">
            <ul className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 text-sm text-muted-foreground">
              {trustItems.map(({ icon: Icon, text }) => (
                <li key={text} className="inline-flex items-center gap-2">
                  <Icon className="size-4 text-primary" aria-hidden />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <LandingSection
          eyebrow="راه‌اندازی"
          title="سه قدم تا اولین پاسخ"
          description="بدون پیچیدگی اضافی — مسیر کوتاه از ثبت‌نام تا چت."
          centered
        >
          <ol className="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {steps.map((s) => (
              <li
                key={s.n}
                className="landing-card p-6 text-right relative overflow-hidden"
              >
                <span className="landing-eyebrow absolute top-4 left-4 opacity-60">
                  {s.n}
                </span>
                <h3 className="font-semibold text-lg text-foreground mt-6">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {s.text}
                </p>
              </li>
            ))}
          </ol>
        </LandingSection>

        <LandingSection
          id="features"
          eyebrow="قابلیت‌ها"
          title="همه‌چیز برای کار روزمره و توسعه"
          description="از چت ساده تا کلید API و شخصی‌سازی — در یک محصول واحد."
          className="border-y border-border bg-muted/20"
        >
          <div className="flex justify-end mb-6">
            <Link
              to="/chat/models"
              className="landing-focus text-sm font-medium text-primary inline-flex items-center gap-1 cursor-pointer hover:underline"
            >
              لیست کامل مدل‌ها
              <ArrowLeft className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, title, text }, index) => (
              <article
                key={title}
                className={`landing-card p-5 text-right ${index < 2 ? "sm:col-span-2" : ""}`}
              >
                <div className="size-10 rounded-xl bg-muted flex items-center justify-center mb-3">
                  <Icon className="size-5 text-primary" aria-hidden />
                </div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </LandingSection>

        <LandingSection
          id="models"
          eyebrow="کاتالوگ"
          title="مدل‌های پشتیبانی‌شده"
          description="نمایش بر اساس مدل‌های فعال روی سرور شما."
          centered
        >
          <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {models.map((m) => (
              <li key={m.name} className="landing-card px-4 py-4 text-right">
                <p className="font-semibold text-sm text-foreground">
                  {m.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {m.provider}
                </p>
              </li>
            ))}
          </ul>
        </LandingSection>

        <LandingSection
          eyebrow="مقایسه"
          title="چرا یک پلتفرم واحد؟"
          description="جایگزین جابه‌جایی بین چند سایت و مدیریت کلید جداگانه."
          centered
          className="border-t border-border bg-card/30"
        >
          <div className="overflow-x-auto rounded-2xl border border-border bg-card max-w-2xl mx-auto">
            <table className="w-full text-sm text-right">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 font-semibold text-foreground">
                    ویژگی
                  </th>
                  <th className="px-4 py-3 font-semibold text-primary">
                    دانورا
                  </th>
                  <th className="px-4 py-3 font-semibold text-muted-foreground">
                    چند سایت جدا
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr
                    key={row.feature}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 text-foreground">{row.feature}</td>
                    <td className="px-4 py-3 text-center">
                      <Check
                        className={`size-5 mx-auto ${row.danora ? "text-primary" : "text-muted/30"}`}
                        aria-label={row.danora ? "بله" : "خیر"}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={
                          row.other
                            ? "text-muted-foreground"
                            : "text-muted-foreground/40"
                        }
                      >
                        {row.other ? "گاهی" : "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </LandingSection>

        <LandingSection
          id="faq"
          eyebrow="پشتیبانی"
          title="سوالات پرتکرار"
          centered
          className="bg-muted/20 border-t border-border"
        >
          <div className="space-y-3 max-w-2xl mx-auto">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group landing-card p-4 text-right open:border-primary/30"
              >
                <summary className="font-medium text-foreground cursor-pointer list-none flex items-center justify-between gap-3">
                  {f.q}
                  <ChevronDown
                    className="size-4 text-muted-foreground shrink-0 transition-transform duration-200 group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </LandingSection>

        <section className="py-[var(--landing-section-y)]">
          <div className="max-w-[var(--landing-max)] mx-auto px-4 sm:px-6">
            <div className="landing-card border-2 border-primary/20 p-8 sm:p-12">
              <div className="flex flex-col lg:flex-row items-center gap-10">
                <div className="shrink-0 size-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Bot className="size-10 text-primary" aria-hidden />
                </div>
                <div className="text-right flex-1">
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                    آماده گفتگو هستید؟
                  </h2>
                  <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xl">
                    چت، تنظیمات، پشتیبانی و مستندات API — برای تیم‌ها و
                    استفاده شخصی.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      to="/register"
                      className="landing-focus min-h-11 inline-flex items-center px-6 rounded-lg bg-primary text-white font-medium cursor-pointer hover:opacity-90 transition-opacity duration-200"
                    >
                      ایجاد حساب رایگان
                    </Link>
                    <Link
                      to="/chat"
                      className="landing-focus min-h-11 inline-flex items-center gap-2 px-6 rounded-lg border border-border bg-background font-medium cursor-pointer hover:bg-muted transition-colors duration-200"
                    >
                      <Sparkles className="size-4" aria-hidden />
                      ورود به چت
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <ManualQuickLinks />
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-12 bg-card">
        <LandingFooter />
      </footer>
    </div>
  );
}

function ManualQuickLinks() {
  const links = [
    { to: "/settings/developer", label: "API توسعه‌دهندگان", icon: Code2 },
    { to: "/settings", label: "تنظیمات", icon: Sparkles },
    { to: "/settings/support", label: "پشتیبانی", icon: Headphones },
    { to: "/settings/billing", label: "بسته و مصرف", icon: Wallet },
  ];
  return (
    <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {links.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          className="landing-focus landing-card px-4 py-3 flex items-center gap-3 text-sm font-medium text-foreground cursor-pointer"
        >
          <Icon className="size-4 text-primary shrink-0" aria-hidden />
          {label}
        </Link>
      ))}
    </div>
  );
}

function LandingFooter() {
  return (
    <div className="max-w-[var(--landing-max)] mx-auto px-4 sm:px-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="text-right">
          <p className="font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            دانورا
          </p>
          <p className="mt-2 text-sm text-muted-foreground max-w-md leading-relaxed">
            پاسخ‌های مدل‌ها توسط هوش مصنوعی تولید می‌شوند؛ برای تصمیم‌های مهم
            منابع را بررسی کنید.
          </p>
        </div>
        <nav
          className="flex flex-wrap gap-x-6 gap-y-2 text-sm"
          aria-label="فوتر"
        >
          {[
            { to: "/register", label: "ثبت‌نام" },
            { to: "/login", label: "ورود" },
            { to: "/chat", label: "چت" },
            { to: "/chat/models", label: "مدل‌ها" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="landing-focus text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="mt-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} دانورا — Productivity · AI Chat · RTL
      </p>
    </div>
  );
}