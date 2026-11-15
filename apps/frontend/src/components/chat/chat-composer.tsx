"use client";

import { Loader2, Send } from "lucide-react";
import { FormEvent, KeyboardEvent } from "react";

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  sending,
  disabled,
  disabledHint,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  sending: boolean;
  disabled?: boolean;
  disabledHint?: string;
}) {
  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      onSubmit();
    }
  }

  return (
    <div className="shrink-0 px-3 sm:px-4 pb-4 pt-2">
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          onSubmit();
        }}
        className="max-w-3xl mx-auto"
      >
        <div className="relative flex items-end gap-2 rounded-2xl border border-[var(--chat-border)] bg-[var(--chat-input-bg)] px-3 py-2 shadow-lg shadow-black/20">
          <label className="sr-only" htmlFor="chat-input">
            پیام
          </label>
          <textarea
            id="chat-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={disabled}
            placeholder={
              disabled && disabledHint
                ? disabledHint
                : "پیام خود را بنویسید…"
            }
            className="flex-1 max-h-40 min-h-[2.75rem] resize-none bg-transparent px-1 py-2 text-sm text-[var(--chat-text)] placeholder:text-[var(--chat-muted)] outline-none"
          />
          <button
            type="submit"
            disabled={sending || !value.trim() || disabled}
            aria-label="ارسال"
            className="shrink-0 size-11 rounded-xl bg-[var(--chat-accent)] text-white cursor-pointer transition-colors duration-200 hover:bg-[var(--chat-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center"
          >
            {sending ? (
              <Loader2 className="size-5 animate-spin" aria-hidden />
            ) : (
              <Send className="size-5" aria-hidden />
            )}
          </button>
        </div>
        <p className="text-center text-[11px] text-[var(--chat-muted)] mt-2">
          پاسخ‌ها توسط هوش مصنوعی تولید می‌شوند. برای تصمیم‌های مهم منابع را
          بررسی کنید.
        </p>
      </form>
    </div>
  );
}