import { Link } from "react-router-dom";
import { SettingsPanel } from "@/components/settings/settings-panel";

export function SettingsAboutPage() {
  return (
    <main className="max-w-xl mx-auto px-4 py-6 pb-12 space-y-6">
      <SettingsPanel title="دانورا چیست؟">
        <div className="px-4 py-4 text-sm text-[var(--st-muted)] space-y-3 leading-relaxed">
          <p>
            دانورا یک واسط چت هوش مصنوعی چندمدلی برای کاربران ایرانی است. GPT،
            Claude و Gemini را در یک محیط واحد با استریم پاسخ و تاریخچه در
            اختیار دارید.
          </p>
          <p>
            کلیدهای API روی سرور نگهداری می‌شوند؛ نیازی به BYOK در نسخه فعلی
            نیست.
          </p>
        </div>
      </SettingsPanel>

      <SettingsPanel title="قوانین استفاده">
        <ul className="px-4 py-4 text-sm text-[var(--st-muted)] space-y-2 list-disc list-inside">
          <li>اطلاعات حساس و رمز یکبارمصرف را در چت قرار ندهید.</li>
          <li>خروجی مدل‌ها را برای تصمیم‌های مهم حتماً بازبینی کنید.</li>
          <li>سوءاستفاده از API موجب مسدودسازی حساب می‌شود.</li>
        </ul>
      </SettingsPanel>

      <SettingsPanel title="نسخه">
        <p className="px-4 py-4 text-sm" dir="ltr">
          DANORA MVP · 2026
        </p>
      </SettingsPanel>

      <Link
        to="/"
        className="block text-center text-sm text-violet-300 hover:underline"
      >
        بازگشت به صفحهٔ اصلی
      </Link>
    </main>
  );
}