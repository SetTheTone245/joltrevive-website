import { useMemo } from "react";
import { Link } from "wouter";
import { useLocation } from "wouter";
import {
  Battery, ChevronRight, Search, Zap, ShoppingCart, Wrench, ArrowRight,
  Gauge, Ruler, Timer, ShieldCheck, Factory, Bike, RotateCcw,
} from "lucide-react";
import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BatteryVisual } from "@/components/battery-visual";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import {
  batteries, VEHICLE_TYPES, getBrandsFor, getModelsFor,
  type VehicleType, type Battery as B,
} from "@/lib/batteryCatalog";
import { SERVICES, formatPrice, conditionLabel, conditionBadgeClass } from "@/lib/siteData";

function useHashParams() {
  const [loc] = useLocation();
  const search = (window.location.hash.split("?")[1] || "").split("&");
  const params: Record<string, string> = {};
  for (const p of search) {
    const [k, v] = p.split("=");
    if (k) params[decodeURIComponent(k)] = decodeURIComponent(v || "");
  }
  return params;
}

const VEHICLE_ICON: Record<string, React.ElementType> = {
  "E-Bike": Bike, "E-Scooter": Bike, "E-Motorcycle": Bike, "E-Board": Bike,
};

export function FinderPage() {
  const params = useHashParams();
  const type = params.type as VehicleType | undefined;
  const brand = params.brand;
  const model = params.model;

  const results = useMemo(() => {
    let list = batteries;
    if (type) list = list.filter((b) => b.vehicleType === type);
    if (brand) list = list.filter((b) => b.brand === brand);
    if (model) list = list.filter((b) => b.model === model);
    return list;
  }, [type, brand, model]);

  const step = !type ? 1 : !brand ? 2 : !model ? 3 : 4;

  return (
    <PageLayout>
      {/* Stepper header */}
      <div className="border-b border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <Zap className="size-3.5" /> Battery Finder
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Find the right battery for your ride
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Drill down by vehicle type, brand, and model — then compare specs, inventory, and pricing.
          </p>

          {/* breadcrumb stepper */}
          <div className="mt-6 flex flex-wrap items-center gap-1.5 text-sm">
            <StepLink active={step === 1} done={!!type} href="/finder" label="Vehicle" value={type || "Choose"} />
            <ChevronRight className="size-3.5 text-muted-foreground" />
            <StepLink active={step === 2} done={!!brand} disabled={!type} href={type ? `/finder?type=${encodeURIComponent(type)}` : "#"} label="Brand" value={brand || "Choose"} />
            <ChevronRight className="size-3.5 text-muted-foreground" />
            <StepLink active={step === 3} done={!!model} disabled={!brand} href={brand ? `/finder?type=${encodeURIComponent(type || "")}&brand=${encodeURIComponent(brand)}` : "#"} label="Model" value={model || "Choose"} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {step === 1 && <Step1 selected={type} />}
        {step === 2 && <Step2 type={type!} selected={brand} />}
        {step === 3 && <Step3 type={type!} brand={brand!} selected={model} />}
        {step === 4 && <Results results={results} type={type!} brand={brand!} model={model!} />}
      </div>
    </PageLayout>
  );
}

function StepLink({ active, done, disabled, href, label, value }: { active: boolean; done: boolean; disabled?: boolean; href: string; label: string; value: string }) {
  const cls = `flex items-center gap-1.5 rounded-full border px-3 py-1.5 ${active ? "border-primary bg-primary/10 text-primary" : done ? "border-border text-foreground" : "border-border text-muted-foreground"}`;
  if (disabled) return <span className={cls + " opacity-50"}>{label}: <span className="font-medium">{value}</span></span>;
  return <Link href={href} className={cls} data-testid={`step-${label.toLowerCase()}`}>{label}: <span className="font-medium">{value}</span></Link>;
}

