import { Link } from "wouter";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Store, Zap, ShieldCheck, Cpu } from "lucide-react";
import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { BatteryVisual } from "@/components/battery-visual";
import { useCart, isPart } from "@/context/cart-context";
import { formatPrice } from "@/lib/siteData";
import { CATEGORY_IMG } from "@/pages/parts";

export function CartPage() {
  const { items, setQty, remove, subtotal, count } = useCart();
  const tax = Math.round(subtotal * 0.08875 * 100) / 100;
  const total = subtotal + tax;

  if (count === 0) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ShoppingCart className="size-7 text-muted-foreground" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-semibold">Your cart is empty</h1>
          <p className="mt-2 text-muted-foreground">Find the right battery or parts for your ride and add them here.</p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href="/finder"><Button className="gap-2"><Zap className="size-4" /> Find My Battery</Button></Link>
            <Link href="/store"><Button variant="outline" className="gap-2"><Store className="size-4" /> Browse store</Button></Link>
            <Link href="/parts"><Button variant="outline" className="gap-2"><Cpu className="size-4" /> Browse parts</Button></Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Your cart</h1>
        <p className="mt-1 text-sm text-muted-foreground">{count} {count === 1 ? "item" : "items"}</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Items */}
          <div className="space-y-3">
            {items.map(({ product: p, qty }) => {
              const part = isPart(p);
              const link = part ? "/parts" : `/product/${p.id}`;
              return (
              <div key={p.id} className="flex gap-4 rounded-xl border border-border bg-card p-3" data-testid={`cart-item-${p.id}`}>
                <Link href={link}>
                  {part ? (
                    <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-background">
                      <img src={CATEGORY_IMG[p.category]} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <BatteryVisual battery={p} className="h-20 w-28 shrink-0" />
                  )}
                </Link>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link href={link} className="text-sm font-semibold hover:text-primary">{p.name}</Link>
                      <p className="font-mono text-xs text-muted-foreground">
                        {part ? `${p.category} · ${p.spec}` : `${p.voltage}V · ${p.wattHours}Wh · ${p.chemistry}`}
                      </p>
                    </div>
                    <button onClick={() => remove(p.id)} className="text-muted-foreground hover:text-destructive" aria-label="Remove" data-testid={`cart-remove-${p.id}`}>
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center rounded-md border border-border">
                      <button onClick={() => setQty(p.id, qty - 1)} className="p-1.5 hover-elevate" aria-label="Decrease" data-testid={`cart-dec-${p.id}`}><Minus className="size-3.5" /></button>
                      <span className="w-8 text-center text-sm font-medium" data-testid={`cart-qty-${p.id}`}>{qty}</span>
                      <button onClick={() => setQty(p.id, qty + 1)} className="p-1.5 hover-elevate" aria-label="Increase" data-testid={`cart-inc-${p.id}`}><Plus className="size-3.5" /></button>
                    </div>
                    <span className="font-semibold">{formatPrice(p.price * qty)}</span>
                  </div>
                </div>
              </div>
              );
            })}
            <Link href="/store"><Button variant="ghost" size="sm" className="gap-1.5">Continue shopping <ArrowRight className="size-3.5" /></Button></Link>
            <Link href="/parts"><Button variant="ghost" size="sm" className="gap-1.5">Browse parts <Cpu className="size-3.5" /></Button></Link>
          </div>

          {/* Summary */}
          <div className="h-fit rounded-xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-semibold">Order summary</h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Est. tax (8.875%)</dt><dd>{formatPrice(tax)}</dd></div>
              <div className="flex justify-between border-t border-border pt-2.5"><dt className="font-semibold">Total</dt><dd className="font-display text-lg font-semibold">{formatPrice(total)}</dd></div>
            </dl>
            <Link href="/checkout"><Button className="mt-5 w-full gap-2" size="lg"><ShieldCheck className="size-4" /> Checkout</Button></Link>
            <p className="mt-2 text-center text-xs text-muted-foreground">Demo checkout — no real payment is processed.</p>
            <div className="mt-4 rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5 font-medium text-foreground"><Store className="size-3.5" /> Pickup available</p>
              <p className="mt-1">1401 Blondell Ave, Bronx, NY. Reserve at checkout.</p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
