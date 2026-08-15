import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Search, ArrowRight, Zap, CheckCircle2, Circle, Wrench, Clock,
  User, CalendarDays, PackageCheck, AlertCircle, Stethoscope,
} from "lucide-react";
import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getQueryFn } from "@/lib/queryClient";

interface RepairResponse {
  repairNumber: string;
  vehicle: string;
  service: string;
  statusIndex: number;
  receivedAt: string;
  estimatedReady: string;
  technician: string;
  notes: string[];
  steps: string[];
}

export function TrackRepairPage() {
  const params = new URLSearchParams(window.location.hash.split("?")[1] || "");
  const initialNumber = params.get("number") || "";
  const [number, setNumber] = useState(initialNumber);
  const [searched, setSearched] = useState(initialNumber);

  const { data, isLoading, isError } = useQuery<RepairResponse>({
    queryKey: ["/api/repairs", searched],
    enabled: !!searched,
    queryFn: getQueryFn<RepairResponse>({ on401: "throw" }),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = number.trim().toUpperCase();
    if (!/^JR-\d+$/.test(val)) return;
    setSearched(val);
    window.location.hash = `#/repair/track?number=${val}`;
  };

  return (
    <PageLayout>
      <div className="border-b border-border bg-card/40">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary"><PackageCheck className="size-3.5" /> Repair Tracking</span>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">Track your repair</h1>
          <p className="mt-2 text-sm text-muted-foreground">Enter your repair number to see live status. No login required.</p>
          <form onSubmit={submit} className="mt-5 flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="JR-10287" className="pl-8 font-mono uppercase" data-testid="track-input" />
            </div>
            <Button type="submit" className="gap-1.5" data-testid="track-button">Track <ArrowRight className="size-3.5" /></Button>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">
            Try a sample:{" "}
            {["JR-10287", "JR-10312", "JR-10299", "JR-10340"].map((n) => (
              <button key={n} onClick={() => { setNumber(n); setSearched(n); window.location.hash = `#/repair/track?number=${n}`; }} className="mx-1 font-mono text-primary underline" data-testid={`sample-${n}`}>{n}</button>
            ))}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {!searched && (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            Enter a repair number above to check its status.
          </div>
        )}

        {searched && isLoading && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />)}
          </div>
        )}

        {searched && isError && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-8 text-center">
            <AlertCircle className="mx-auto size-8 text-destructive" />
            <h2 className="mt-3 font-semibold">Repair not found</h2>
            <p className="mt-1 text-sm text-muted-foreground">We couldn't find repair <span className="font-mono">{searched}</span>. Double-check the number or contact us.</p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button variant="outline" onClick={() => { setNumber("JR-10287"); setSearched("JR-10287"); window.location.hash = "#/repair/track?number=JR-10287"; }}>Try JR-10287</Button>
              <Link href="/contact"><Button className="gap-2">Contact support <ArrowRight className="size-4" /></Button></Link>
            </div>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Header card */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Repair number</p>
                  <p className="font-mono text-xl font-semibold tracking-tight" data-testid="repair-number">{data.repairNumber}</p>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <Wrench className="size-3.5" /> {data.steps[data.statusIndex]}
                </span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Info icon={Stethoscope} label="Service" value={data.service} />
                <Info icon={Circle} label="Vehicle" value={data.vehicle} />
                <Info icon={User} label="Technician" value={data.technician} />
                <Info icon={CalendarDays} label="Est. ready" value={data.estimatedReady} />
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="size-3.5" /> Received {data.receivedAt}
              </div>
            </div>

            {/* Status timeline */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-display text-lg font-semibold">Repair status</h2>
              <ol className="mt-5 space-y-1">
                {data.steps.map((step, i) => {
                  const done = i < data.statusIndex;
                  const current = i === data.statusIndex;
                  return (
                    <li key={step} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        {done ? (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground"><CheckCircle2 className="size-3.5" /></span>
                        ) : current ? (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary bg-primary/10"><Zap className="size-3 text-primary animate-jolt-pulse" /></span>
                        ) : (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border" />
                        )}
                        {i < data.steps.length - 1 && <span className={`my-1 w-px flex-1 ${done ? "bg-primary/40" : "bg-border"}`} style={{ minHeight: 16 }} />}
                      </div>
                      <div className="pb-4">
                        <p className={`text-sm font-medium ${current ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"}`}>{step}</p>
                        {current && <p className="mt-0.5 text-xs text-muted-foreground">In progress</p>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Notes */}
            {data.notes.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-display text-lg font-semibold">Technician notes</h2>
                <ul className="mt-3 space-y-2">
                  {data.notes.map((note, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-center gap-3">
              <Link href="/appointments"><Button variant="outline" className="gap-2">Book another service</Button></Link>
              <button onClick={() => window.dispatchEvent(new CustomEvent("jolt:open-chat"))}><Button className="gap-2"><PackageCheck className="size-4" /> Ask about this repair</Button></button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

function Info({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div>
      <p className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground"><Icon className="size-3" /> {label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}
