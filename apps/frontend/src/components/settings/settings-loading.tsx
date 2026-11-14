import { Loader2 } from "lucide-react";

export function SettingsLoading() {
  return (
    <div className="min-h-[50dvh] flex items-center justify-center gap-2 text-[var(--st-muted)]">
      <Loader2 className="size-5 animate-spin" aria-hidden />
      در حال بارگذاری…
    </div>
  );
}