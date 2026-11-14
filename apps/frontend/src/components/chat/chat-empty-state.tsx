"use client";

import { Sparkles } from "lucide-react";

const SUGGESTIONS = [
  "یک ایمیل رسمی برای درخواست جلسه بنویس",
  "تفاوت GPT و Claude را کوتاه توضیح بده",
  "ایده‌های محتوا برای شبکه‌های اجتماعی پیشنهاد بده",
  "این متن را خلاصه و رسمی کن",
];

export function ChatEmptyState({
  onPick,
}: {
  onPick: (text: string) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-12 text-center">
      <div className="size-14 rounded-2xl bg-[var(--chat-accent)]/15 flex items-center justify-center mb-6">
        <Sparkles className="size-7 text-[var(--chat-accent)]" aria-hidden />
      </div>
      <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--chat-text)] mb-2">
        چطور می‌توانم کمکت کنم؟
      </h1>
      <p className="text-[var(--chat-muted)] text-sm max-w-md mb-8 leading-relaxed">
        مدل را از بالا انتخاب کن و سوالت را بپرس. پاسخ به‌صورت استریم نمایش داده
        می‌شود.
      </p>
      <div className="grid sm:grid-cols-2 gap-2 w-full max-w-xl">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="text-right text-sm px-4 py-3 rounded-xl border border-[var(--chat-border)] bg-[var(--chat-surface)] text-[var(--chat-text)] cursor-pointer transition-colors duration-200 hover:bg-[var(--chat-surface-hover)] min-h-11"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}