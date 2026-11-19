import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ModelListItems } from "@/components/chat/model-list-items";
import { api, ModelRow } from "@/lib/api";
import { loadUserPrefs, saveUserPrefs } from "@/lib/user-prefs";
import { useUserPrefs } from "@/hooks/use-user-prefs";
import "../chat/chat-theme.css";
import "../chat/chat-theme-light.css";

export function ChatModelsPage() {
  const navigate = useNavigate();
  const { prefs } = useUserPrefs(true);
  const themeClass = prefs.chatTheme === "light" ? "chat-light" : "chat-dark";
  const [models, setModels] = useState<ModelRow[]>([]);
  const [modelId, setModelId] = useState(loadUserPrefs().defaultModelId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await api("/auth/me");
        const list = await api<ModelRow[]>("/models");
        if (cancelled) return;
        setModels(list);
        const preferred = loadUserPrefs().defaultModelId;
        if (preferred && list.some((m) => m.id === preferred)) {
          setModelId(preferred);
        } else if (list[0]) {
          setModelId(list[0].id);
        }
      } catch {
        if (!cancelled) navigate("/login", { replace: true });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  function pick(id: string) {
    setModelId(id);
    saveUserPrefs({ defaultModelId: id });
    navigate("/chat", { state: { modelId: id }, replace: false });
  }

  return (
    <div className={`${themeClass} min-h-[100dvh] flex flex-col bg-[var(--chat-bg)]`}>
      <header className="shrink-0 h-14 px-4 flex items-center gap-3 border-b border-[var(--chat-border)] bg-[var(--chat-bg)]/95 backdrop-blur-sm">
        <Link
          to="/chat"
          className="inline-flex items-center gap-2 text-sm text-[var(--chat-muted)] hover:text-[var(--chat-text)] transition-colors"
        >
          <ArrowRight className="size-4" aria-hidden />
          بازگشت به چت
        </Link>
        <h1 className="flex-1 text-center text-sm font-semibold text-[var(--chat-text)]">
          لیست مدل‌ها
        </h1>
        <span className="w-[88px]" aria-hidden />
      </header>

      <main className="flex-1 chat-scroll overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-6">
          <p className="text-xs text-[var(--chat-muted)] mb-4 text-center">
            {models.length
              ? `${models.length.toLocaleString("fa-IR")} مدل فعال — یکی را برای گفتگو انتخاب کنید`
              : "مدلی یافت نشد"}
          </p>
          {loading ? (
            <div className="flex justify-center py-16 text-[var(--chat-muted)] gap-2">
              <Loader2 className="size-5 animate-spin" aria-hidden />
              در حال بارگذاری…
            </div>
          ) : (
            <ModelListItems models={models} modelId={modelId} onSelect={pick} />
          )}
        </div>
      </main>
    </div>
  );
}