function Step1({ selected }: { selected?: string }) {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold">1. Choose your vehicle</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {VEHICLE_TYPES.map((v) => {
          const brands = getBrandsFor(v.type);
          const count = batteries.filter((b) => b.vehicleType === v.type).length;
          return (
            <Link
              key={v.type}
              href={`/finder?type=${encodeURIComponent(v.type)}`}
              className={`group rounded-xl border bg-card p-5 hover-elevate hover:border-primary/40 ${selected === v.type ? "border-primary" : "border-border"}`}
              data-testid={`finder-vehicle-${v.type}`}
            >
              <span className="text-3xl">{v.icon}</span>
              <h3 className="mt-3 text-base font-semibold">{v.type}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{v.blurb}</p>
              <p className="mt-3 font-mono text-xs text-primary">{brands.length} brands · {count} packs</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Step2({ type, selected }: { type: VehicleType; selected?: string }) {
  const brands = getBrandsFor(type);
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">2. Select your brand</h2>
        <Link href="/finder"><Button variant="ghost" size="sm">Change vehicle</Button></Link>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((br) => {
          const count = batteries.filter((b) => b.vehicleType === type && b.brand === br).length;
          return (
            <Link
              key={br}
              href={`/finder?type=${encodeURIComponent(type)}&brand=${encodeURIComponent(br)}`}
              className={`group flex items-center justify-between rounded-lg border bg-card p-4 hover-elevate hover:border-primary/40 ${selected === br ? "border-primary" : "border-border"}`}
              data-testid={`finder-brand-${br}`}
            >
              <div>
                <p className="font-semibold">{br}</p>
                <p className="font-mono text-xs text-muted-foreground">{count} packs</p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Step3({ type, brand, selected }: { type: VehicleType; brand: string; selected?: string }) {
  const models = getModelsFor(type, brand);
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">3. Select your model</h2>
        <Link href={`/finder?type=${encodeURIComponent(type)}`}><Button variant="ghost" size="sm">Change brand</Button></Link>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {models.map((m) => {
          const count = batteries.filter((b) => b.vehicleType === type && b.brand === brand && b.model === m).length;
          return (
            <Link
              key={m}
              href={`/finder?type=${encodeURIComponent(type)}&brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(m)}`}
              className={`group flex items-center justify-between rounded-lg border bg-card p-4 hover-elevate hover:border-primary/40 ${selected === m ? "border-primary" : "border-border"}`}
              data-testid={`finder-model-${m}`}
            >
              <div>
                <p className="font-semibold">{m}</p>
                <p className="font-mono text-xs text-muted-foreground">{count} battery options</p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Results({ results, type, brand, model }: { results: B[]; type: VehicleType; brand: string; model: string }) {
  const related = SERVICES.filter((s) => ["diagnostic", "repair", "rebuilding", "cell-replacement"].includes(s.id));
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{type} · {brand}</p>
          <h2 className="font-display text-2xl font-semibold">{model} — battery options</h2>
        </div>
        <Link href={`/finder?type=${encodeURIComponent(type)}`}><Button variant="outline" size="sm">Change model</Button></Link>
      </div>

      <div className="mt-6 space-y-4">
        {results.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
            No packs in our sample database for this exact model. <Link href="/store" className="text-primary underline">Browse the full store</Link> or <Link href="/appointments" className="text-primary underline">book a diagnostic</Link>.
          </div>
        )}
        {results.map((b) => <ResultRow key={b.id} b={b} />)}
      </div>

      {/* Related services */}
      <div className="mt-12 rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-lg font-semibold">Related services</h3>
        <p className="mt-1 text-sm text-muted-foreground">Not sure you need a new battery? We repair and rebuild existing packs.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((s) => (
            <Link key={s.id} href={`/repair?service=${s.id}`} className="rounded-lg border border-border bg-background p-4 hover-elevate hover:border-primary/40">
              <p className="text-sm font-semibold">{s.name}</p>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{s.blurb}</p>
              <p className="mt-2 font-mono text-xs text-primary">from {formatPrice(s.startingPrice)}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResultRow({ b }: { b: B }) {
  const { add } = useCart();
  const { toast } = useToast();
  const specs = [
    { icon: Gauge, label: "Voltage", value: `${b.voltage}V` },
    { icon: Battery, label: "Capacity", value: `${b.capacityAh}Ah` },
    { icon: Zap, label: "Energy", value: `${b.wattHours}Wh` },
    { icon: RotateCcw, label: "Est. range", value: `${b.estRangeMiles} mi` },
    { icon: Timer, label: "Charge time", value: `${b.chargeTimeHours}h` },
    { icon: ShieldCheck, label: "Warranty", value: `${b.warrantyMonths} mo` },
    { icon: Ruler, label: "Dimensions", value: b.dimensions },
    { icon: Factory, label: "Cells", value: b.cellManufacturer },
  ];

  const onAdd = () => {
    if (!b.inStock) { toast({ title: "Out of stock", variant: "destructive" }); return; }
    add(b); toast({ title: "Added to cart", description: b.name });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card" data-testid={`result-${b.id}`}>
      <div className="grid gap-5 p-5 sm:grid-cols-[200px_1fr]">
        <Link href={`/product/${b.id}`}>
          <BatteryVisual battery={b} className="aspect-[200/140] w-full" />
        </Link>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${conditionBadgeClass(b.condition)}`}>{conditionLabel(b.condition)}</span>
            <span className="text-xs text-muted-foreground">{b.chemistry}</span>
            {b.refurbished && <span className="text-xs text-muted-foreground">· {b.refurbished.remainingCapacityPct}% capacity</span>}
          </div>
          <Link href={`/product/${b.id}`} className="mt-1.5 block hover:text-primary">
            <h3 className="font-display text-lg font-semibold">{b.name}</h3>
          </Link>

          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
            {specs.map((s) => (
              <div key={s.label} className="flex items-start gap-1.5">
                <s.icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
                  <p className="text-xs font-medium">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {b.refurbished && (
            <div className="mt-3 rounded-lg border border-border bg-background p-3 text-xs">
              <p className="font-semibold text-foreground">Refurbishment report</p>
              <p className="mt-1 text-muted-foreground">{b.refurbished.testResult}</p>
              <p className="mt-1 text-muted-foreground">New cells: {b.refurbished.newCells}</p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-display text-xl font-semibold">{formatPrice(b.price)}</span>
              {b.compareAt && <span className="ml-2 text-xs text-muted-foreground line-through">{formatPrice(b.compareAt)}</span>}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={onAdd} className="gap-1.5" data-testid={`result-add-${b.id}`}>
                <ShoppingCart className="size-3.5" /> Add to cart
              </Button>
              <Link href={`/product/${b.id}`}>
                <Button size="sm" className="gap-1.5">Details <ArrowRight className="size-3.5" /></Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
