import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Battery } from "@/lib/batteryCatalog";

export interface CartItem {
  battery: Battery;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  add: (battery: Battery, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const add = (battery: Battery, qty = 1) =>
    setItems((prev) => {
      const existing = prev.find((i) => i.battery.id === battery.id);
      if (existing) {
        return prev.map((i) =>
          i.battery.id === battery.id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { battery, qty }];
    });

  const remove = (id: string) =>
    setItems((prev) => prev.filter((i) => i.battery.id !== id));

  const setQty = (id: string, qty: number) =>
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.battery.id !== id)
        : prev.map((i) => (i.battery.id === id ? { ...i, qty } : i))
    );

  const clear = () => setItems([]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.battery.price * i.qty, 0);
    return { items, add, remove, setQty, clear, count, subtotal };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
