import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  showWordmark?: boolean;
  className?: string;
  size?: number;
  wordmarkClassName?: string;
  href?: string;
}

export function Logo({
  showWordmark = true,
  className,
  size = 28,
  wordmarkClassName = "font-display text-[18px] tracking-tight text-ink",
  href = "/",
}: LogoProps) {
  return (
    <Link
      href={href}
      aria-label="ProPar home"
      className={cn("inline-flex items-center gap-2.5 group focus-ring rounded-xl p-0.5", className)}
    >
      <div className="flex items-center justify-center bg-black rounded-lg p-1.5 shadow-sm transition-transform duration-200 group-hover:scale-105">
        <Image
          src="/logo.png"
          alt="ProPar Logo"
          width={size}
          height={size}
          priority
          className="object-contain brightness-0 invert"
          style={{ width: `${size}px`, height: `${size}px` }}
        />
      </div>
      {showWordmark && (
        <span className={cn("font-display tracking-tight", wordmarkClassName)}>ProPar</span>
      )}
    </Link>
  );
}

export default Logo;
