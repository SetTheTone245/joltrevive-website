import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  CheckCircle2,
  Truck,
  Store,
  CreditCard,
  ArrowLeft,
  ShieldCheck,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/siteData";
import { createCheckoutSession, getCheckoutConfig } from "@/lib/api";
import { cn } from "@/lib/utils";

type Step = 0 | 1;
type Fulfillment = "ship" | "pickup";

function checkoutStatus() {
  return new URLSearchParams(window.location.hash.split("?")[1] || "").get("status");
}

export function CheckoutPage() {
  const { items, subtotal, count } = useCart();
  const [step, setStep] = useState<Step>(0);
  const [fulfillment, setFulfillment] = useState<Fulfillment>("ship");
  const [email, setEmail] = useState("");
  const [paymentEnabled, setPaymentEnabled] = useState<boolean | null>(null);
  const [paymentError, setPaymentError] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const status = checkoutStatus();

  useEffect(() => {
    let cancelled = false;
    getCheckoutConfig()
      .then((config) => {
        if (!cancelled) setPaymentEnabled(config.enabled);
      })
      .catch(() => {
        if (!cancelled) setPaymentEnabled(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const shipping = fulfillment === "ship" ? 14.95 : 0;
  const shownTotal = subtotal + shipping;
  const cartSummary = useMemo(
    () =>
      items.map((item) => ({
        id: item.product.id,
        quantity: item.qty,
        name: item.product.name,
        lineTotal: item.product.price * item.qty,
      })),
    [items],
  );

  const pay = async () => {
    setPaymentError("");
    setIsRedirecting(true);
    try {
      const { url } = await createCheckoutSession({
        items: cartSummary.map(({ id, quantity }) => ({ id, quantity })),
        fulfillment,
        email,
      });
      window.location.assign(url);
    } catch (error) {
      setPaymentError(
        error instanceof Error
          ? error.message
          : "Card payments could not be started. Please call 844-NYC-JOLT.",
      );
      setIsRedirecting(false);
    }
  };

  if (status === "success") {
    return (
      <PageLayout>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-status-online/15">
            <CheckCircle2 className="size-9 text-status-online" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-semibold">Payment complete</h1>
          <p className="mt-2 text-muted-foreground">
            Stripe has returned you to Jolt Revive. We&apos;ll follow up with the details of your order.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href="/store"><Button className="gap-2"><Store className="size-4" /> Continue shopping</Button></Link>
            <Link href="/repair/track"><Button variant="outline" className="gap-2"><Zap className="size-4" /> Track a repair</Button></Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (count === 0) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="font-display text-2xl font-semibold">Your cart is empty</h1>
          <Link href="/store"><Button className="mt-5">Browse the store</Button></Link>
        </div>
      </PageLayout>
    );
  }

  const steps = ["Shipping", "Payment"];

  return (
    <PageLayout>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {status === "cancelled" && (
          <div className="mb-5 rounded-lg border border-chart-3/40 bg-chart-3/10 p-3 text-sm">
            Checkout was cancelled. Your cart is still here when you&apos;re ready.
          </div>
        )}
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
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFulfillment("ship")}
                  className={cn("rounded-lg border p-4 text-left", fulfillment === "ship" ? "border-primary bg-primary/5" : "border-border")}
                  data-testid="checkout-ship"
                >
                  <Truck className="size-5 text-primary" />
                  <p className="mt-2 text-sm font-semibold">Ship to me</p>
                  <p className="text-xs text-muted-foreground">$14.95 · 2–4 days</p>
                </button>
                <button
                  type="button"
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
                onSubmit={(event) => {
                  event.preventDefault();
                  setStep(1);
                }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" testId="field-name"><input required className="input" data-testid="checkout-name" /></Field>
                  <Field label="Email" testId="field-email"><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="input" data-testid="checkout-email" /></Field>
                </div>
                {fulfillment === "ship" ? (
                  <>
                    <Field label="Street address" testId="field-address"><input required className="input" data-testid="checkout-address" /></Field>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field label="City" testId="field-city"><input required className="input" data-testid="checkout-city" /></Field>
                      <Field label="State" testId="field-state"><input required className="input" data-testid="checkout-state" /></Field>
                      <Field label="ZIP" testId="field-zip"><input required className="input" data-testid="checkout-zip" /></Field>
                    </div>
                    <p className="text-xs text-muted-foreground">Stripe will securely confirm your delivery address at checkout.</p>
                  </>
                ) : (
                  <div className="rounded-lg border border-border bg-background p-3 text-sm text-muted-foreground">
                    Pickup at <span className="font-medium text-foreground">1401 Blondell Avenue, Bronx, NY 10461</span>. We&apos;ll email when your order is ready.
                  </div>
                )}
                <div className="flex items-center justify-between pt-2">
                  <Button type="button" variant="ghost" onClick={() => window.location.hash = "#/cart"} className="gap-1.5"><ArrowLeft className="size-4" /> Back to cart</Button>
                  <Button type="submit" className="gap-2">Continue to payment <CreditCard className="size-4" /></Button>
                </div>
              </form>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h1 className="font-display text-xl font-semibold">Payment</h1>
                <p className="mt-2 text-sm text-muted-foreground">Card details are entered only on Stripe&apos;s secure hosted checkout.</p>
              </div>
              <OrderSummary items={cartSummary} subtotal={subtotal} shipping={shipping} total={shownTotal} />
              {paymentEnabled === false ? (
                <div className="rounded-lg border border-chart-3/40 bg-chart-3/10 p-4 text-sm" data-testid="checkout-payments-unavailable">
                  <div className="flex gap-2">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-chart-3" />
                    <p>Card payments are being switched on — call <a className="font-semibold underline" href="tel:+18446925658">844-NYC-JOLT</a> or visit the shop to complete this order.</p>
                  </div>
                </div>
              ) : (
                <>
                  {paymentEnabled === null && <p className="text-sm text-muted-foreground">Checking card payment availability…</p>}
                  {paymentError && <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{paymentError}</p>}
                  <div className="flex items-center justify-between">
                    <Button type="button" variant="ghost" onClick={() => setStep(0)} className="gap-1.5"><ArrowLeft className="size-4" /> Back</Button>
                    <Button type="button" onClick={pay} disabled={paymentEnabled !== true || isRedirecting} className="gap-2" size="lg" data-testid="checkout-stripe-pay">
                      <ShieldCheck className="size-4" /> {isRedirecting ? "Opening Stripe…" : "Pay securely with Stripe"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

function OrderSummary({
  items,
  subtotal,
  shipping,
  total,
}: {
  items: Array<{ id: string; quantity: number; name: string; lineTotal: number }>;
  subtotal: number;
  shipping: number;
  total: number;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Order summary</p>
      <div className="mt-3 space-y-2 text-sm">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between gap-4">
            <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
            <span>{formatPrice(item.lineTotal)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-border pt-2"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
        {shipping > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{formatPrice(shipping)}</span></div>}
        <div className="flex justify-between border-t border-border pt-2"><span className="font-semibold">Checkout total</span><span className="font-display text-lg font-semibold">{formatPrice(total)}</span></div>
      </div>
    </div>
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
