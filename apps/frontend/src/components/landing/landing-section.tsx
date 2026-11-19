import type { ReactNode } from "react";

export function LandingSection({
  id,
  eyebrow,
  title,
  description,
  children,
  className = "",
  centered,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  centered?: boolean;
}) {
  return (
    <section
      id={id}
      className={`py-[var(--landing-section-y)] ${className}`}
    >
      <div className="max-w-[var(--landing-max)] mx-auto px-4 sm:px-6">
        <header
          className={`mb-10 max-w-2xl ${centered ? "mx-auto text-center" : "text-right"}`}
        >
          {eyebrow && (
            <p className="landing-eyebrow mb-2">{eyebrow}</p>
          )}
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </header>
        {children}
      </div>
    </section>
  );
}