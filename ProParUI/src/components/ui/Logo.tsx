import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  showWordmark = true,
  className,
  size = 32,
}: {
  showWordmark?: boolean;
  className?: string;
  size?: number;
}) {
  return (
    <Link
      href="/"
      aria-label="ProPar home"
      className={cn("flex items-center gap-2.5 text-ink", className)}
    >
      <Image
        src="/logo.png"
        alt="ProPar Logo"
        width={size}
        height={size}
        priority
        className="object-contain"
      />
      {showWordmark && (
        <span className="text-[18px] font-semibold tracking-tight">ProPar</span>
      )}
    </Link>
  );
}
