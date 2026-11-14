import { api } from "@/lib/api";

export type UiDensity = "comfortable" | "compact";
export type ChatTheme = "dark" | "light";

export interface UserPrefs {
  displayName: string;
  density: UiDensity;
  showSuggestionChips: boolean;
  reduceMotionOverride: boolean | null;
  chatTheme: ChatTheme;
  defaultModelId: string;
}

const KEY = "danora.user.prefs";

export const defaultPrefs: UserPrefs = {
  displayName: "",
  density: "comfortable",
  showSuggestionChips: true,
  reduceMotionOverride: null,
  chatTheme: "dark",
  defaultModelId: "",
};

function normalizeTheme(value: unknown): ChatTheme {
  if (value === "light") return "light";
  return "dark";
}

function normalizePrefs(raw: Partial<UserPrefs>): UserPrefs {
  return {
    ...defaultPrefs,
    ...raw,
    chatTheme: normalizeTheme(raw.chatTheme),
  };
}

export function loadUserPrefs(): UserPrefs {
  if (typeof window === "undefined") return { ...defaultPrefs };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaultPrefs };
    return normalizePrefs(JSON.parse(raw) as Partial<UserPrefs>);
  } catch {
    return { ...defaultPrefs };
  }
}

function cachePrefs(prefs: UserPrefs) {
  localStorage.setItem(KEY, JSON.stringify(prefs));
  window.dispatchEvent(new CustomEvent("danora:prefs", { detail: prefs }));
}

export function saveUserPrefs(patch: Partial<UserPrefs>) {
  const next = normalizePrefs({ ...loadUserPrefs(), ...patch });
  cachePrefs(next);
  return next;
}

export async function fetchAndCacheUserPrefs(): Promise<UserPrefs> {
  try {
    const remote = await api<Partial<UserPrefs>>("/auth/preferences");
    const next = normalizePrefs(remote);
    cachePrefs(next);
    return next;
  } catch {
    return loadUserPrefs();
  }
}

export async function patchUserPrefs(patch: Partial<UserPrefs>): Promise<UserPrefs> {
  const remote = await api<UserPrefs>("/auth/preferences", {
    method: "PATCH",
    json: patch,
  });
  const next = normalizePrefs(remote);
  cachePrefs(next);
  return next;
}

export function displayLabel(email: string, prefs = loadUserPrefs()) {
  return prefs.displayName.trim() || email.split("@")[0] || email;
}

export function applyMotionPreference(prefs: UserPrefs) {
  const root = document.documentElement;
  if (prefs.reduceMotionOverride === true) {
    root.classList.add("danora-reduce-motion");
  } else {
    root.classList.remove("danora-reduce-motion");
  }
}