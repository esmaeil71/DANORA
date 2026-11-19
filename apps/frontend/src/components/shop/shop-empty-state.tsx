import { Search, Sparkles } from "lucide-react";

const examples = [
  "کفش ورزشی مردانه تا ۲ میلیون",
  "لپ‌تاپ گیمینگ ارزان",
  "هدفون بلوتوثی با کیفیت",
];

export function ShopEmptyState({
  onPick,
}: {
  onPick: (text: string) => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12 gap-6 max-w-lg mx-auto">
      <div className="size-14 rounded-2xl bg-[var(--shop-accent-soft)] flex items-center justify-center">
        <Sparkles className="size-7 text-[var(--shop-accent)]" aria-hidden />
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">خرید هوشمند</h2>
        <p className="text-sm text-[var(--shop-muted)] leading-relaxed">
          بگو چه می‌خواهی و تا چه قیمتی؛ دانورا از دیجی‌کالا، ترب و فروشگاه‌های
          متصل پیشنهاد می‌آورد و لینک خرید می‌دهد.
        </p>
      </div>
      <ul className="w-full space-y-2">
        {examples.map((ex) => (
          <li key={ex}>
            <button
              type="button"
              onClick={() => onPick(ex)}
              className="w-full flex items-center gap-2 min-h-11 px-4 rounded-xl border border-[var(--shop-border)] bg-[var(--shop-surface)] text-sm text-right hover:bg-[var(--shop-surface-hover)] cursor-pointer transition-colors"
            >
              <Search className="size-4 shrink-0 text-[var(--shop-accent)]" aria-hidden />
              {ex}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}