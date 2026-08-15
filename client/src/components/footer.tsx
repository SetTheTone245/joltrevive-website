import { Link } from "wouter";
import { MapPin, Phone, Mail, Clock, Zap } from "lucide-react";
import { Logo } from "./logo";
import { STORE_INFO } from "@/lib/siteData";
import { batteries } from "@/lib/batteryCatalog";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Lithium-ion battery diagnostics, repair, rebuilding, and replacement for
              New York City riders.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <Zap className="size-3.5" /> {batteries.length}+ battery database
            </span>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Platform</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/finder" className="text-muted-foreground hover:text-foreground">Battery Finder</Link></li>
              <li><Link href="/store" className="text-muted-foreground hover:text-foreground">Online Store</Link></li>
              <li><Link href="/repair" className="text-muted-foreground hover:text-foreground">Repair Center</Link></li>
              <li><Link href="/repair/track" className="text-muted-foreground hover:text-foreground">Track a Repair</Link></li>
              <li><Link href="/appointments" className="text-muted-foreground hover:text-foreground">Book Appointment</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Visit</h3>
            <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-primary" /> {STORE_INFO.address}</li>
              <li className="flex gap-2"><Phone className="mt-0.5 size-4 shrink-0 text-primary" /> {STORE_INFO.phone}</li>
              <li className="flex gap-2"><Mail className="mt-0.5 size-4 shrink-0 text-primary" /> {STORE_INFO.email}</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hours</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {STORE_INFO.hours.map((h) => (
                <li key={h.day} className="flex items-center justify-between gap-3 text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Clock className="size-3.5" />{h.day}</span>
                  <span className="font-mono text-xs">{h.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© 2026 Jolt Revive. Prototype demo — sample inventory & spec data.</p>
          <p className="font-mono">JoltRevive.com</p>
        </div>
      </div>
    </footer>
  );
}
