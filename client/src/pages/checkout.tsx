import { useState } from "react";
import { Link } from "wouter";
import { CheckCircle2, Truck, Store, CreditCard, Lock, ArrowLeft, ShieldCheck, Zap } from "lucide-react";
import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/siteData";
import { cn } from "@/lib/utils";

type Step = 0 | 1 | 2;

export function CheckoutPage() {
  const { items, subtotal, clear, count } = useCart();
  const [step, setStep] = useState<Step>(0);
  const [fulfillment, setFulfillment] = useState<"ship" | "pickup">("ship");
  const [orderNo] = useState("JR-ORD-" + Math.random().toString(36).slice(2, 7).toUpperCase());

  const tax = Math.round(subtotal * 0.08875 * 100) / 100;
  const shipping = fulfillment === "ship" ? 14.95 : 0;
  const total = subtotal + tax + shipping;

  if (count === 0 && step < 2) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="font-display text-2xl font-semibold">Your cart is empty</h1>
          <Link href="/store"><Button className="mt-5">Browse the store</Button></Link>
        </div>
      </PageLayout>
    );
  }

  const steps = ["Shipping", "Payment", "Confirmation"];

  return (
    <PageLayout>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <span className={cn("flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold", i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                  {i < step ? <CheckCircle2 className="size-4" /> : i + 1}
                </span>
                <span className={cn("text-sm", i <= step ? "font-medium" : "text-muted-foreground")}>{label}</span>
              </div>
              {i < steps.length - 1 && <div className="h-px w-6 bg-border sm:w-12" />}
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-border bg-card p-6 sm:p-8">
          {step === 0 && (
            <div>
              <h1 className="font-display text-xl font-semibold">Shipping & fulfillment</h1>
              {/* Fulfillment toggle */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFulfillment("ship")}
                  className={cn("rounded-lg border p-4 text-left", fulfillment === "ship" ? "border-primary bg-primary/5" : "border-border")}
                  data-testid="checkout-ship"
                >
                  <Truck className="size-5 text-primary" />
                  <p className="mt-2 text-sm font-semibold">Ship to me</p>
                  <p className="text-xs text-muted-foreground">$14.95 · 2–4 days</p>
                </button>
                <button
                  onClick={() => setFulfillment("pickup")}
                  className={cn("rounded-lg border p-4 text-left", fulfillment === "pickup" ? "border-primary bg-primary/5" : "border-border")}
                  data-testid="checkout-pickup"
                >
                  <Store className="size-5 text-primary" />
                  <p className="mt-2 text-sm font-semibold">Pickup in store</p>
                  <p className="text-xs text-muted-foreground">Free · Bronx, NY</p>
                </button>
              </div>

              <form
                className="mt-6 space-y-4"
                onSubmit={(e) => { e.preventDefault(); setStep(1); }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" testId="field-name"><input required className="input" data-testid="checkout-name" /></Field>
                  <Field label="Email" testId="field-email"><input required type="email" className="input" data-testid="checkout-email" /></Field>
                </div>
                {fulfillment === "ship" && (
                  <>
                    <Field label="Street address" testId="field-address"><input required className="input" data-testid="checkout-address" /></Field>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field label="City" testId="field-city"><input required className="input" data-testid="checkout-city" /></Field>
                      <Field label="State" testId="field-state"><input required className="input" data-testid="checkout-state" /></Field>
                      <Field label="ZIP" testId="field-zip"><input required className="input" data-testid="checkout-zip" /></Field>
                    </div>
                  </>
                )}
                {fulfillment === "pickup" && (
                  <div className="rounded-lg border border-border bg-background p-3 text-sm text-muted-foreground">
                    Pickup at <span className="font-medium text-foreground">1401 Blondell Avenue, Bronx, NY 10461</span>. We'll email when your order is ready (usually same or next day).
                  </div>
                )}
                <div className="flex items-center justify-between pt-2">
                  <Button variant="ghost" onClick={() => window.location.hash = "#/cart"} className="gap-1.5"><ArrowLeft className="size-4" /> Back to cart</Button>
                  <Button type="submit" className="gap-2">Continue to payment <CreditCard className="size-4" /></Button>
                </div>
              </form>
            </div>
          )}

          {step === 1 && (
            <form
              className="space-y-5"
              onSubmit={(e) => { e.preventDefault(); setStep(2); clear(); }}
            >
              <div>
                <h1 className="font-display text-xl font-semibold">Payment</h1>
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-primary">
                  <Lock className="size-3.5" /> Demo only — no real card is processed or stored.
                </div>
              </div>
              <Field label="Card number" testId="field-card"><input required inputMode="numeric" placeholder="4242 4242 4242 4242" className="input font-mono" data-testid="checkout-card" /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Expiry" testId="field-exp"><input required placeholder="MM / YY" className="input font-mono" data-testid="checkout-exp" /></Field>
                <Field label="CVC" testId="field-cvc"><input required inputMode="numeric" placeholder="123" className="input font-mono" data-testid="checkout-cvc" /></Field>
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Order total</p>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{formatPrice(tax)}</span></div>
                  {shipping > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{formatPrice(shipping)}</span></div>}
                  <div className="flex justify-between border-t border-border pt-1.5"><span className="font-semibold">Total</span><span className="font-display text-lg font-semibold">{formatPrice(total)}</span></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Button type="button" variant="ghost" onClick={() => setStep(0)} className="gap-1.5"><ArrowLeft className="size-4" /> Back</Button>
                <Button type="submit" className="gap-2" size="lg"><ShieldCheck className="size-4" /> Pay {formatPrice(total)}</Button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="py-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-status-online/15">
                <CheckCircle2 className="size-9 text-status-online" />
              </div>
              <h1 className="mt-5 font-display text-2xl font-semibold">Order confirmed</h1>
              <p className="mt-2 text-muted-foreground">Thank you — your batteries are being prepared.</p>
              <p className="mt-4 font-mono text-lg font-semibold text-primary" data-testid="order-number">{orderNo}</p>
              <p className="mt-1 text-xs text-muted-foreground">{fulfillment === "pickup" ? "Pickup at 1401 Blondell Ave, Bronx, NY" : "Shipping to your address"} · A confirmation was sent to your email.</p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Link href="/store"><Button className="gap-2"><Store className="size-4" /> Continue shopping</Button></Link>
                <Link href="/repair/track"><Button variant="outline" className="gap-2"><Zap className="size-4" /> Track a repair</Button></Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

function Field({ label, testId, children }: { label: string; testId: string; children: React.ReactNode }) {
  return (
    <label className="block" data-testid={testId}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
