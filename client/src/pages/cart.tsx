import { Link } from "wouter";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Store, Zap, ShieldCheck } from "lucide-react";
import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { BatteryVisual } from "@/components/battery-visual";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/siteData";

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
          <p className="mt-2 text-muted-foreground">Find the right battery for your ride and add it here.</p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href="/finder"><Button className="gap-2"><Zap className="size-4" /> Find My Battery</Button></Link>
            <Link href="/store"><Button variant="outline" className="gap-2"><Store className="size-4" /> Browse store</Button></Link>
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
            {items.map(({ battery: b, qty }) => (
              <div key={b.id} className="flex gap-4 rounded-xl border border-border bg-card p-3" data-testid={`cart-item-${b.id}`}>
                <Link href={`/product/${b.id}`}>
                  <BatteryVisual battery={b} className="h-20 w-28 shrink-0" />
                </Link>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link href={`/product/${b.id}`} className="text-sm font-semibold hover:text-primary">{b.name}</Link>
                      <p className="font-mono text-xs text-muted-foreground">{b.voltage}V · {b.wattHours}Wh · {b.chemistry}</p>
                    </div>
                    <button onClick={() => remove(b.id)} className="text-muted-foreground hover:text-destructive" aria-label="Remove" data-testid={`cart-remove-${b.id}`}>
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center rounded-md border border-border">
                      <button onClick={() => setQty(b.id, qty - 1)} className="p-1.5 hover-elevate" aria-label="Decrease" data-testid={`cart-dec-${b.id}`}><Minus className="size-3.5" /></button>
                      <span className="w-8 text-center text-sm font-medium" data-testid={`cart-qty-${b.id}`}>{qty}</span>
                      <button onClick={() => setQty(b.id, qty + 1)} className="p-1.5 hover-elevate" aria-label="Increase" data-testid={`cart-inc-${b.id}`}><Plus className="size-3.5" /></button>
                    </div>
                    <span className="font-semibold">{formatPrice(b.price * qty)}</span>
                  </div>
                </div>
              </div>
            ))}
            <Link href="/store"><Button variant="ghost" size="sm" className="gap-1.5">Continue shopping <ArrowRight className="size-3.5" /></Button></Link>
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
