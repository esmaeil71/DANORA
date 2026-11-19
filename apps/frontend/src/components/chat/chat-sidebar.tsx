import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import {
  LogOut,
  MessageSquarePlus,
  Settings,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { ConversationRow } from "@/lib/api";

export function ChatSidebar({
  open,
  onClose,
  conversations,
  activeId,
  onNewChat,
  onSelect,
  onRemove,
  onLogout,
  compact = false,
}: {
  open: boolean;
  onClose: () => void;
  conversations: ConversationRow[];
  activeId?: string;
  onNewChat: () => void;
  onSelect: (id: string) => void;
  onRemove: (id: string, e: MouseEvent) => void;
  onLogout: () => void;
  compact?: boolean;
}) {
  const rowClass = compact
    ? "min-h-8 py-1.5 text-xs"
  : "min-h-10 py-2 text-sm";
  function closeOnMobileAfterSelect() {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches) {
      onClose();
    }
  }

  if (!open) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        aria-label="بستن منو"
        className="md:hidden fixed inset-0 z-20 bg-black/60"
        onClick={onClose}
      />

      <aside
        id="chat-conversations-sidebar"
        className="chat-sidebar-panel fixed md:relative z-30 md:z-auto inset-y-0 right-0 w-[min(100%,280px)] shrink-0 flex flex-col border-l border-[var(--chat-border)] bg-[var(--chat-surface)] transition-transform duration-200 translate-x-0"
      >
        <div className="shrink-0 h-14 px-3 border-b border-[var(--chat-border)]/80 flex items-center justify-between gap-2">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-[var(--chat-text)] h-10 px-1 shrink-0 cursor-pointer"
          >
            <Sparkles className="size-5 text-[var(--chat-accent)]" aria-hidden />
            دانورا
          </Link>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onNewChat}
              className="h-10 px-3 rounded-lg text-sm bg-[var(--chat-accent)] text-white cursor-pointer hover:bg-[var(--chat-accent-hover)] transition-colors duration-200 inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <MessageSquarePlus className="size-4 shrink-0" aria-hidden />
              گفتگوی جدید
            </button>
          </div>
        </div>

        <div
          className="chat-scroll flex-1 min-h-0 p-2 space-y-0.5"
          aria-label="گفتگوها"
        >
          {conversations.length === 0 && (
            <p className="text-xs text-[var(--chat-muted)] text-center py-8 px-2">
              هنوز گفتگویی نیست
            </p>
          )}
          {conversations.map((c) => (
            <div key={c.id} className="group relative">
              <button
                type="button"
                onClick={() => {
                  onSelect(c.id);
                  closeOnMobileAfterSelect();
                }}
                className={`w-full text-right px-3 rounded-lg truncate cursor-pointer transition-colors duration-200 ${rowClass} ${
                  activeId === c.id
                    ? "bg-[var(--chat-surface-hover)] text-[var(--chat-text)]"
                    : "text-[var(--chat-muted)] hover:bg-[var(--chat-surface-hover)] hover:text-[var(--chat-text)]"
                }`}
              >
                {c.title}
              </button>
              <button
                type="button"
                aria-label={`حذف ${c.title}`}
                onClick={(e) => onRemove(c.id, e)}
                className="absolute left-1 top-1/2 -translate-y-1/2 size-9 rounded-md opacity-0 group-hover:opacity-100 text-[var(--chat-muted)] hover:text-red-400 cursor-pointer inline-flex items-center justify-center"
              >
                <Trash2 className="size-3.5" aria-hidden />
              </button>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-[var(--chat-border)] text-sm space-y-0.5">
          <Link
            to="/settings"
            className="flex items-center gap-2 min-h-10 px-2 rounded-lg hover:bg-[var(--chat-surface-hover)] text-[var(--chat-text)] cursor-pointer"
          >
            <Settings className="size-4" aria-hidden />
            تنظیمات
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-2 min-h-10 px-2 rounded-lg hover:bg-[var(--chat-surface-hover)] text-[var(--chat-text)] cursor-pointer"
          >
            <LogOut className="size-4" aria-hidden />
            خروج
          </button>
        </div>
      </aside>
    </>
  );
}