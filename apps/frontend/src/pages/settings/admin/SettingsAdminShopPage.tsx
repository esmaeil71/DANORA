import { Link } from "react-router-dom";
import { Loader2, ShoppingBag } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ShopProviderInfo } from "@/lib/shop-types";
import { SettingsLoading } from "@/components/settings/settings-loading";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { SettingsToggle } from "@/components/settings/settings-toggle";
import { useAdminGuard } from "@/hooks/use-admin-guard";

type HealthRow = ShopProviderInfo & { ok: boolean; message?: string };

export function SettingsAdminShopPage() {
  const { loading: authLoading } = useAdminGuard();
  const [providers, setProviders] = useState<ShopProviderInfo[]>([]);
  const [health, setHealth] = useState<HealthRow[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [p, h] = await Promise.all([
        api<ShopProviderInfo[]>("/admin/shop/providers"),
        api<HealthRow[]>("/admin/shop/health"),
      ]);
      setProviders(p);
      setHealth(h);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا");
    }
  }, []);

  useEffect(() => {
    if (!authLoading) void load();
  }, [authLoading, load]);

  async function toggleProvider(id: ShopProviderInfo["id"], enabled: boolean) {
    setBusy(id);
    try {
      await api("/admin/shop/providers", {
        method: "PATCH",
        json: { id, enabled },
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا");
    } finally {
      setBusy(null);
    }
  }

  if (authLoading) return <SettingsLoading />;

  return (
    <main className="max-w-xl mx-auto px-4 py-6 pb-12 space-y-6">
      <p className="text-sm text-[var(--st-muted)] px-1 leading-relaxed">
        منابع جستجوی خرید هوشمند. غیرفعال کردن فقط در همین سرور اعمال می‌شود.
      </p>

      {error && (
        <p className="text-sm text-red-400 px-1" role="alert">
          {error}
        </p>
      )}

      <SettingsPanel title="مارکت‌پلیس‌ها">
        {providers.map((p) => (
          <SettingsToggle
            key={p.id}
            label={p.label}
            description={
              p.configured
                ? "پیکربندی شده"
                : "کلید API در .env تنظیم نشده — حالت نمونه/dev"
            }
            checked={p.enabled}
            busy={busy === p.id}
            onChange={(v) => void toggleProvider(p.id, v)}
          />
        ))}
      </SettingsPanel>

      <SettingsPanel title="سلامت اتصال">
        <ul className="divide-y divide-[var(--st-border)]">
          {health.map((h) => (
            <li
              key={h.id}
              className="px-4 py-3 flex items-center justify-between gap-2 text-sm"
            >
              <span>{h.label}</span>
              <span className={h.ok ? "text-emerald-500" : "text-amber-500"}>
                {h.ok ? "آنلاین" : (h.message ?? "مشکل")}
              </span>
            </li>
          ))}
          {!health.length && (
            <li className="px-4 py-6 flex justify-center text-[var(--st-muted)]">
              <Loader2 className="size-5 animate-spin" aria-hidden />
            </li>
          )}
        </ul>
      </SettingsPanel>

      <Link
        to="/settings/admin"
        className="inline-flex items-center gap-2 text-sm text-[var(--st-muted)]"
      >
        <ShoppingBag className="size-4" aria-hidden />
        بازگشت به پنل ادمین
      </Link>
    </main>
  );
}