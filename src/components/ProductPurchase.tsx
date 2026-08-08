/**
 * Variant + quantity picker for a product page.
 *
 * Takes only the product slug and reads the catalogue client-side, so no image
 * metadata has to be serialised into the island payload. Adding to the cart
 * writes to `localStorage` and opens the drawer — no request is made.
 */
import { useStore } from '@nanostores/preact';
import { useEffect, useMemo, useState } from 'preact/hooks';
import {
  addToCart,
  deliveryZones,
  lineId,
  openCart,
  $cart,
} from '../lib/cart';
import { useCartReady } from '../lib/use-cart-ready';
import { defaultSelection, getProduct, priceForSelection } from '../data/products';
import { formatMoney } from '../lib/money';
import QuantityStepper from './QuantityStepper';

export default function ProductPurchase({ slug }: { slug: string }) {
  const product = getProduct(slug);
  const ready = useCartReady();
  const lines = useStore($cart);
  const [selection, setSelection] = useState<Record<string, string>>(() =>
    product ? defaultSelection(product) : {},
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState<string | null>(null);

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(null), 6000);
    return () => window.clearTimeout(timer);
  }, [added]);

  const price = useMemo(
    () => (product ? priceForSelection(product, selection) : 0),
    [product, selection],
  );

  if (!product) return null;

  const currentId = lineId(product.slug, selection);
  const inCart = lines.find((line) => line.id === currentId)?.quantity ?? 0;
  const freeOver = deliveryZones[0].freeOver ?? 0;

  function choose(groupId: string, valueId: string) {
    setSelection((current) => ({ ...current, [groupId]: valueId }));
    setAdded(null);
  }

  /** Arrow keys move between radios and select as they go, per the ARIA pattern. */
  function onGroupKeyDown(event: KeyboardEvent, groupId: string) {
    const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'];
    if (!keys.includes(event.key)) return;
    const group = product!.options.find((candidate) => candidate.id === groupId);
    if (!group) return;
    const selectable = group.values.filter((value) => !value.soldOut);
    if (selectable.length < 2) return;

    event.preventDefault();
    const index = selectable.findIndex((value) => value.id === selection[groupId]);
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
    const next = selectable[(index + step + selectable.length) % selectable.length];
    choose(groupId, next.id);
    const container = event.currentTarget as HTMLElement;
    container
      .querySelector<HTMLElement>(`[data-testid="option-${groupId}-${next.id}"]`)
      ?.focus();
  }

  function submit(event: Event) {
    event.preventDefault();
    addToCart(product!.slug, selection, quantity);
    setAdded(`${quantity} × ${product!.name} added to your demonstration cart.`);
    openCart();
  }

  return (
    <form class="hh-buy" onSubmit={submit} data-testid="product-purchase">
      <p class="hh-buy__price" data-testid="product-price">
        <span class="hh-price hh-num">{formatMoney(price)}</span>
        <span class="hh-buy__pricenote">NZD · indicative demo price</span>
      </p>

      {product.options.map((group) => {
        const legendId = `hh-opt-${group.id}`;
        const selectedValue = group.values.find((value) => value.id === selection[group.id]);
        return (
          <fieldset class="hh-buy__group" key={group.id}>
            <legend class="hh-buy__legend" id={legendId}>
              <span>{group.label}</span>
              <span class="hh-buy__selected">{selectedValue?.label}</span>
            </legend>
            <div
              class={`hh-buy__choices hh-buy__choices--${group.style}`}
              role="radiogroup"
              aria-labelledby={legendId}
              data-testid={`option-${group.id}`}
              onKeyDown={(event) => onGroupKeyDown(event as KeyboardEvent, group.id)}
            >
              {group.values.map((value) => {
                const checked = selection[group.id] === value.id;
                return (
                  <button
                    type="button"
                    key={value.id}
                    role="radio"
                    aria-checked={checked}
                    aria-disabled={value.soldOut ? 'true' : undefined}
                    disabled={value.soldOut}
                    tabIndex={checked ? 0 : -1}
                    class={`hh-buy__choice hh-buy__choice--${group.style}`}
                    data-testid={`option-${group.id}-${value.id}`}
                    onClick={() => !value.soldOut && choose(group.id, value.id)}
                  >
                    {group.style === 'swatch' && (
                      <span
                        class="hh-buy__swatch"
                        style={{ background: value.swatch }}
                        aria-hidden="true"
                      />
                    )}
                    <span>{value.label}</span>
                    {value.soldOut && <span class="hh-buy__soldout">Sold out</span>}
                    {!value.soldOut && value.priceDelta ? (
                      <span class="hh-buy__delta hh-num">
                        {value.priceDelta > 0 ? '+' : '−'}
                        {formatMoney(Math.abs(value.priceDelta))}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      <div class="hh-buy__actions">
        <QuantityStepper
          value={quantity}
          onChange={setQuantity}
          label={product.name}
          testId="product-quantity"
        />
        <button type="submit" class="hh-button hh-buy__add" data-testid="add-to-cart">
          Add to demo cart
        </button>
      </div>

      <p class="hh-buy__status" role="status" data-testid="add-status">
        {added ?? (ready && inCart > 0 ? `${inCart} already in your cart.` : '')}
      </p>

      <p class="hh-notice hh-buy__notice">
        <span>
          <strong>Nothing is sold here.</strong> Adding items updates a cart held only in this
          browser. Checkout ends in a demonstration confirmation with no payment and no order.
        </span>
      </p>

      <ul class="hh-buy__reassurance">
        <li>Complimentary urban New Zealand delivery over {formatMoney(freeOver)} (demo rate)</li>
        <li>Delivery estimate shown at the cart and checkout stages</li>
        <li>Fictional product — specifications are illustrative</li>
      </ul>
    </form>
  );
}
