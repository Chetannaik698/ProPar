import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  className?: string;
  icon?: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  "aria-label"?: string;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-canvas hover:bg-white shadow-soft focus-visible:outline-accent-soft",
  secondary:
    "bg-surface text-ink border border-border-soft hover:border-muted-2 hover:bg-surface-2",
  ghost: "text-muted hover:text-ink",
};

export function Button({
  children,
  href,
  variant = "primary",
  className,
  icon,
  onClick,
  type = "button",
  ...rest
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 ease-out active:scale-[0.97]",
    variants[variant],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
        {icon}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} {...rest}>
      {children}
      {icon}
    </button>
  );
}
