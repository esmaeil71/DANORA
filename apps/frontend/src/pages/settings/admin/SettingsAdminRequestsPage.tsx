import { Link } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { SettingsLoading } from "@/components/settings/settings-loading";
import { useAdminGuard } from "@/hooks/use-admin-guard";

interface UpgradeRow {
  id: string;
  status: string;
  note: string | null;
  phone: string | null;
  createdAt: string;
  user: { id: string; email: string; plan: string };
}

interface SupportRow {
  id: string;
  subject: string;
  message: string;
  createdAt: string;
  user: { id: string; email: string };
}

export function SettingsAdminRequestsPage() {
  const { loading: authLoading } = useAdminGuard();
  const [upgrades, setUpgrades] = useState<UpgradeRow[]>([]);
  const [support, setSupport] = useState<SupportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, s] = await Promise.all([
        api<UpgradeRow[]>("/admin/upgrade-requests"),
        api<SupportRow[]>("/admin/support/inquiries"),
      ]);
      setUpgrades(u);
      setSupport(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) void load();
  }, [authLoading, load]);

  const setUpgradeStatus = async (
    id: string,
    status: "pending" | "approved" | "rejected",
  ) => {
    setBusyId(id);
    try {
      await api(`/admin/upgrade-requests/${id}`, {
        method: "PATCH",
        json: { status },
      });
      await load();
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

      <SettingsPanel title="درخواست ارتقا">
        {loading ? (
          <AdminSpinner />
        ) : (
          <ul className="divide-y divide-[var(--st-border)]">
            {upgrades.map((r) => (
              <li key={r.id} className="px-4 py-3 space-y-2">
                <p className="text-sm font-medium">{r.user.email}</p>
                <p className="text-[11px] text-[var(--st-muted)]">
                  {r.status} · {new Date(r.createdAt).toLocaleString("fa-IR")}
                </p>
                {r.note && (
                  <p className="text-xs text-[var(--st-text)]">{r.note}</p>
                )}
                {r.phone && (
                  <p className="text-xs text-[var(--st-muted)]">{r.phone}</p>
                )}
                <div className="flex gap-2 flex-wrap">
                  {(["approved", "rejected", "pending"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={busyId === r.id}
                      onClick={() => void setUpgradeStatus(r.id, s)}
                      className={`text-xs px-3 py-1.5 rounded-lg border ${
                        r.status === s
                          ? "border-violet-500 bg-violet-500/20"
                          : "border-[var(--st-border)]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </li>
            ))}
            {upgrades.length === 0 && (
              <li className="px-4 py-6 text-sm text-center text-[var(--st-muted)]">
                درخواستی نیست
              </li>
            )}
          </ul>
        )}
      </SettingsPanel>

      <SettingsPanel title="تیکت پشتیبانی">
        {loading ? (
          <AdminSpinner />
        ) : (
          <ul className="divide-y divide-[var(--st-border)]">
            {support.map((t) => (
              <li key={t.id} className="px-4 py-3">
                <p className="text-sm font-medium">{t.subject}</p>
                <p className="text-[11px] text-[var(--st-muted)]">
                  {t.user.email} · {new Date(t.createdAt).toLocaleString("fa-IR")}
                </p>
                <p className="text-xs mt-2 whitespace-pre-wrap">{t.message}</p>
              </li>
            ))}
            {support.length === 0 && (
              <li className="px-4 py-6 text-sm text-center text-[var(--st-muted)]">
                تیکتی نیست
              </li>
            )}
          </ul>
        )}
      </SettingsPanel>
    </main>
  );
}

function AdminSpinner() {
  return (
    <div className="flex justify-center py-8">
      <Loader2 className="size-6 animate-spin text-violet-400" />
    </div>
  );
}