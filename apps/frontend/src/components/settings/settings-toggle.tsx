export function SettingsToggle({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-4 border-b border-[var(--st-border)] last:border-0">
      <div className="text-right flex-1">
        <p className="text-sm font-medium text-[var(--st-text)]">{label}</p>
        {description && (
          <p className="text-xs text-[var(--st-muted)] mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-12 h-7 rounded-full transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          checked ? "bg-violet-600" : "bg-[var(--st-surface-hover)]"
        }`}
      >
        <span
          className={`absolute top-0.5 size-6 rounded-full bg-white shadow transition-all duration-200 ${
            checked ? "right-0.5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}