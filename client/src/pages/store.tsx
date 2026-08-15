import { useMemo, useState } from "react";
import { SlidersHorizontal, Search, GitCompare, X, ArrowUpDown, Zap } from "lucide-react";
import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BatteryCard } from "@/components/battery-card";
import { batteries, VEHICLE_TYPES, type VehicleType, type Chemistry } from "@/lib/batteryCatalog";
import { cn } from "@/lib/utils";
import { formatPrice, conditionLabel } from "@/lib/siteData";

const CHEMS: Chemistry[] = ["Li-ion NMC", "Li-ion NCA", "LiFePO4", "LiPo"];

type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "wh";
type Tab = "all" | "new" | "refurbished" | "rebuilt";

export function StorePage() {
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [vehicle, setVehicle] = useState<string>("all");
  const [voltages, setVoltages] = useState<number[]>([]);
  const [chems, setChems] = useState<Chemistry[]>([]);
  const [minWh, setMinWh] = useState(0);
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState<SortKey>("featured");
  const [compare, setCompare] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const allVoltages = useMemo(() => Array.from(new Set(batteries.map((b) => b.voltage))).sort((a, b) => a - b), []);
  const maxWh = useMemo(() => Math.max(...batteries.map((b) => b.wattHours)), []);

  const filtered = useMemo(() => {
    let list = batteries.filter((b) => {
      if (tab !== "all" && b.condition !== tab) return false;
      if (query && !`${b.name} ${b.brand} ${b.model}`.toLowerCase().includes(query.toLowerCase())) return false;
      if (vehicle !== "all" && b.vehicleType !== vehicle) return false;
      if (voltages.length && !voltages.includes(b.voltage)) return false;
      if (chems.length && !chems.includes(b.chemistry)) return false;
      if (b.wattHours < minWh) return false;
      if (inStock && !b.inStock) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price-asc": return a.price - b.price;
        case "price-desc": return b.price - a.price;
        case "rating": return b.rating - a.rating;
        case "wh": return b.wattHours - a.wattHours;
        default: return Number(b.featured) - Number(a.featured) || b.rating - a.rating;
      }
    });
    return list;
  }, [tab, query, vehicle, voltages, chems, minWh, inStock, sort]);

  const toggleArr = <T,>(arr: T[], v: T): T[] => arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const toggleCompare = (id: string) => {
    setCompare((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const compareItems = batteries.filter((b) => compare.includes(b.id));

  return (
    <PageLayout>
      <div className="border-b border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary"><Zap className="size-3.5" /> Online Store</div>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Shop batteries</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">New, refurbished, and rebuilt lithium-ion packs. Filter by voltage, chemistry, and capacity — compare up to 3 side by side.</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Tabs + search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1">
            {(["all", "new", "refurbished", "rebuilt"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover-elevate",
                  tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                )}
                data-testid={`store-tab-${t}`}
              >
                {conditionLabel(t === "all" ? ("new" as any) : (t as any)).replace(/^./, (c) => c.toUpperCase())}{t === "all" ? " Packs" : ""}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search brand or model…" className="pl-8" data-testid="store-search" />
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Filters */}
          <aside className="space-y-5">
            <div className="flex items-center gap-2 text-sm font-semibold"><SlidersHorizontal className="size-4" /> Filters</div>

            <FilterGroup label="Vehicle type">
              <select value={vehicle} onChange={(e) => setVehicle(e.target.value)} className="w-full rounded-md border border-input bg-background px-2.5 py-2 text-sm" data-testid="filter-vehicle">
                <option value="all">All vehicles</option>
                {VEHICLE_TYPES.map((v) => <option key={v.type} value={v.type}>{v.type}</option>)}
              </select>
            </FilterGroup>

            <FilterGroup label="Voltage">
              <div className="flex flex-wrap gap-1.5">
                {allVoltages.map((v) => (
                  <button
                    key={v}
                    onClick={() => setVoltages((prev) => toggleArr(prev, v))}
                    className={cn("rounded-md border px-2 py-1 text-xs font-medium", voltages.includes(v) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground")}
                    data-testid={`filter-voltage-${v}`}
                  >{v}V</button>
                ))}
              </div>
            </FilterGroup>

            <FilterGroup label="Chemistry">
              <div className="space-y-1.5">
                {CHEMS.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input type="checkbox" checked={chems.includes(c)} onChange={() => setChems((prev) => toggleArr(prev, c))} className="accent-[hsl(var(--primary))]" data-testid={`filter-chem-${c}`} />
                    {c}
                  </label>
                ))}
              </div>
            </FilterGroup>

            <FilterGroup label={`Min capacity: ${minWh}Wh`}>
              <input type="range" min={0} max={maxWh} step={50} value={minWh} onChange={(e) => setMinWh(Number(e.target.value))} className="w-full accent-[hsl(var(--primary))]" data-testid="filter-minwh" />
            </FilterGroup>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="accent-[hsl(var(--primary))]" data-testid="filter-instock" />
              In stock only
            </label>
          </aside>

          {/* Grid */}
          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">{filtered.length}</span> packs</p>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="size-4 text-muted-foreground" />
                <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="rounded-md border border-input bg-background px-2.5 py-1.5 text-sm" data-testid="store-sort">
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top rated</option>
                  <option value="wh">Highest capacity</option>
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">No batteries match your filters.</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((b) => (
                  <div key={b.id} className="relative">
                    <BatteryCard battery={b} />
                    <button
                      onClick={() => toggleCompare(b.id)}
                      className={cn(
                        "absolute right-2 top-2 z-10 rounded-full border px-2 py-0.5 text-[10px] font-medium backdrop-blur",
                        compare.includes(b.id) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background/80 text-muted-foreground"
                      )}
                      data-testid={`compare-toggle-${b.id}`}
                    >
                      {compare.includes(b.id) ? "Comparing" : "Compare"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compare bar */}
      {compare.length > 0 && (
        <div className="sticky bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2 text-sm">
              <GitCompare className="size-4 text-primary" />
              <span className="font-medium">{compare.length}/3 selected for comparison</span>
              <div className="ml-2 hidden gap-1 sm:flex">
                {compareItems.map((b) => (
                  <Badge key={b.id} variant="secondary" className="gap-1">{b.brand} {b.model}<button onClick={() => toggleCompare(b.id)}><X className="size-3" /></button></Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setCompare([])}>Clear</Button>
              <Button size="sm" disabled={compare.length < 2} onClick={() => setShowCompare(true)} className="gap-1.5" data-testid="compare-open">
                <GitCompare className="size-3.5" /> Compare
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Compare modal */}
      {showCompare && compareItems.length >= 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur" onClick={() => setShowCompare(false)} data-testid="compare-modal">
          <div className="max-h-[85vh] w-full max-w-3xl overflow-auto rounded-xl border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-5 py-3">
              <h3 className="font-display font-semibold">Battery comparison</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowCompare(false)}><X className="size-5" /></Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  <CompareRow label="" items={compareItems} render={(b) => <b className="font-medium">{b.brand}<br />{b.model}</b>} />
                  <CompareRow label="Condition" items={compareItems} render={(b) => conditionLabel(b.condition)} />
                  <CompareRow label="Price" items={compareItems} render={(b) => <span className="font-semibold">{formatPrice(b.price)}</span>} highlight="min" />
                  <CompareRow label="Voltage" items={compareItems} render={(b) => `${b.voltage}V`} />
                  <CompareRow label="Capacity" items={compareItems} render={(b) => `${b.capacityAh}Ah`} />
                  <CompareRow label="Energy" items={compareItems} render={(b) => `${b.wattHours}Wh`} highlight="max" />
                  <CompareRow label="Est. range" items={compareItems} render={(b) => `${b.estRangeMiles} mi`} highlight="max" />
                  <CompareRow label="Chemistry" items={compareItems} render={(b) => b.chemistry} />
                  <CompareRow label="Cells" items={compareItems} render={(b) => b.cellManufacturer} />
                  <CompareRow label="Warranty" items={compareItems} render={(b) => `${b.warrantyMonths} mo`} highlight="max" />
                  <CompareRow label="Charge time" items={compareItems} render={(b) => `${b.chargeTimeHours}h`} highlight="min" />
                  <CompareRow label="Rating" items={compareItems} render={(b) => `${b.rating.toFixed(1)}★`} highlight="max" />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function CompareRow({ label, items, render, highlight }: { label: string; items: typeof batteries; render: (b: typeof batteries[number]) => React.ReactNode; highlight?: "min" | "max" }) {
  const values = items.map((b) => b);
  let bestIdx = -1;
  if (highlight) {
    const nums = items.map((b) => {
      const m = String(render(b)).match(/[\d.]+/);
      return m ? parseFloat(m[0]) : 0;
    });
    bestIdx = highlight === "max" ? nums.indexOf(Math.max(...nums)) : nums.indexOf(Math.min(...nums));
  }
  return (
    <tr className="border-b border-border/60">
      <td className="whitespace-nowrap px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</td>
      {values.map((b, i) => (
        <td key={b.id} className={cn("px-4 py-2.5", bestIdx === i && "text-primary font-semibold")}>{render(b)}</td>
      ))}
    </tr>
  );
}
