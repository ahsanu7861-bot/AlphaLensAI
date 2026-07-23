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
  neutral: "border-white/10 bg-white/5 text-slate-300",
  success:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  warning: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  danger: "border-rose-500/20 bg-rose-500/10 text-rose-400",
  info: "border-sky-500/20 bg-sky-500/10 text-sky-400",
  brand: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
};

const dotClasses: Record<BadgeVariant, string> = {
  neutral: "bg-slate-400",
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  danger: "bg-rose-400",
  info: "bg-sky-400",
  brand: "bg-emerald-400",
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