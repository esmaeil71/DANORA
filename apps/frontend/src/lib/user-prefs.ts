export type UiDensity = "comfortable" | "compact";

export interface UserPrefs {
  displayName: string;
  density: UiDensity;
  showSuggestionChips: boolean;
  reduceMotionOverride: boolean | null;
}

const KEY = "danora.user.prefs";

const defaults: UserPrefs = {
  displayName: "",
  density: "comfortable",
  showSuggestionChips: true,
  reduceMotionOverride: null,
};

export function loadUserPrefs(): UserPrefs {
  if (typeof window === "undefined") return { ...defaults };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaults };
    return { ...defaults, ...JSON.parse(raw) } as UserPrefs;
  } catch {
    return { ...defaults };
  }
}

export function saveUserPrefs(patch: Partial<UserPrefs>) {
  const next = { ...loadUserPrefs(), ...patch };
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("danora:prefs", { detail: next }));
  return next;
}

export function displayLabel(email: string, prefs = loadUserPrefs()) {
  return prefs.displayName.trim() || email.split("@")[0] || email;
}