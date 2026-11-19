import type { InputHTMLAttributes, ReactNode } from "react";

export function SettingsPanel({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      {title && (
        <h2 className="settings-section-label">{title}</h2>
      )}
      <div className="settings-card overflow-hidden">
        {children}
      </div>
    </section>
  );
}

export function SettingsFieldRow({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="px-4 py-4 border-b border-[var(--st-border)] last:border-0 space-y-2">
      <label className="block text-sm font-medium text-[var(--st-text)]">
        {label}
      </label>
      {children}
      {hint && (
        <p className="text-[11px] text-[var(--st-muted)] leading-relaxed">{hint}</p>
      )}
    </div>
  );
}

export function SettingsInput({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full min-h-11 rounded-xl border border-[var(--st-border)] bg-[var(--st-surface-hover)] px-3 text-sm text-[var(--st-text)] placeholder:text-[var(--st-muted)] focus:border-[var(--st-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--st-accent-soft)] transition-colors ${className}`}
    />
  );
}