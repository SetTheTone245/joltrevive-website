import { cn } from "@/lib/utils";

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        aria-label="Jolt Revive logo"
        className="shrink-0"
      >
        <rect x="1.5" y="1.5" width="29" height="29" rx="8" fill="currentColor" className="text-background" />
        <rect x="1.5" y="1.5" width="29" height="29" rx="8" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5" className="text-primary" />
        <path d="M17 5.5L9.5 17.5h5.2l-1.2 9 8.5-12.4h-5.4L17 5.5z" fill="currentColor" className="text-primary" />
        <rect x="13" y="3" width="6" height="2.4" rx="1.2" fill="currentColor" className="text-primary" />
      </svg>
      {showText && (
        <span className="font-display font-semibold tracking-tight text-base leading-none">
          Jolt<span className="text-primary">Revive</span>
        </span>
      )}
    </span>
  );
}
