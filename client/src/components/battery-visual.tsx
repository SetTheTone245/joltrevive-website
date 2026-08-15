import type { Battery } from "@/lib/batteryCatalog";

// Procedural, deterministic SVG representation of a battery pack.
// Tinted by the pack's hue — gives every catalog entry a distinct on-brand thumbnail.
export function BatteryVisual({ battery, className = "" }: { battery: Battery; className?: string }) {
  const h = battery.hue;
  const cells = battery.condition === "refurbished" ? 6 : 8;
  const cols = 4;
  const rows = Math.ceil(cells / cols);
  const dim = battery.wattHours;
  const dimmed = !battery.inStock;

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-border bg-gradient-to-br from-card to-background ${className}`}
      data-testid={`battery-visual-${battery.id}`}
    >
      <svg viewBox="0 0 200 140" className="h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <linearGradient id={`g-${battery.id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={`hsl(${h} 80% 22%)`} />
            <stop offset="100%" stopColor={`hsl(${h + 20} 70% 10%)`} />
          </linearGradient>
          <linearGradient id={`c-${battery.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`hsl(${h} 90% 60%)`} />
            <stop offset="100%" stopColor={`hsl(${h} 80% 40%)`} />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="200" height="140" fill={`url(#g-${battery.id})`} />
        <rect x="0" y="0" width="200" height="140" fill="hsl(0 0% 0% / 0.15)" />

        {/* pack body */}
        <rect x="34" y="40" width="120" height="64" rx="8" fill={`hsl(${h} 12% 6%)`} stroke={`hsl(${h} 30% 22%)`} strokeWidth="1.5" />
        {/* terminal */}
        <rect x="82" y="32" width="20" height="10" rx="2" fill={`hsl(${h} 40% 30%)`} />
        <rect x="86" y="30" width="5" height="4" rx="1" fill={`hsl(${h} 90% 60%)`} />
        <rect x="93" y="30" width="5" height="4" rx="1" fill={`hsl(${h} 90% 60%)`} />

        {/* cell grid */}
        {Array.from({ length: cells }).map((_, i) => {
          const c = i % cols;
          const r = Math.floor(i / cols);
          const x = 44 + c * 25;
          const y = 50 + r * 22;
          const alive = battery.condition !== "refurbished" || i % 3 !== 2;
          return (
            <g key={i}>
              <rect x={x} y={y} width="18" height="16" rx="2" fill={`hsl(${h} 14% 12%)`} stroke={`hsl(${h} 30% 20%)`} strokeWidth="0.8" />
              {alive && <rect x={x + 2} y={y + 2} width="14" height="5" rx="1" fill={`url(#c-${battery.id})`} opacity={0.9} />}
            </g>
          );
        })}

        {/* bolt + wh */}
        <path d="M150 48 l-8 14 h6 l-3 12 12-16 h-6 l3-10 z" fill={`hsl(${h} 95% 62%)`} opacity="0.92" />
        <text x="100" y="122" textAnchor="middle" fontSize="13" fontFamily="monospace" fontWeight="700" fill={`hsl(${h} 90% 70%)`}>
          {dim}Wh
        </text>
      </svg>

      {dimmed && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/55">
          <span className="rounded-full bg-destructive/15 px-2.5 py-1 text-xs font-semibold text-destructive border border-destructive/30">
            Out of stock
          </span>
        </div>
      )}
    </div>
  );
}
