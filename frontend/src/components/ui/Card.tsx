import type { HTMLAttributes, ReactNode } from "react";

type CardVariant = "default" | "glass" | "outline" | "brand";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  variant?: CardVariant;
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
};

const variantClasses: Record<CardVariant, string> = {
  default: "border-white/10 bg-slate-900/80",
  glass: "border-white/10 bg-white/[0.04] backdrop-blur-xl",
  outline: "border-white/10 bg-transparent",
  brand: "border-emerald-500/20 bg-emerald-500/[0.05]",
};

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function Card({
  children,
  variant = "default",
  padding = "md",
  interactive = false,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={[
        "rounded-3xl border",
        variantClasses[variant],
        paddingClasses[padding],
        interactive
          ? "transition duration-200 hover:-translate-y-0.5 hover:border-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-950/20"
          : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}