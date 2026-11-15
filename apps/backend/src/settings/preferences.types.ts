export type UserPreferences = {
  displayName?: string;
  density?: 'comfortable' | 'compact';
  showSuggestionChips?: boolean;
  reduceMotionOverride?: boolean | null;
  chatTheme?: 'dark' | 'light';
  defaultModelId?: string;
};

export const defaultPreferences: Required<
  Pick<
    UserPreferences,
    | 'displayName'
    | 'density'
    | 'showSuggestionChips'
    | 'reduceMotionOverride'
    | 'chatTheme'
    | 'defaultModelId'
  >
> = {
  displayName: '',
  density: 'comfortable',
  showSuggestionChips: true,
  reduceMotionOverride: null,
  chatTheme: 'dark',
  defaultModelId: '',
};

function normalizeChatTheme(value: unknown): 'dark' | 'light' {
  if (value === 'light') return 'light';
  return 'dark';
}

export function mergePreferences(
  raw: unknown,
): UserPreferences & typeof defaultPreferences {
  const patch = (raw ?? {}) as UserPreferences;
  const base = { ...defaultPreferences, ...patch };
  base.chatTheme = normalizeChatTheme(patch.chatTheme);
  if (typeof patch.defaultModelId === 'string') {
    base.defaultModelId = patch.defaultModelId;
  } else if (base.defaultModelId === undefined) {
    base.defaultModelId = '';
  }
  return base;
}