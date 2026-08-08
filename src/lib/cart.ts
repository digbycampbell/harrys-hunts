/**
 * Client-only cart for the mock storefront.
 *
 * Everything lives in memory and in `localStorage`. No request is ever sent, no
 * order is created, and no payment is processed anywhere in this codebase.
 */
import { atom, computed } from 'nanostores';
import { getProduct, priceForSelection, type Product } from '../data/products';

export const CART_STORAGE_KEY = 'hh-demo-cart-v1';
export const DELIVERY_STORAGE_KEY = 'hh-demo-delivery-v1';

export interface CartLine {
  /** Stable per product + option combination, so repeat adds merge. */
  id: string;
  slug: string;
  selection: Record<string, string>;
  quantity: number;
}

export interface ResolvedLine extends CartLine {
  product: Product;
  unitPrice: number;
  lineTotal: number;
}

export type DeliveryZoneId = 'nz-metro' | 'nz-rural' | 'australia' | 'international';

export interface DeliveryZone {
  id: DeliveryZoneId;
  label: string;
  /** Indicative demo figure in NZD. */
  fee: number;
  /** Orders at or above this subtotal ship without a fee. `null` disables it. */
  freeOver: number | null;
  estimate: string;
}

export const deliveryZones: DeliveryZone[] = [
  {
    id: 'nz-metro',
    label: 'New Zealand — urban',
    fee: 9,
    freeOver: 250,
    estimate: '1–2 working days',
  },
  {
    id: 'nz-rural',
    label: 'New Zealand — rural delivery',
    fee: 15,
    freeOver: 250,
    estimate: '2–4 working days',
  },
  { id: 'australia', label: 'Australia', fee: 32, freeOver: 450, estimate: '4–7 working days' },
  { id: 'international', label: 'Rest of world', fee: 58, freeOver: null, estimate: '7–14 working days' },
];

export const MAX_QUANTITY = 10;

export const $cart = atom<CartLine[]>([]);
export const $cartOpen = atom(false);
export const $cartReady = atom(false);
export const $deliveryZone = atom<DeliveryZoneId>('nz-metro');

/** Deterministic id so the same product + options merges into one line. */
export function lineId(slug: string, selection: Record<string, string>): string {
  const options = Object.keys(selection)
    .sort()
    .map((key) => `${key}:${selection[key]}`)
    .join('|');
  return options ? `${slug}--${options}` : slug;
}

function readStorage(): CartLine[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCartLine).filter((line) => getProduct(line.slug));
  } catch {
    return [];
  }
}

function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== 'object' || value === null) return false;
  const line = value as Partial<CartLine>;
  return (
    typeof line.id === 'string' &&
    typeof line.slug === 'string' &&
    typeof line.quantity === 'number' &&
    line.quantity > 0 &&
    typeof line.selection === 'object' &&
    line.selection !== null
  );
}

function writeStorage(lines: readonly CartLine[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
  } catch {
    /* Private-mode or quota failures must not break the demo. */
  }
}

function readZone(): DeliveryZoneId {
  if (typeof localStorage === 'undefined') return 'nz-metro';
  const stored = localStorage.getItem(DELIVERY_STORAGE_KEY);
  return deliveryZones.some((zone) => zone.id === stored)
    ? (stored as DeliveryZoneId)
    : 'nz-metro';
}

let hydrated = false;

/** Loads persisted lines once per page. Safe to call from every island. */
export function hydrateCart(): void {
  if (hydrated) {
    $cartReady.set(true);
    return;
  }
  hydrated = true;
  $cart.set(readStorage());
  // The destination chosen in the cart has to survive the walk to checkout.
  $deliveryZone.set(readZone());
  $cartReady.set(true);
  $cart.listen(writeStorage);
  $deliveryZone.listen((zone) => {
    try {
      localStorage.setItem(DELIVERY_STORAGE_KEY, zone);
    } catch {
      /* Private-mode failures must not break the demo. */
    }
  });

  // Keep tabs (and the cart page + drawer) in step.
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key === CART_STORAGE_KEY) $cart.set(readStorage());
      if (event.key === DELIVERY_STORAGE_KEY) $deliveryZone.set(readZone());
    });
  }
}

export function addToCart(slug: string, selection: Record<string, string>, quantity = 1): void {
  const id = lineId(slug, selection);
  const lines = $cart.get();
  const existing = lines.find((line) => line.id === id);
  if (existing) {
    $cart.set(
      lines.map((line) =>
        line.id === id
          ? { ...line, quantity: Math.min(MAX_QUANTITY, line.quantity + quantity) }
          : line,
      ),
    );
    return;
  }
  $cart.set([...lines, { id, slug, selection, quantity: Math.min(MAX_QUANTITY, quantity) }]);
}

export function setQuantity(id: string, quantity: number): void {
  if (quantity <= 0) {
    removeLine(id);
    return;
  }
  $cart.set(
    $cart
      .get()
      .map((line) => (line.id === id ? { ...line, quantity: Math.min(MAX_QUANTITY, quantity) } : line)),
  );
}

export function removeLine(id: string): void {
  $cart.set($cart.get().filter((line) => line.id !== id));
}

export function clearCart(): void {
  $cart.set([]);
}

export function openCart(): void {
  $cartOpen.set(true);
}

export function closeCart(): void {
  $cartOpen.set(false);
}

export function resolveLines(lines: CartLine[]): ResolvedLine[] {
  return lines.flatMap((line) => {
    const product = getProduct(line.slug);
    if (!product) return [];
    const unitPrice = priceForSelection(product, line.selection);
    return [{ ...line, product, unitPrice, lineTotal: unitPrice * line.quantity }];
  });
}

export const $lines = computed($cart, resolveLines);

export const $itemCount = computed($cart, (lines) =>
  lines.reduce((total, line) => total + line.quantity, 0),
);

export const $subtotal = computed($lines, (lines) =>
  lines.reduce((total, line) => total + line.lineTotal, 0),
);

export function zoneById(id: DeliveryZoneId): DeliveryZone {
  return deliveryZones.find((zone) => zone.id === id) ?? deliveryZones[0];
}

export function deliveryFee(zone: DeliveryZone, subtotal: number): number {
  if (subtotal === 0) return 0;
  if (zone.freeOver !== null && subtotal >= zone.freeOver) return 0;
  return zone.fee;
}

export interface CartTotals {
  subtotal: number;
  delivery: number;
  total: number;
  /** GST is shown as included, matching the way NZ retail prices are displayed. */
  gstIncluded: number;
  zone: DeliveryZone;
  freeDeliveryShortfall: number | null;
}

export function totalsFor(subtotal: number, zoneId: DeliveryZoneId): CartTotals {
  const zone = zoneById(zoneId);
  const delivery = deliveryFee(zone, subtotal);
  const total = subtotal + delivery;
  const shortfall =
    zone.freeOver !== null && subtotal > 0 && subtotal < zone.freeOver
      ? zone.freeOver - subtotal
      : null;
  return {
    subtotal,
    delivery,
    total,
    gstIncluded: Math.round((total - total / 1.15) * 100) / 100,
    zone,
    freeDeliveryShortfall: shortfall,
  };
}
