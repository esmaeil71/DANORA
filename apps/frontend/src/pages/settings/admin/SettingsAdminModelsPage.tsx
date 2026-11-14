import { Link } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { SettingsToggle } from "@/components/settings/settings-toggle";
import { SettingsLoading } from "@/components/settings/settings-loading";
import { useAdminGuard } from "@/hooks/use-admin-guard";

interface AdminModel {
  id: string;
  provider: string;
  displayName: string;
  apiModelName: string;
  enabled: boolean;
}

export function SettingsAdminModelsPage() {
  const { loading: authLoading } = useAdminGuard();
  const [models, setModels] = useState<AdminModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await api<AdminModel[]>("/admin/models");
      setModels(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) void load();
  }, [authLoading, load]);

  const toggle = async (id: string, enabled: boolean) => {
    setBusyId(id);
    try {
      await api(`/admin/models/${id}`, {
        method: "PATCH",
        json: { enabled },
      });
      setModels((prev) =>
        prev.map((m) => (m.id === id ? { ...m, enabled } : m)),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا");
    } finally {
      setBusyId(null);
    }
  };

  if (authLoading) return <SettingsLoading />;

  return (
    <main className="max-w-xl mx-auto px-4 py-6 pb-12 space-y-4">
      <Link
        to="/settings/admin"
        className="inline-flex items-center gap-2 text-sm text-[var(--st-muted)]"
      >
        <ChevronLeft className="size-4" />
        داشبورد ادمین
      </Link>

      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <SettingsPanel title="کاتالوگ مدل">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-6 animate-spin text-violet-400" />
          </div>
        ) : (
          <div>
            {models.map((m) => (
              <AdminModelRow
                key={m.id}
                model={m}
                busy={busyId === m.id}
                onToggle={(v: boolean) => void toggle(m.id, v)}
              />
            ))}
          </div>
        )}
      </SettingsPanel>
    </main>
  );
}

function AdminModelRow({
  model,
  busy,
  onToggle,
}: {
  model: AdminModel;
  busy: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div className="border-b border-[var(--st-border)] last:border-0">
      <SettingsToggle
        checked={model.enabled}
        disabled={busy}
        onChange={onToggle}
        label={model.displayName}
        description={`${model.provider} · ${model.id}`}
      />
    </div>
  );
}