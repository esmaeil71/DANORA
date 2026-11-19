import { Check } from "lucide-react";
import type { ModelRow } from "@/lib/api";

export const providerLabel: Record<string, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google",
};

export function ModelListItems({
  models,
  modelId,
  onSelect,
  compact = false,
}: {
  models: ModelRow[];
  modelId: string;
  onSelect: (id: string) => void;
  compact?: boolean;
}) {
  if (models.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-xs text-[var(--chat-muted)]">
        هیچ مدلی فعال نیست
      </p>
    );
  }

  return (
    <ul role="listbox" className={compact ? "py-1" : "space-y-2"}>
      {models.map((m) => {
        const selected = m.id === modelId;
        return (
          <li key={m.id} role="option" aria-selected={selected}>
            <button
              type="button"
              onClick={() => onSelect(m.id)}
              className={`w-full text-right flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                compact
                  ? `px-4 py-2.5 text-sm ${
                      selected
                        ? "bg-[var(--chat-accent)]/15 text-[var(--chat-text)]"
                        : "text-[var(--chat-muted)] hover:bg-[var(--chat-surface-hover)] hover:text-[var(--chat-text)]"
                    }`
                  : `px-4 py-3 rounded-xl border ${
                      selected
                        ? "border-[var(--chat-accent)] bg-[var(--chat-accent)]/10"
                        : "border-[var(--chat-border)] hover:bg-[var(--chat-surface-hover)]"
                    }`
              }`}
            >
              <span className="min-w-0 text-right">
                <span className="block text-sm font-medium">{m.displayName}</span>
                <span className="block text-[11px] text-[var(--chat-muted)] mt-0.5">
                  {providerLabel[m.provider] ?? m.provider}
                </span>
              </span>
              {selected && (
                <Check
                  className="size-4 shrink-0 text-[var(--chat-accent)]"
                  aria-hidden
                />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}