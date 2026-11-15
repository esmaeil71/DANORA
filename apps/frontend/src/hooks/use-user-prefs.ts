import { useCallback, useEffect, useRef, useState } from "react";
import {
  applyMotionPreference,
  fetchAndCacheUserPrefs,
  loadUserPrefs,
  patchUserPrefs,
  restoreUserPrefs,
  saveUserPrefs,
  type UserPrefs,
} from "@/lib/user-prefs";

export function useUserPrefs(syncRemote = false) {
  const [prefs, setPrefs] = useState<UserPrefs>(() => loadUserPrefs());
  const syncGen = useRef(0);

  useEffect(() => {
    if (!syncRemote) return;
    const gen = ++syncGen.current;
    void fetchAndCacheUserPrefs().then((p) => {
      if (gen === syncGen.current) setPrefs(p);
    });
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
      const gen = ++syncGen.current;
      const previous = loadUserPrefs();
      const optimistic = saveUserPrefs(patch);
      if (gen === syncGen.current) setPrefs(optimistic);
      try {
        const next = syncRemote
          ? await patchUserPrefs(patch)
          : optimistic;
        if (gen === syncGen.current) setPrefs(next);
        return next;
      } catch (err) {
        restoreUserPrefs(previous);
        if (gen === syncGen.current) setPrefs(previous);
        throw err;
      }
    },
    [syncRemote],
  );

  return { prefs, update };
}