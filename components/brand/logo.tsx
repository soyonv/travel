import { cn } from "@/lib/utils";

export function LogoMark({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role="img"
      aria-label="Discover Bangladesh AI logo: a river, a hill and the sun"
      className={cn("shrink-0", className)}
    >
      <rect width="40" height="40" rx="12" fill="var(--color-forest-900)" />
      <circle cx="27.5" cy="13.5" r="5" fill="var(--color-sunset-400)" />
      <path d="M3.5 27.5 L13.5 11 L21.5 22.5 L25.5 17 L36.5 27.5 Z" fill="var(--color-forest-100)" />
      <path d="M3.5 27.5 L13.5 11 L21.5 22.5 L18 27.5 Z" fill="var(--color-ivory-50)" opacity="0.92" />
      <path
        d="M3 32.5c4.5-2.4 8 2.4 12.5 0s8 2.4 12.5 0 8 2.4 11.5 0"
        stroke="var(--color-river-400)"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={compact ? 34 : 40} />
      <span className="flex flex-col leading-none">
        <span className="font-sans text-[15px] font-extrabold tracking-tight text-forest-900 sm:text-base">
          Discover Bangladesh
        </span>
        <span className="mt-1 flex items-center gap-1.5">
          <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-ink-400">Every journey tells a story</span>
        </span>
      </span>
    </span>
  );
}

export function LogoOnDark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={38} />
      <span className="flex flex-col leading-none">
        <span className="font-sans text-[15px] font-extrabold tracking-tight text-ivory-50">Discover Bangladesh</span>
        <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.22em] text-ivory-200/70">
          Every journey tells a story
        </span>
      </span>
    </span>
  );
}
