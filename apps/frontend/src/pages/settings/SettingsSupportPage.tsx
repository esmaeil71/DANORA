import { SettingsMenuItem } from "@/components/settings/settings-menu-item";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { Mail, MessageCircleQuestion } from "lucide-react";

const faq = [
  {
    q: "چرا پیام ارسال نمی‌شود؟",
    a: "سقف روزانه پلن رایگان، قطع بودن backend، یا نبودن کلید API روی سرور را بررسی کنید.",
  },
  {
    q: "رمز عبور را فراموش کردم",
    a: "فعلاً بازیابی خودکار نیست؛ با پشتیبانی تماس بگیرید یا حساب جدید بسازید.",
  },
  {
    q: "آیا کلید OpenAI خودم را می‌توانم بگذارم؟",
    a: "در MVP خیر — کلیدها فقط روی سرور دانورا نگهداری می‌شوند.",
  },
];

export function SettingsSupportPage() {
  return (
    <main className="max-w-xl mx-auto px-4 py-6 pb-12 space-y-6">
      <SettingsPanel title="تماس">
        <SettingsMenuItem
          icon={<Mail className="size-5" />}
          label="ایمیل پشتیبانی"
          description="support@danora.ir"
          href="mailto:support@danora.ir?subject=پشتیبانی%20دانورا"
        />
      </SettingsPanel>

      <SettingsPanel title="سؤالات متداول">
        <ul className="divide-y divide-[var(--st-border)]">
          {faq.map((item) => (
            <li key={item.q} className="px-4 py-4">
              <p className="text-sm font-medium flex items-start gap-2 text-[var(--st-text)]">
                <MessageCircleQuestion
                  className="size-4 text-violet-400 shrink-0 mt-0.5"
                  aria-hidden
                />
                {item.q}
              </p>
              <p className="text-xs text-[var(--st-muted)] mt-2 mr-6 leading-relaxed">
                {item.a}
              </p>
            </li>
          ))}
        </ul>
      </SettingsPanel>
    </main>
  );
}