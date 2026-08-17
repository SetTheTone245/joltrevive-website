import { batteries } from "../client/src/lib/batteryCatalog.js";
import { parts } from "../client/src/lib/partsCatalog.js";

export interface CatalogCheckoutItem {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
}

const checkoutCatalog = new Map<string, CatalogCheckoutItem>(
  [...batteries, ...parts].map((product) => [
    product.id,
    {
      id: product.id,
      name: product.name,
      price: product.price,
      inStock: product.inStock,
    },
  ]),
);

/**
 * The checkout route reads directly from the same catalog modules used by the
 * storefront. The browser sends only IDs and quantities; all prices are looked
 * up here before a Stripe session is created.
 */
export function getCatalogCheckoutItem(id: string): CatalogCheckoutItem | undefined {
  return checkoutCatalog.get(id);
}
