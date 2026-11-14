import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, UserMe } from "@/lib/api";

export function useAdminGuard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await api<UserMe>("/auth/me");
        if (cancelled) return;
        if (me.role !== "admin") {
          navigate("/settings", { replace: true });
          return;
        }
        setUser(me);
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

  return { user, loading };
}