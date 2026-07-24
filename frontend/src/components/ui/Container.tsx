import type { HTMLAttributes, ReactNode } from "react";

type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  size?: ContainerSize;
};

const sizeClasses: Record<ContainerSize, string> = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-none",
};

export default function Container({
  children,
  size = "xl",
  className = "",
  ...props
}: ContainerProps) {
  return (
    <div
      className={[
        "mx-auto w-full px-6 sm:px-8",
        sizeClasses[size],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}