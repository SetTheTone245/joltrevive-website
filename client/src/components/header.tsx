import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Battery, ShoppingCart, Menu, Moon, Sun, X, MapPin, Phone } from "lucide-react";
import { Logo } from "./logo";
import { useCart } from "@/context/cart-context";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { STORE_INFO } from "@/lib/siteData";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/finder", label: "Battery Finder" },
  { href: "/store", label: "Store" },
  { href: "/repair", label: "Repair Center" },
  { href: "/appointments", label: "Appointments" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [loc] = useLocation();
  const { count } = useCart();
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center" data-testid="link-home">
          <Logo />
        </Link>

        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {NAV.map((n) => {
            const active = loc === n.href || (n.href !== "/" && loc.startsWith(n.href));
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors hover-elevate",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
                data-testid={`nav-${n.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label="Toggle theme"
            data-testid="button-theme"
          >
            {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </Button>
          <Link href="/cart" data-testid="link-cart">
            <Button variant="outline" size="icon" className="relative" aria-label="Cart">
              <ShoppingCart className="size-5" />
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground" style={{ height: 18, minWidth: 18 }}>
                  {count}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/finder" className="hidden sm:block">
            <Button size="sm" className="gap-1.5" data-testid="button-find-battery">
              <Battery className="size-4" /> Find My Battery
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            data-testid="button-menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-background lg:hidden">
          <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center gap-3 border-t border-border px-3 py-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><MapPin className="size-3.5" /> Bronx, NY</span>
              <span className="flex items-center gap-1.5"><Phone className="size-3.5" /> {STORE_INFO.phone}</span>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
