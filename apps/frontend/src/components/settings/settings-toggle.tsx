import { useId } from "react";

export function SettingsToggle({
  checked,
  onChange,
  label,
  description,
  disabled,
  busy,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  busy?: boolean;
}) {
  const id = useId();
  const labelId = `${id}-label`;
  const descId = `${id}-desc`;
  const isDisabled = disabled || busy;

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-4 border-b border-[var(--st-border)] last:border-0">
      <div className="text-right flex-1 min-w-0">
        <p id={labelId} className="text-sm font-medium text-[var(--st-text)]">
          {label}
        </p>
        {description && (
          <p id={descId} className="text-xs text-[var(--st-muted)] mt-0.5">
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        id={id}
        aria-labelledby={labelId}
        aria-describedby={description ? descId : undefined}
        aria-checked={checked}
        aria-busy={busy || undefined}
        disabled={isDisabled}
        onClick={() => onChange(!checked)}
        className={[
          "relative flex shrink-0 w-[3.25rem] h-7 rounded-full p-0.5",
          "transition-colors duration-200 ease-out",
          "cursor-pointer select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--st-accent)]",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--st-bg)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          checked
            ? "justify-end bg-violet-600 hover:bg-violet-500"
            : "justify-start bg-[var(--st-surface-hover)] hover:bg-[var(--st-border)]",
          busy ? "opacity-80" : "",
        ].join(" ")}
      >
        <span
          className="size-6 rounded-full bg-white shadow-md shrink-0 motion-safe:transition-[transform,box-shadow] motion-safe:duration-200"
          aria-hidden
        />
      </button>
    </div>
  );
}