import type { HTMLAttributes, ReactNode } from "react";

type BadgeVariant =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "brand";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
};

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "border-stroke bg-surface-soft text-ink-soft",
  success:
    "border-positive/20 bg-positive/10 text-positive",
  warning: "border-caution/20 bg-caution/10 text-caution",
  danger: "border-critical/20 bg-critical/10 text-critical",
  info: "border-brand/20 bg-brand/10 text-brand",
  brand: "border-intelligence/20 bg-intelligence/10 text-intelligence",
};

const dotClasses: Record<BadgeVariant, string> = {
  neutral: "bg-ink-muted",
  success: "bg-positive",
  warning: "bg-caution",
  danger: "bg-critical",
  info: "bg-brand",
  brand: "bg-intelligence",
};

export default function Badge({
  children,
  variant = "neutral",
  dot = false,
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5",
        "text-xs font-semibold uppercase tracking-wider",
        variantClasses[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 rounded-full ${dotClasses[variant]}`}
        />
      )}

      {children}
    </span>
  );
}
