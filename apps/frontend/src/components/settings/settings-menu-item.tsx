import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

type BaseProps = {
  icon: ReactNode;
  label: string;
  description?: string;
  badge?: string;
  disabled?: boolean;
};

type ButtonProps = BaseProps & {
  href?: undefined;
  onClick: () => void;
  destructive?: boolean;
};

type LinkProps = BaseProps & {
  href: string;
  external?: boolean;
  onClick?: undefined;
  destructive?: boolean;
};

type StaticProps = BaseProps & {
  href?: undefined;
  onClick?: undefined;
  destructive?: boolean;
};

export function SettingsMenuItem(
  props: ButtonProps | LinkProps | StaticProps,
) {
  const {
    icon,
    label,
    description,
    badge,
    disabled,
    destructive,
  } = props;

  const classes = `w-full flex items-center gap-3 min-h-[3.25rem] px-4 py-3 text-right transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:bg-[var(--st-surface-hover)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--st-accent-muted)] ${
    disabled
      ? "opacity-50 cursor-not-allowed"
      : "hover:bg-[var(--st-surface-hover)]"
  } ${destructive ? "text-[var(--st-danger)] hover:bg-[var(--st-danger-soft)]" : "text-[var(--st-text)]"}`;

  const inner = (
    <>
      <span
        className={`size-10 shrink-0 rounded-xl inline-flex items-center justify-center ${
          destructive
            ? "bg-[var(--st-danger-soft)] text-[var(--st-danger)]"
            : "bg-[var(--st-accent-soft)] text-[var(--st-accent)]"
        }`}
        aria-hidden
      >
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium truncate">{label}</span>
        {description && (
          <span className="block text-xs text-[var(--st-muted)] mt-0.5 line-clamp-2">
            {description}
          </span>
        )}
      </span>
      {badge && (
        <span className="settings-badge shrink-0">{badge}</span>
      )}
      {!disabled && !destructive && (
        <ChevronLeft className="size-4 shrink-0 text-[var(--st-muted)]" aria-hidden />
      )}
    </>
  );

  if ("href" in props && props.href) {
    const external =
      props.external ||
      props.href.startsWith("mailto:") ||
      props.href.startsWith("http");
    if (external) {
      return (
        <a href={props.href} className={classes}>
          {inner}
        </a>
      );
    }
    return (
      <Link to={props.href} className={classes}>
        {inner}
      </Link>
    );
  }

  if ("onClick" in props && props.onClick) {
    return (
      <button
        type="button"
        className={classes}
        onClick={props.onClick}
        disabled={disabled}
      >
        {inner}
      </button>
    );
  }

  return (
    <div className={`${classes} cursor-default hover:bg-transparent`} role="group">
      {inner}
    </div>
  );
}