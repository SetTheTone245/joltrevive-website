import { Link } from "wouter";
import { Star, ShoppingCart, ArrowRight } from "lucide-react";
import type { Battery } from "@/lib/batteryCatalog";
import { BatteryVisual } from "./battery-visual";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, conditionLabel, conditionBadgeClass } from "@/lib/siteData";

export function BatteryCard({ battery }: { battery: Battery }) {
  const { add } = useCart();
  const { toast } = useToast();

  const onAdd = () => {
    if (!battery.inStock) {
      toast({ title: "Out of stock", description: "This pack is currently unavailable.", variant: "destructive" });
      return;
    }
    add(battery);
    toast({ title: "Added to cart", description: `${battery.name} added to your cart.` });
  };

  return (
    <div
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/40"
      data-testid={`battery-card-${battery.id}`}
    >
      <Link href={`/product/${battery.id}`} className="block">
        <BatteryVisual battery={battery} className="aspect-[200/140] w-full" />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${conditionBadgeClass(battery.condition)}`}>
            {conditionLabel(battery.condition)}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3 fill-chart-3 text-chart-3" />
            {battery.rating.toFixed(1)}
            <span className="text-muted-foreground/70">({battery.reviewCount})</span>
          </span>
        </div>
        <Link href={`/product/${battery.id}`} className="mt-2 block">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug hover:text-primary">{battery.name}</h3>
        </Link>
        <p className="mt-1 font-mono text-xs text-muted-foreground">
          {battery.voltage}V · {battery.capacityAh}Ah · {battery.wattHours}Wh
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{battery.brand} · {battery.vehicleType}</p>

        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <span className="text-base font-semibold">{formatPrice(battery.price)}</span>
            {battery.compareAt && (
              <span className="ml-1.5 text-xs text-muted-foreground line-through">{formatPrice(battery.compareAt)}</span>
            )}
          </div>
          <Button size="sm" variant="outline" onClick={onAdd} className="gap-1.5" data-testid={`add-cart-${battery.id}`}>
            <ShoppingCart className="size-3.5" /> Add
          </Button>
        </div>
        <Link href={`/product/${battery.id}`} className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-primary">
          View details <ArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  );
}
