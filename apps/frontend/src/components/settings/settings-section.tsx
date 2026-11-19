import type { ReactNode } from "react";

export function SettingsSection({
  title,
  id,
  children,
  className = "",
  variant = "default",
}: {
  title: string;
  id: string;
  children: ReactNode;
  className?: string;
  variant?: "default" | "admin";
}) {
  return (
    <section aria-labelledby={id} className={className}>
      <h2 id={id} className="settings-section-label">
        {title}
      </h2>
      {variant === "admin" ? (
        <div className="settings-admin-card">{children}</div>
      ) : (
        <div className="settings-card settings-card--divide">{children}</div>
      )}
    </section>
  );
}