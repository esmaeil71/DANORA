import { useCallback, useEffect, useState } from "react";
import {
  applyMotionPreference,
  fetchAndCacheUserPrefs,
  loadUserPrefs,
  patchUserPrefs,
  saveUserPrefs,
  type UserPrefs,
} from "@/lib/user-prefs";

export function useUserPrefs(syncRemote = false) {
  const [prefs, setPrefs] = useState<UserPrefs>(() => loadUserPrefs());

  useEffect(() => {
    if (!syncRemote) return;
    void fetchAndCacheUserPrefs().then(setPrefs);
  }, [syncRemote]);

  useEffect(() => {
    const onPrefs = (e: Event) => {
      const detail = (e as CustomEvent<UserPrefs>).detail;
      if (detail) setPrefs(detail);
    };
    window.addEventListener("danora:prefs", onPrefs);
    return () => window.removeEventListener("danora:prefs", onPrefs);
  }, []);

  useEffect(() => {
    applyMotionPreference(prefs);
  }, [prefs.reduceMotionOverride]);

  const update = useCallback(
    async (patch: Partial<UserPrefs>) => {
      const next = syncRemote
        ? await patchUserPrefs(patch)
        : saveUserPrefs(patch);
      setPrefs(next);
      return next;
    },
    [syncRemote],
  );

  return { prefs, update };
}