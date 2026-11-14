import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import {
  LogOut,
  Menu,
  MessageSquarePlus,
  PanelRightClose,
  Settings,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import type { ConversationRow, UserMe } from "@/lib/api";

export function ChatSidebar({
  open,
  onClose,
  onToggle,
  conversations,
  activeId,
  user,
  onNewChat,
  onSelect,
  onRemove,
  onLogout,
}: {
  open: boolean;
  onClose: () => void;
  onToggle: () => void;
  conversations: ConversationRow[];
  activeId?: string;
  user: UserMe | null;
  onNewChat: () => void;
  onSelect: (id: string) => void;
  onRemove: (id: string, e: MouseEvent) => void;
  onLogout: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        aria-label="منوی گفتگوها"
        className="md:hidden fixed top-3 right-3 z-30 size-11 rounded-lg border border-[var(--chat-border)] bg-[var(--chat-surface)] text-[var(--chat-text)] cursor-pointer inline-flex items-center justify-center"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <button
          type="button"
          aria-label="بستن منو"
          className="md:hidden fixed inset-0 z-20 bg-black/60"
          onClick={onClose}
        />
      )}

      <aside
        className={`chat-gapgpt-sidebar fixed md:relative z-30 md:z-auto inset-y-0 right-0 w-[min(100%,280px)] flex flex-col border-l border-[var(--chat-border)] bg-[var(--chat-surface)] transition-transform duration-200 md:translate-x-0 ${
          open ? "translate-x-0" : "translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-3 border-b border-[var(--chat-border)] flex items-center gap-2">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-[var(--chat-text)] min-h-11 px-1 cursor-pointer"
          >
            <Sparkles className="size-5 text-[var(--chat-accent)]" aria-hidden />
            دانورا
          </Link>
          <button
            type="button"
            onClick={onNewChat}
            className="mr-auto min-h-10 px-3 rounded-lg text-sm bg-[var(--chat-accent)] text-white cursor-pointer hover:bg-[var(--chat-accent-hover)] transition-colors duration-200 inline-flex items-center gap-1.5"
          >
            <MessageSquarePlus className="size-4" aria-hidden />
            گفتگوی جدید
          </button>
          <button
            type="button"
            onClick={onClose}
            className="md:hidden size-10 rounded-lg text-[var(--chat-muted)] cursor-pointer hover:bg-[var(--chat-surface-hover)] inline-flex items-center justify-center"
            aria-label="بستن سایدبار"
          >
            <PanelRightClose className="size-5" />
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto p-2 space-y-0.5"
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
                  onClose();
                }}
                className={`w-full text-right min-h-10 px-3 py-2 rounded-lg text-sm truncate cursor-pointer transition-colors duration-200 ${
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

        <div className="p-3 border-t border-[var(--chat-border)] text-xs text-[var(--chat-muted)] space-y-1">
          {user && (
            <p className="truncate px-1" dir="ltr">
              {user.email}
            </p>
          )}
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