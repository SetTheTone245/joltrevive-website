import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Zap, Stethoscope, Wrench, Hammer, Plug, CircuitBoard, Battery,
  Search, ArrowRight, ShieldCheck, Clock, PackageCheck, ChevronRight,
} from "lucide-react";
import { PageLayout, SectionHeading } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SERVICES, formatPrice } from "@/lib/siteData";

const SERVICE_ICONS: Record<string, React.ElementType> = {
  stethoscope: Stethoscope, wrench: Wrench, hammer: Hammer,
  battery: Battery, circuit: CircuitBoard, plug: Plug,
};

export function RepairPage() {
  const [loc] = useLocation();
  const params = new URLSearchParams((window.location.hash.split("?")[1] || ""));
  const activeService = params.get("service");
  const [repairNo, setRepairNo] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = repairNo.trim();
    if (!val) return;
    if (!/^JR-\d+$/i.test(val)) {
      setError("Enter a repair number like JR-10287");
      return;
    }
    window.location.hash = `#/repair/track?number=${val.toUpperCase()}`;
  };

  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary"><Zap className="size-3.5" /> Repair Center</span>
          <h1 className="mt-2 max-w-2xl font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Bring a dying battery back — or replace it entirely
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Professional lithium-ion diagnostics, repair, rebuilding, and replacement. Transparent starting prices and live repair tracking.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/appointments"><Button className="gap-2"><Stethoscope className="size-4" /> Book a diagnostic</Button></Link>
            <Link href="/repair/track"><Button variant="outline" className="gap-2"><PackageCheck className="size-4" /> Track a repair</Button></Link>
          </div>
        </div>
      </section>

      {/* Track repair quick lookup */}
      <section className="border-b border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <h2 className="font-display text-lg font-semibold">Track your repair</h2>
              <p className="mt-1 text-sm text-muted-foreground">Have a repair number? Check live status anytime — no login needed.</p>
              <p className="mt-3 text-xs text-muted-foreground">Try sample: <button onClick={() => setRepairNo("JR-10287")} className="font-mono text-primary underline" data-testid="sample-repair">JR-10287</button></p>
            </div>
            <form onSubmit={submit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={repairNo} onChange={(e) => { setRepairNo(e.target.value); setError(""); }} placeholder="JR-10287" className="pl-8 font-mono uppercase" data-testid="track-input" />
              </div>
              <Button type="submit" className="gap-1.5" data-testid="track-button">Track <ArrowRight className="size-3.5" /></Button>
            </form>
          </div>
          {error && <p className="mt-2 text-sm text-destructive" data-testid="track-error">{error}</p>}
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading eyebrow="Services" title="Pick the service you need" description="Starting prices below. Final quotes are confirmed after a $49 diagnostic." />
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => {
            const Icon = SERVICE_ICONS[s.icon] ?? Wrench;
            const active = activeService === s.id;
            return (
              <div key={s.id} className={`flex flex-col rounded-xl border bg-card p-5 ${active ? "border-primary ring-1 ring-primary/30" : "border-border"} hover-elevate`} id={s.id} data-testid={`service-${s.id}`}>
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-5" /></span>
                  <span className="text-xs text-muted-foreground">from</span>
                </div>
                <h3 className="mt-4 text-base font-semibold">{s.name}</h3>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">{s.blurb}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-display text-xl font-semibold text-primary">{formatPrice(s.startingPrice)}</span>
                  <Link href={`/appointments?service=${s.id}`}><Button variant="outline" size="sm" className="gap-1.5">Book <ArrowRight className="size-3.5" /></Button></Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Process */}
      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionHeading eyebrow="How it works" title="From drop-off to pickup" />
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: "01", t: "Book or walk in", d: "Schedule online or drop by the Bronx shop." },
              { n: "02", t: "Diagnostic", d: "Cell-level scan and a transparent quote." },
              { n: "03", t: "We repair", d: "Approved work — cells, BMS, connectors." },
              { n: "04", t: "Test & pickup", d: "Load-tested, warranted, and ready." },
            ].map((s) => (
              <li key={s.n} className="rounded-xl border border-border bg-background p-5">
                <span className="font-mono text-sm text-primary">{s.n}</span>
                <h3 className="mt-2 text-sm font-semibold">{s.t}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Trust */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-4 rounded-2xl border border-border bg-card p-8 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, t: "Warranty included", d: "Up to 24 months on serviced parts." },
            { icon: Clock, t: "2–4 day turnaround", d: "Most repairs completed within days." },
            { icon: Battery, t: "All chemistries", d: "NMC, NCA, LiFePO4, and LiPo packs." },
          ].map((f) => (
            <div key={f.t} className="flex items-start gap-3">
              <f.icon className="size-5 shrink-0 text-primary" />
              <div><p className="text-sm font-semibold">{f.t}</p><p className="text-xs text-muted-foreground">{f.d}</p></div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <Link href="/appointments"><Button size="lg" className="gap-2"><Zap className="size-4" /> Schedule service <ChevronRight className="size-4" /></Button></Link>
        </div>
      </section>
    </PageLayout>
  );
}
