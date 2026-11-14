import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, UsageSummary, UserMe } from "@/lib/api";

export function useSettingsSession() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserMe | null>(null);
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [me, daily] = await Promise.all([
          api<UserMe>("/auth/me"),
          api<UsageSummary>("/auth/usage"),
        ]);
        if (cancelled) return;
        setUser(me);
        setUsage(daily);
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

  return { user, usage, loading, setUser };
}