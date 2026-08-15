import { useMemo, useState } from "react";
import { Cpu, Search, Zap, ArrowUpDown, ShoppingCart, TrendingUp, Package } from "lucide-react";
import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/siteData";
import {
  parts,
  PART_CATEGORIES,
  isHighDemandPart,
  type Part,
  type PartCategory,
} from "@/lib/partsCatalog";
import cellsImg from "@/assets/parts/cells.png";
import bmsImg from "@/assets/parts/bms.png";
import chargerImg from "@/assets/parts/charger.png";
import connectorImg from "@/assets/parts/connector.png";
import enclosureImg from "@/assets/parts/enclosure.png";
import accessoriesImg from "@/assets/parts/accessories.png";

export const CATEGORY_IMG: Record<PartCategory, string> = {
  Cells: cellsImg,
  BMS: bmsImg,
  Chargers: chargerImg,
  Connectors: connectorImg,
  Enclosures: enclosureImg,
  Accessories: accessoriesImg,
};

type SortKey = "price-asc" | "price-desc" | "rating" | "demand";

function PartCard({ part, onAdd }: { part: Part; onAdd: () => void }) {
  const highDemand = isHighDemandPart(part.brand);
  return (
    <div
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/40"
      data-testid={`part-card-${part.id}`}
    >
      <div className="relative flex aspect-[200/140] items-center justify-center overflow-hidden bg-gradient-to-br from-background to-card">
        <img
          src={CATEGORY_IMG[part.category]}
          alt={part.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <span className="absolute left-2 top-2 rounded-full border border-border bg-background/80 px-2 py-0.5 text-[11px] font-medium text-muted-foreground backdrop-blur">
          {part.category}
        </span>
        {part.demandTier === "High" && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
            ⚡ High demand
          </span>
        )}
        {part.demandTier === "Value" && (
          <span className="absolute right-2 top-2 rounded-full border border-chart-2/40 bg-chart-2/10 px-2 py-0.5 text-[11px] font-medium text-chart-2">
            Value pick
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {part.brand}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Package className="size-3" />
            {part.inStock ? `${part.stockCount} in stock` : "Backorder"}
          </span>
        </div>
        <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug">{part.name}</h3>
        <p className="mt-1 font-mono text-xs text-muted-foreground">{part.spec}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Fits: {part.compatibility.join(", ")}
        </p>

        {!part.inStock && (
          <span className="mt-2 inline-flex w-fit items-center rounded-full border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
            Limited stock
          </span>
        )}

        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <span className="text-base font-semibold">{formatPrice(part.price)}</span>
            {part.compareAt && (
              <span className="ml-1.5 text-xs text-muted-foreground line-through">
                {formatPrice(part.compareAt)}
              </span>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onAdd}
            className="gap-1.5"
            data-testid={`part-add-${part.id}`}
          >
            <ShoppingCart className="size-3.5" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PartsPage() {
  const { add } = useCart();
  const { toast } = useToast();
  const [category, setCategory] = useState<PartCategory | "All">("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("demand");
  const [inStockOnly, setInStockOnly] = useState(false);

  const filtered = useMemo(() => {
    let list = parts.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (query && !`${p.name} ${p.brand} ${p.spec}`.toLowerCase().includes(query.toLowerCase()))
        return false;
      if (inStockOnly && !p.inStock) return false;
      return true;
    });
    const demandRank = (p: Part) => (p.demandTier === "High" ? 0 : p.demandTier === "Value" ? 2 : 1);
    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        default:
          return demandRank(a) - demandRank(b) || b.reviewCount - a.reviewCount;
      }
    });
    return list;
  }, [category, query, sort, inStockOnly]);

  const onAdd = (p: Part) => {
    if (!p.inStock) {
      toast({
        title: "Backorder item",
        description: `${p.name} is currently scarce — added at the listed price.`,
      });
    }
    add(p);
    toast({ title: "Added to cart", description: `${p.name} added to your cart.` });
  };

  const highDemandCount = parts.filter((p) => p.demandTier === "High").length;
  const backorderCount = parts.filter((p) => !p.inStock).length;

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="absolute inset-0 bg-grid opacity-40" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Cpu className="size-3.5" /> Build or repair your own pack
            </span>
            <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Battery parts & components
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Genuine cells, BMS boards, chargers, connectors, and accessories — priced
              competitively and adjusted live for supply &amp; demand. High-demand brands and
              scarce stock carry a premium; value picks sit below baseline.
            </p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <span className="inline-flex items-center gap-2">
                <Package className="size-4 text-primary" /> {parts.length} parts in stock
              </span>
              <span className="inline-flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" /> {highDemandCount} high-demand SKUs
              </span>
              <span className="inline-flex items-center gap-2">
                <Zap className="size-4 text-primary" /> {backorderCount} on backorder (scarcity-priced)
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {PART_CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                data-testid={`part-cat-${c.key}`}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  category === c.key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 lg:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search cells, BMS, chargers…"
                className="pl-9"
                data-testid="part-search"
              />
            </div>
            <div className="relative">
              <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="h-10 w-40 appearance-none rounded-md border border-border bg-card pl-9 pr-3 text-sm"
                data-testid="part-sort"
              >
                <option value="demand">Sort: Demand</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="accent-[hsl(var(--primary))]"
              data-testid="part-instock"
            />
            In stock only
          </label>
          <span className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "part" : "parts"}
          </span>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-border py-16 text-center">
            <Cpu className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              No parts match your filters.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <PartCard key={p.id} part={p} onAdd={() => onAdd(p)} />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
