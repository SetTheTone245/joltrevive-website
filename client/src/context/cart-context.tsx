import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Battery } from "@/lib/batteryCatalog";
import type { Part } from "@/lib/partsCatalog";

export type CartProduct = Battery | Part;

export interface CartItem {
  product: CartProduct;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  add: (product: CartProduct, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const add = (product: CartProduct, qty = 1) =>
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { product, qty }];
    });

  const remove = (id: string) =>
    setItems((prev) => prev.filter((i) => i.product.id !== id));

  const setQty = (id: string, qty: number) =>
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.product.id === id)
        : prev.map((i) => (i.product.id === id ? { ...i, qty } : i))
    );

  const clear = () => setItems([]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
    return { items, add, remove, setQty, clear, count, subtotal };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

// Narrowing helper — Parts carry a `kind: "part"` discriminant; Batteries do not.
export function isPart(p: CartProduct): p is Part {
  return (p as Part).kind === "part";
}
