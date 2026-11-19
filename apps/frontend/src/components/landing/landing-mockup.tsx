import { Sparkles } from "lucide-react";

export function LandingMockup() {
  return (
    <div
      className="landing-card relative mx-auto w-full max-w-md overflow-hidden shadow-sm"
      aria-label="پیش‌نمایش محیط چت دانورا"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-primary/30" aria-hidden />
      <div className="h-11 px-4 border-b border-border flex items-center justify-between bg-muted/60">
        <span className="text-[10px] text-muted-foreground font-medium">
          GPT-4o Mini
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Sparkles className="size-3.5 text-primary" aria-hidden />
          دانورا
        </span>
      </div>
      <div className="p-4 space-y-3 min-h-[220px] bg-background">
        <p className="text-[10px] text-muted-foreground text-center mb-2">
          نمونه گفتگوی زنده
        </p>
        <div className="mr-6 rounded-xl bg-[var(--color-user-bubble)] px-3 py-2.5 text-xs text-foreground leading-relaxed">
          طرح درس ریاضی پایه دوازدهم را خلاصه کن
        </div>
        <div className="ml-6 rounded-xl border border-border bg-card px-3 py-2.5 text-xs text-muted-foreground leading-relaxed">
          حتماً. این طرح شامل مقدمه، اهداف یادگیری و تمرین‌های مرحله‌ای است…
          <span
            className="inline-block w-0.5 h-3.5 bg-primary align-middle mr-1 landing-mockup-pulse"
            aria-hidden
          />
        </div>
      </div>
      <div className="px-3 py-2.5 border-t border-border flex items-center gap-2 bg-card">
        <span className="size-9 rounded-lg border border-border bg-muted/80 shrink-0" />
        <span className="flex-1 h-9 rounded-lg border border-border bg-muted/50" />
        <span className="size-9 rounded-lg bg-primary/15 border border-primary/25 shrink-0" />
      </div>
    </div>
  );
}