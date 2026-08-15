import { Link } from "wouter";
import {
  Battery, Calendar, ShoppingBag, MapPin, ArrowRight, Star, Zap, Cpu,
  Stethoscope, Wrench, Hammer, Plug, CircuitBoard, SlidersHorizontal, Sparkles,
  ShieldCheck, Clock, Package, Truck,
} from "lucide-react";
import { PageLayout, SectionHeading } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { BatteryCard } from "@/components/battery-card";
import { VEHICLE_TYPES, featuredBatteries, getBrandsFor, batteries, type VehicleType } from "@/lib/batteryCatalog";
import { SERVICES, TESTIMONIALS, PHASE2, STORE_INFO, formatPrice } from "@/lib/siteData";

const SERVICE_ICONS: Record<string, React.ElementType> = {
  stethoscope: Stethoscope,
  wrench: Wrench,
  hammer: Hammer,
  battery: Battery,
  circuit: CircuitBoard,
  plug: Plug,
};

export function HomePage() {
  const featured = featuredBatteries();
  const stats = [
    { label: "Batteries in database", value: `${batteries.length}+` },
    { label: "Vehicle brands", value: "23" },
    { label: "Avg. turnaround", value: "3 days" },
    { label: "Warranty up to", value: "24 mo" },
  ];

  return (
    <PageLayout>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute inset-0 gradient-radial-primary" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-status-online animate-jolt-pulse" />
                Now serving NYC riders · Bronx repair center
              </span>
              <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Bring Your Battery<br />
                <span className="text-primary text-glow">Back to Life</span>
              </h1>
              <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
                Professional lithium-ion battery diagnostics, repair, rebuilding, restoration,
                and replacement. For e-bikes, e-scooters, e-motorcycles, and e-boards.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                <Link href="/finder" data-testid="hero-find-battery">
                  <Button className="w-full gap-2 sm:w-auto" size="lg"><Battery className="size-4" /> Find My Battery</Button>
                </Link>
                <Link href="/appointments" data-testid="hero-schedule">
                  <Button variant="outline" className="w-full gap-2 sm:w-auto" size="lg"><Calendar className="size-4" /> Schedule Service</Button>
                </Link>
                <Link href="/store" data-testid="hero-shop">
                  <Button variant="outline" className="w-full gap-2 sm:w-auto" size="lg"><ShoppingBag className="size-4" /> Shop Batteries</Button>
                </Link>
                <Link href="/parts" data-testid="hero-parts">
                  <Button variant="outline" className="w-full gap-2 sm:w-auto" size="lg"><Cpu className="size-4" /> Shop Parts</Button>
                </Link>
                <Link href="/contact" data-testid="hero-directions">
                  <Button variant="outline" className="w-full gap-2 sm:w-auto" size="lg"><MapPin className="size-4" /> Get Directions</Button>
                </Link>
              </div>
            </div>

            {/* Hero visual: battery finder quick start */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-2xl bg-primary/10 blur-2xl" />
              <div className="relative rounded-2xl border border-border bg-card p-5 shadow-2xl">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Battery Finder</p>
                  <span className="flex items-center gap-1 text-xs text-primary"><Zap className="size-3" /> Instant match</span>
                </div>
                <p className="mt-1 text-sm font-medium">Choose your vehicle to find the right pack</p>
                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  {VEHICLE_TYPES.map((v) => {
                    const brands = getBrandsFor(v.type as VehicleType);
                    return (
                      <Link
                        key={v.type}
                        href={`/finder?type=${encodeURIComponent(v.type)}`}
                        className="group rounded-lg border border-border bg-background p-3 hover-elevate hover:border-primary/40"
                        data-testid={`hero-vehicle-${v.type}`}
                      >
                        <span className="text-2xl">{v.icon}</span>
                        <span className="mt-1 block text-sm font-semibold">{v.type}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{brands.length} brands</span>
                      </Link>
                    );
                  })}
                </div>
                <Link href="/finder">
                  <Button variant="ghost" className="mt-3 w-full justify-between" size="sm">
                    Open full battery finder <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* stats strip (full width, so the finder sits right after CTAs on mobile) */}
        <div className="relative mx-auto max-w-7xl px-4 pb-10 sm:px-6">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border pt-8 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="font-display text-2xl font-semibold text-primary">{s.value}</dt>
                <dd className="text-xs text-muted-foreground">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* brand marquee */}
        <div className="relative border-t border-border bg-background/60">
          <div className="mx-auto max-w-7xl overflow-hidden px-4 py-3 sm:px-6">
            <div className="flex w-max animate-marquee items-center gap-8 text-sm font-medium text-muted-foreground">
              {[...BRANDS, ...BRANDS].map((b, i) => (
                <span key={i} className="flex items-center gap-2 whitespace-nowrap">
                  <span className="h-1 w-1 rounded-full bg-primary/60" /> {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="Repair Center"
          title="Service for every battery fault"
          description="From a corroded connector to a full cell refresh — transparent starting prices, no surprises."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => {
            const Icon = SERVICE_ICONS[s.icon] ?? Wrench;
            return (
              <div key={s.id} className="group rounded-xl border border-border bg-card p-5 hover-elevate hover:border-primary/40">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">from</span>
                </div>
                <h3 className="mt-4 text-base font-semibold">{s.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.blurb}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-display text-xl font-semibold text-primary">{formatPrice(s.startingPrice)}</span>
                  <Link href={`/repair?service=${s.id}`}>
                    <Button variant="outline" size="sm" className="gap-1.5">Learn more <ArrowRight className="size-3.5" /></Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURED BATTERIES */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <SectionHeading eyebrow="Online Store" title="Featured batteries" />
            <Link href="/store">
              <Button variant="outline" size="sm" className="gap-1.5">Browse all <ArrowRight className="size-3.5" /></Button>
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((b) => <BatteryCard key={b.id} battery={b} />)}
          </div>
        </div>
      </section>

      {/* PROCESS + TRACKING TEASER */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Repair Tracking"
              title="Follow your repair, step by step"
              description="Every repair gets a tracking number. Check live status anytime — no phone calls needed."
            />
            <div className="mt-6 space-y-3">
              {[
                { icon: Package, title: "Battery received", text: "Drop-off or ship-in; we log it on arrival." },
                { icon: Stethoscope, title: "Diagnostic & quote", text: "Full cell-level scan, then a transparent quote before any work." },
                { icon: Wrench, title: "Repair in progress", text: "Approved work begins — cells, BMS, or connectors." },
                { icon: ShieldCheck, title: "Testing & pickup", text: "Load-tested and ready, with warranty on serviced parts." },
              ].map((step, i) => (
                <div key={i} className="flex gap-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                    <step.icon className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/repair/track">
              <Button className="mt-6 gap-2"><Zap className="size-4" /> Track a repair</Button>
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Repair #</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">In progress</span>
            </div>
            <p className="mt-1 font-mono text-lg font-semibold tracking-tight">JR-10287</p>
            <p className="text-sm text-muted-foreground">Sur-Ron Light Bee X · Battery Rebuilding</p>
            <div className="mt-5 space-y-2.5">
              {["Battery received", "Diagnostic completed", "Quote approved", "Repair in progress", "Testing", "Ready for pickup"].map((label, i) => {
                const done = i <= 3;
                const current = i === 3;
                return (
                  <div key={label} className="flex items-center gap-3">
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${done ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                      {done && <Zap className="size-2.5" />}
                    </span>
                    <span className={`text-sm ${current ? "font-semibold text-primary" : done ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, title: "Warranty on repairs", text: "Up to 24 months on serviced parts." },
            { icon: Clock, title: "Fast turnaround", text: "Most repairs in 2–4 days." },
            { icon: Truck, title: "Ship-in or drop-off", text: "Mail your battery or visit the Bronx." },
            { icon: Zap, title: `${batteries.length}+ battery database`, text: "The region's largest Li-ion resource." },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <f.icon className="size-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold">{f.title}</p>
                <p className="text-xs text-muted-foreground">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading eyebrow="Customer Reviews" title="Riders trust Jolt Revive" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.author} className="rounded-xl border border-border bg-card p-6">
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="size-4 fill-chart-3 text-chart-3" />)}
              </div>
              <p className="mt-3 text-sm text-foreground">"{t.text}"</p>
              <p className="mt-4 text-sm font-semibold">{t.author}</p>
              <p className="text-xs text-muted-foreground">{t.vehicle}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PHASE 2 */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-background p-8">
          <SectionHeading eyebrow="Coming Soon" title="Phase 2: smarter battery tools" description="We're building tools to make Jolt Revive the largest lithium-ion battery resource center in the region." />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {PHASE2.map((p) => {
              const Icon = p.icon === "sliders" ? SlidersHorizontal : Sparkles;
              return (
                <div key={p.name} className="relative overflow-hidden rounded-xl border border-border bg-background p-5">
                  <div className="flex items-center gap-2">
                    <Icon className="size-5 text-primary" />
                    <h3 className="text-base font-semibold">{p.name}</h3>
                    <span className="ml-auto rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Soon</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{p.blurb}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* MAP / LOCATION CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid lg:grid-cols-2">
            <div className="p-8">
              <SectionHeading eyebrow="Visit" title="Bronx repair center" />
              <div className="mt-5 space-y-3 text-sm">
                <p className="flex items-start gap-2.5"><MapPin className="mt-0.5 size-4 shrink-0 text-primary" /> {STORE_INFO.address}</p>
                <p className="flex items-center gap-2.5"><Clock className="size-4 shrink-0 text-primary" /> Mon–Fri 9–7 · Sat 10–6 · Sun 11–4</p>
              </div>
              <div className="mt-6 flex gap-3">
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(STORE_INFO.mapsQuery)}`} target="_blank" rel="noopener noreferrer">
                  <Button className="gap-2"><MapPin className="size-4" /> Get directions</Button>
                </a>
                <Link href="/contact"><Button variant="outline" className="gap-2">Contact</Button></Link>
              </div>
            </div>
            <iframe
              title="Jolt Revive location map"
              src={`https://www.google.com/maps?q=${encodeURIComponent(STORE_INFO.mapsQuery)}&output=embed`}
              className="h-64 w-full lg:h-auto"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              data-testid="map-embed"
            />
          </div>
        </div>
      </section>
    </PageLayout>
  );
}

const BRANDS = [
  "Aventon", "Trek", "Rad Power", "Lectric", "Specialized", "Giant",
  "Segway", "NIU", "Apollo", "Hiboy", "Kaabo", "Gotrax",
  "Sur-Ron", "Talaria", "E Ride Pro", "Zero", "Stark",
  "Boosted", "Meepo", "Exway", "Backfire", "Evolve",
];
