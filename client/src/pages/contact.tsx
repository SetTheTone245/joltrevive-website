import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Navigation, Car, Train, Zap, Send, Star, MessageSquare } from "lucide-react";
import { PageLayout, SectionHeading } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { STORE_INFO, TESTIMONIALS } from "@/lib/siteData";

export function ContactPage() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Message sent", description: `Thanks ${name.split(" ")[0] || ""} — we'll reply within one business day. (Demo)` });
    setName(""); setEmail(""); setMessage("");
  };

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(STORE_INFO.mapsQuery)}`;
  const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(STORE_INFO.mapsQuery)}&output=embed`;

  return (
    <PageLayout>
      <div className="border-b border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary"><MapPin className="size-3.5" /> Contact & Directions</span>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">Visit Jolt Revive in the Bronx</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Drop off your battery for a free safety check, or message us with questions.</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Map */}
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <iframe
              title="Jolt Revive location"
              src={mapEmbed}
              className="h-72 w-full sm:h-80"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              data-testid="contact-map"
            />
            <div className="p-5">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="font-semibold">{STORE_INFO.address}</p>
                  <p className="text-sm text-muted-foreground">Street parking on Blondell · small lot behind the shop</p>
                </div>
              </div>
              <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                <Button className="mt-4 w-full gap-2" data-testid="directions-button"><Navigation className="size-4" /> Get directions</Button>
              </a>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-display text-lg font-semibold">Shop details</h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-center gap-3"><Phone className="size-4 text-primary" /> <a href={`tel:${STORE_INFO.phoneTel}`} className="hover:text-primary">{STORE_INFO.phone}</a></li>
                <li className="flex items-center gap-3"><Mail className="size-4 text-primary" /> <a href={`mailto:${STORE_INFO.email}`} className="hover:text-primary">{STORE_INFO.email}</a></li>
                <li className="flex items-start gap-3"><Clock className="mt-0.5 size-4 text-primary" />
                  <ul className="space-y-0.5">
                    {STORE_INFO.hours.map((h) => <li key={h.day} className="flex justify-between gap-6"><span>{h.day}</span><span className="font-mono text-xs text-muted-foreground">{h.time}</span></li>)}
                  </ul>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-card p-4">
                <Car className="size-5 text-primary" />
                <p className="mt-2 text-sm font-semibold">By car</p>
                <p className="mt-1 text-xs text-muted-foreground">Off I-95 exit 8B. ~25 min from Midtown.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <Train className="size-5 text-primary" />
                <p className="mt-2 text-sm font-semibold">By transit</p>
                <p className="mt-1 text-xs text-muted-foreground">Bx12 / 5 train to Pelham Bay, short ride.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact form + reviews */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <SectionHeading eyebrow="Message us" title="Send a message" />
            <form onSubmit={onSubmit} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required className="input mt-1" data-testid="contact-name" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" className="input mt-1" data-testid="contact-email" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Message</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={4} className="input mt-1" data-testid="contact-message" placeholder="What's going on with your battery?" />
              </div>
              <div className="flex items-center justify-between">
                <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("jolt:open-chat"))} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
                  <MessageSquare className="size-4" /> Or chat with a technician
                </button>
                <Button type="submit" className="gap-2" data-testid="contact-submit"><Send className="size-4" /> Send</Button>
              </div>
            </form>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <SectionHeading eyebrow="Reviews" title="What riders say" />
            <div className="mt-5 space-y-4">
              {TESTIMONIALS.map((t) => (
                <div key={t.author} className="border-b border-border/60 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{t.author}</p>
                    <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="size-3 fill-chart-3 text-chart-3" />)}</div>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">"{t.text}"</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t.vehicle}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
              <Zap className="size-4 text-primary" /> <span>5.0 rating from 200+ NYC repairs</span>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
