import { Link, useSearchParams } from "react-router-dom";
import { ChevronLeft, Loader2, Search } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SettingsInput, SettingsPanel } from "@/components/settings/settings-panel";
import { SettingsLoading } from "@/components/settings/settings-loading";
import { useAdminGuard } from "@/hooks/use-admin-guard";

interface AdminUserRow {
  id: string;
  email: string;
  plan: string;
  role: string;
  suspended: boolean;
  createdAt: string;
}

interface UsersResponse {
  total: number;
  page: number;
  limit: number;
  users: AdminUserRow[];
}

export function SettingsAdminUsersPage() {
  const { loading: authLoading } = useAdminGuard();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const q = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(q);
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (q) params.set("q", q);
      const res = await api<UsersResponse>(`/admin/users?${params}`);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطا");
    } finally {
      setLoading(false);
    }
  }, [page, q]);

  useEffect(() => {
    if (!authLoading) void load();
  }, [authLoading, load]);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams();
    if (query.trim()) next.set("q", query.trim());
    next.set("page", "1");
    setSearchParams(next);
  };

  if (authLoading) return <SettingsLoading />;

  const totalPages =
    data && data.limit > 0 ? Math.ceil(data.total / data.limit) : 1;

  return (
    <main className="max-w-xl mx-auto px-4 py-6 pb-12 space-y-4">
      <Link
        to="/settings/admin"
        className="inline-flex items-center gap-2 text-sm text-[var(--st-muted)] hover:text-[var(--st-text)]"
      >
        <ChevronLeft className="size-4" aria-hidden />
        داشبورد ادمین
      </Link>

      <form onSubmit={onSearch} className="flex gap-2">
        <SettingsInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جستجوی ایمیل"
          className="flex-1"
        />
        <button
          type="submit"
          className="min-h-11 px-4 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-500 transition-colors inline-flex items-center gap-2"
        >
          <Search className="size-4" />
          جستجو
        </button>
      </form>

      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      <SettingsPanel title={data ? `${data.total} کاربر` : "کاربران"}>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-6 animate-spin text-violet-400" />
          </div>
        ) : (
          <ul className="divide-y divide-[var(--st-border)]">
            {data?.users.map((u) => (
              <li key={u.id}>
                <Link
                  to={`/settings/admin/users/${u.id}`}
                  className="block px-4 py-3 hover:bg-[var(--st-surface-hover)] transition-colors"
                >
                  <p className="text-sm font-medium truncate">{u.email}</p>
                  <p className="text-[11px] text-[var(--st-muted)] mt-0.5">
                    {u.plan} · {u.role}
                    {u.suspended ? " · مسدود" : ""}
                  </p>
                </Link>
              </li>
            ))}
            {data && data.users.length === 0 && (
              <li className="px-4 py-6 text-sm text-[var(--st-muted)] text-center">
                کاربری یافت نشد
              </li>
            )}
          </ul>
        )}
      </SettingsPanel>

      {data && totalPages > 1 && (
        <div className="flex justify-between items-center text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              next.set("page", String(page - 1));
              setSearchParams(next);
            }}
            className="text-violet-400 disabled:opacity-40"
          >
            قبلی
          </button>
          <span className="text-[var(--st-muted)]">
            صفحه {page} از {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              next.set("page", String(page + 1));
              setSearchParams(next);
            }}
            className="text-violet-400 disabled:opacity-40"
          >
            بعدی
          </button>
        </div>
      )}
    </main>
  );
}