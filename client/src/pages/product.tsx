import { useState } from "react";
import { Link, useParams } from "wouter";
import {
  Star, ShoppingCart, Zap, Store, MessageSquare, ShieldCheck, Truck,
  CheckCircle2, ChevronRight, ArrowLeft, Ruler, Timer, Gauge, Factory, RotateCcw, Battery as BatteryIcon,
} from "lucide-react";
import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { BatteryVisual } from "@/components/battery-visual";
import { BatteryCard } from "@/components/battery-card";
import { getBatteryById, batteries } from "@/lib/batteryCatalog";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, conditionLabel, conditionBadgeClass } from "@/lib/siteData";
import { cn } from "@/lib/utils";

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const battery = getBatteryById(id);
  const { add } = useCart();
  const { toast } = useToast();
  const [reserveOpen, setReserveOpen] = useState(false);

  if (!battery) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="font-display text-2xl font-semibold">Battery not found</h1>
          <p className="mt-2 text-muted-foreground">This pack isn't in our sample catalog.</p>
          <Link href="/store"><Button className="mt-6">Browse the store</Button></Link>
        </div>
      </PageLayout>
    );
  }

  const related = batteries.filter((b) => b.vehicleType === battery.vehicleType && b.id !== battery.id).slice(0, 4);

  const onAdd = () => { add(battery); toast({ title: "Added to cart", description: battery.name }); };
  const onBuyNow = () => { add(battery); window.location.hash = "#/checkout"; };

  const specs = [
    { icon: Gauge, label: "Nominal voltage", value: `${battery.voltage}V` },
    { icon: BatteryIcon, label: "Capacity", value: `${battery.capacityAh}Ah` },
    { icon: Zap, label: "Energy", value: `${battery.wattHours}Wh` },
    { icon: RotateCcw, label: "Est. riding range", value: `${battery.estRangeMiles} mi` },
    { icon: Timer, label: "Charge time", value: `${battery.chargeTimeHours} hours` },
    { icon: ShieldCheck, label: "Warranty", value: `${battery.warrantyMonths} months` },
    { icon: Ruler, label: "Dimensions", value: battery.dimensions },
    { icon: Factory, label: "Cell manufacturer", value: battery.cellManufacturer },
  ];

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground" data-testid="product-breadcrumb">
          <Link href="/store" className="hover:text-foreground">Store</Link>
          <ChevronRight className="size-3" />
          <Link href={`/finder?type=${encodeURIComponent(battery.vehicleType)}`} className="hover:text-foreground">{battery.vehicleType}</Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground">{battery.brand} {battery.model}</span>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          {/* Visuals */}
          <div>
            <BatteryVisual battery={battery} className="aspect-[200/140] w-full rounded-xl" />
            <div className="mt-3 grid grid-cols-4 gap-2">
              {["Label", "Connector", "Cell pack", "BMS"].map((label, i) => (
                <div key={label} className="rounded-lg border border-border bg-card p-2 text-center">
                  <div className="mx-auto mb-1 h-8 w-full rounded bg-gradient-to-br from-primary/20 to-background" />
                  <span className="text-[10px] text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("rounded-full border px-2 py-0.5 text-xs font-medium", conditionBadgeClass(battery.condition))}>{conditionLabel(battery.condition)}</span>
              <span className="text-xs text-muted-foreground">{battery.chemistry}</span>
              {battery.inStock ? (
                <span className="flex items-center gap-1 text-xs text-status-online"><CheckCircle2 className="size-3.5" /> In stock</span>
              ) : (
                <span className="text-xs text-destructive">Out of stock</span>
              )}
            </div>
            <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">{battery.name}</h1>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Star className="size-4 fill-chart-3 text-chart-3" />
              <span className="font-medium text-foreground">{battery.rating.toFixed(1)}</span>
              <span>· {battery.reviewCount} reviews</span>
            </div>

            <div className="mt-4 flex items-end gap-3">
              <span className="font-display text-3xl font-semibold">{formatPrice(battery.price)}</span>
              {battery.compareAt && <span className="mb-1 text-sm text-muted-foreground line-through">{formatPrice(battery.compareAt)}</span>}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-2">
              <Button size="lg" className="gap-2" onClick={onBuyNow} disabled={!battery.inStock} data-testid="product-buy-now">
                <Zap className="size-4" /> Buy Now
              </Button>
              <Button size="lg" variant="outline" className="gap-2" onClick={onAdd} disabled={!battery.inStock} data-testid="product-add-cart">
                <ShoppingCart className="size-4" /> Add to Cart
              </Button>
              <Button size="lg" variant="outline" className="gap-2" onClick={() => setReserveOpen(true)} data-testid="product-reserve">
                <Store className="size-4" /> Reserve for Pickup
              </Button>
              <Button size="lg" variant="outline" className="gap-2" onClick={() => window.dispatchEvent(new CustomEvent("jolt:open-chat"))} data-testid="product-ask-tech">
                <MessageSquare className="size-4" /> Ask a Technician
              </Button>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-5 text-center">
              {[
                { icon: Truck, t: "Ship or pickup", s: "Mail-in or Bronx drop-off" },
                { icon: ShieldCheck, t: `${battery.warrantyMonths} mo warranty`, s: "On serviced parts" },
                { icon: CheckCircle2, t: "Fitment confirmed", s: "By a technician" },
              ].map((f) => (
                <div key={f.t}>
                  <f.icon className="mx-auto size-5 text-primary" />
                  <p className="mt-1 text-xs font-semibold">{f.t}</p>
                  <p className="text-[11px] text-muted-foreground">{f.s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Specs + compatibility */}
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="font-display text-xl font-semibold">Technical specifications</h2>
            <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {specs.map((s) => (
                <div key={s.label} className="flex items-start gap-2.5 border-b border-border/60 pb-2.5">
                  <s.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
                    <p className="text-sm font-medium">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {battery.refurbished && (
              <div className="mt-6 rounded-xl border border-chart-3/30 bg-chart-3/5 p-5">
                <h3 className="font-semibold text-chart-3">Refurbishment report</h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between"><dt className="text-muted-foreground">Remaining capacity</dt><dd className="font-mono font-medium">{battery.refurbished.remainingCapacityPct}%</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Prior cycle count</dt><dd className="font-mono font-medium">{battery.refurbished.cycleCount}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">New cells installed</dt><dd className="text-right font-medium">{battery.refurbished.newCells}</dd></div>
                </dl>
                <p className="mt-3 rounded-md bg-background p-3 text-xs text-muted-foreground">{battery.refurbished.testResult}</p>
              </div>
            )}
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold">Compatibility</h2>
            <div className="mt-4 rounded-xl border border-border bg-card p-5 text-sm">
              <p className="text-muted-foreground">Vehicle type</p>
              <p className="font-semibold">{battery.vehicleType}</p>
              <p className="mt-3 text-muted-foreground">Brand</p>
              <p className="font-semibold">{battery.brand}</p>
              <p className="mt-3 text-muted-foreground">Model</p>
              <p className="font-semibold">{battery.model}</p>
              <Link href={`/finder?type=${encodeURIComponent(battery.vehicleType)}&brand=${encodeURIComponent(battery.brand)}&model=${encodeURIComponent(battery.model)}`}>
                <Button variant="outline" size="sm" className="mt-4 w-full gap-1.5">See all options <ArrowLeft className="size-3.5 rotate-180" /></Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Reviews */}
        {battery.reviews && battery.reviews.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-xl font-semibold">Customer reviews</h2>
            <div className="mt-4 space-y-4">
              {battery.reviews.map((r, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{r.author}</p>
                    <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="size-3.5 fill-chart-3 text-chart-3" />)}</div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">"{r.text}"</p>
                  <p className="mt-2 text-xs text-muted-foreground">{r.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-xl font-semibold">Related batteries</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((b) => <BatteryCard key={b.id} battery={b} />)}
            </div>
          </div>
        )}
      </div>

      {reserveOpen && <ReserveModal battery={battery} onClose={() => setReserveOpen(false)} />}
    </PageLayout>
  );
}

function ReserveModal({ battery, onClose }: { battery: ReturnType<typeof getBatteryById> & {}; onClose: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [done, setDone] = useState(false);
  const confirmation = "JR-RS-" + Math.random().toString(36).slice(2, 7).toUpperCase();

  if (!battery) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur" onClick={onClose} data-testid="reserve-modal">
      <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-border px-5 py-3">
          <h3 className="font-display font-semibold">Reserve for pickup</h3>
        </div>
        {done ? (
          <div className="p-6 text-center">
            <CheckCircle2 className="mx-auto size-10 text-status-online" />
            <p className="mt-3 font-semibold">Reservation confirmed</p>
            <p className="mt-1 text-sm text-muted-foreground">{battery.name}</p>
            <p className="mt-3 font-mono text-lg font-semibold text-primary">{confirmation}</p>
            <p className="mt-2 text-xs text-muted-foreground">Bring this number to the Bronx shop. We'll hold the pack for 48 hours.</p>
            <Button className="mt-5 w-full" onClick={onClose}>Done</Button>
          </div>
        ) : (
          <form
            className="space-y-4 p-5"
            onSubmit={(e) => { e.preventDefault(); setDone(true); }}
          >
            <p className="text-sm text-muted-foreground">Reserve <span className="font-medium text-foreground">{battery.name}</span> ({formatPrice(battery.price)}) for in-store pickup.</p>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" data-testid="reserve-name" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} required type="tel" className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" data-testid="reserve-phone" />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="flex-1">Confirm reservation</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
