import { ChevronLeft, List } from "lucide-react";
import type { ModelRow } from "@/lib/api";
import { ModelListItems } from "./model-list-items";

export function ChatModelMenu({
  models,
  modelId,
  onSelect,
  onOpenAllModels,
}: {
  models: ModelRow[];
  modelId: string;
  onSelect: (id: string) => void;
  onOpenAllModels: () => void;
}) {
  return (
    <div
      className="absolute top-full mt-1 right-0 min-w-[240px] max-w-[min(100vw-2rem,320px)] rounded-xl border border-[var(--chat-border)] bg-[var(--chat-surface)] shadow-xl z-50 overflow-hidden"
      role="dialog"
      aria-label="انتخاب مدل"
    >
      <div className="chat-scroll max-h-[min(280px,45dvh)] overflow-y-auto">
        <ModelListItems
          models={models}
          modelId={modelId}
          onSelect={onSelect}
          compact
        />
      </div>
      <div className="border-t border-[var(--chat-border)] p-1">
        <button
          type="button"
          onClick={onOpenAllModels}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 text-sm font-medium text-[var(--chat-text)] rounded-lg hover:bg-[var(--chat-surface-hover)] cursor-pointer transition-colors"
        >
          <ChevronLeft className="size-4 text-[var(--chat-muted)]" aria-hidden />
          <span className="flex items-center gap-2">
            <List className="size-4 text-[var(--chat-accent)]" aria-hidden />
            لیست مدل‌ها
          </span>
        </button>
      </div>
    </div>
  );
}