import { Link } from "react-router-dom";
import { Cpu, Inbox, LayoutDashboard, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SettingsLoading } from "@/components/settings/settings-loading";
import { SettingsMenuItem } from "@/components/settings/settings-menu-item";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { useAdminGuard } from "@/hooks/use-admin-guard";

interface AdminOverview {
  userCount: number;
  messagesToday: number;
  tokensToday: number;
  pendingUpgradeRequests: number;
  supportInquiriesLast7Days: number;
}

export function SettingsAdminOverviewPage() {
  const { loading: authLoading } = useAdminGuard();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await api<AdminOverview>("/admin/overview");
      setOverview(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا در بارگذاری");
    }
  }, []);

  useEffect(() => {
    if (!authLoading) void load();
  }, [authLoading, load]);

  if (authLoading) return <SettingsLoading />;

  return (
    <main className="max-w-xl mx-auto px-4 py-6 pb-12 space-y-6">
      {error && (
        <p className="text-sm text-red-400 px-1" role="alert">
          {error}
        </p>
      )}

      {overview && (
        <SettingsPanel title="خلاصه">
          <OverviewStats overview={overview} />
        </SettingsPanel>
      )}

      <SettingsPanel title="بخش‌ها">
        <div className="divide-y divide-[var(--st-border)]">
          <SettingsMenuItem
            icon={<Users className="size-5" />}
            label="کاربران"
            description="پلن، نقش، تعلیق و ممیزی گفتگو"
            href="/settings/admin/users"
          />
          <SettingsMenuItem
            icon={<Inbox className="size-5" />}
            label="درخواست‌ها"
            description="ارتقای پلن و تیکت پشتیبانی"
            href="/settings/admin/requests"
          />
          <SettingsMenuItem
            icon={<Cpu className="size-5" />}
            label="مدل‌ها"
            description="فعال/غیرفعال کردن مدل‌های چت"
            href="/settings/admin/models"
          />
        </div>
      </SettingsPanel>

      <Link
        to="/settings"
        className="inline-flex items-center gap-2 text-sm text-[var(--st-muted)] hover:text-[var(--st-text)]"
      >
        <LayoutDashboard className="size-4" aria-hidden />
        بازگشت به تنظیمات کاربری
      </Link>
    </main>
  );
}

function OverviewStats({ overview }: { overview: AdminOverview }) {
  const items = [
    { label: "کاربران", value: overview.userCount },
    { label: "پیام امروز", value: overview.messagesToday },
    { label: "توکن امروز", value: overview.tokensToday },
    { label: "درخواست ارتقا (pending)", value: overview.pendingUpgradeRequests },
    { label: "تیکت ۷ روز", value: overview.supportInquiriesLast7Days },
  ];
  return (
    <div className="grid grid-cols-2 gap-px bg-[var(--st-border)]">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-[var(--st-surface)] px-4 py-3"
        >
          <p className="text-[11px] text-[var(--st-muted)]">{item.label}</p>
          <p className="text-lg font-semibold tabular-nums">{item.value}</p>
        </div>
      ))}
    </div>
  );
}