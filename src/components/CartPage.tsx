/**
 * Full-page cart island.
 *
 * Everything here reads and writes the client-only cart store in
 * `src/lib/cart.ts`. No request is made, no order exists and no money moves.
 * Removals are reversible: the removed line is held in component state with its
 * original position so "Undo" can put it back exactly where it was.
 */
import { useStore } from '@nanostores/preact';
import { useState } from 'preact/hooks';
import {
  $cart,
  $deliveryZone,
  $itemCount,
  $lines,
  $subtotal,
  deliveryZones,
  setQuantity,
  totalsFor,
  type CartLine,
  type DeliveryZoneId,
  type ResolvedLine,
} from '../lib/cart';
import { useCartReady } from '../lib/use-cart-ready';
import { describeSelection } from '../data/products';
import { formatMoneyPrecise } from '../lib/money';
import { href } from '../lib/paths';
import type { ThumbMap } from '../lib/thumbs';
import QuantityStepper from './QuantityStepper';

interface Removed {
  line: CartLine;
  index: number;
  name: string;
}

export default function CartPage({ thumbs }: { thumbs: ThumbMap }) {
  const ready = useCartReady();
  const lines = useStore($lines);
  const subtotal = useStore($subtotal);
  const count = useStore($itemCount);
  const zoneId = useStore($deliveryZone);
  const [removed, setRemoved] = useState<Removed | null>(null);

  const totals = totalsFor(subtotal, zoneId);

  function remove(line: ResolvedLine) {
    const current = $cart.get();
    const index = current.findIndex((entry) => entry.id === line.id);
    if (index < 0) return;
    setRemoved({
      index,
      name: line.product.name,
      line: {
        id: line.id,
        slug: line.slug,
        selection: line.selection,
        quantity: line.quantity,
      },
    });
    $cart.set(current.filter((entry) => entry.id !== line.id));
  }

  function undo() {
    if (!removed) return;
    const current = $cart.get();
    if (!current.some((entry) => entry.id === removed.line.id)) {
      const next = [...current];
      next.splice(Math.min(removed.index, next.length), 0, removed.line);
      $cart.set(next);
    }
    setRemoved(null);
  }

  if (!ready) {
    return (
      <div class="hh-cartpage" aria-busy="true" data-testid="cart-loading">
        <p class="hh-visually-hidden" role="status">
          Loading your cart
        </p>
        <div class="hh-cartpage__loading">
          <div class="hh-skeleton" style="height:7.5rem" />
          <div class="hh-skeleton" style="height:7.5rem" />
          <div class="hh-skeleton" style="height:16rem" />
        </div>
      </div>
    );
  }

  return (
    <div class="hh-cartpage">
      <div class="hh-undo" role="status" data-testid="cart-undo">
        {removed && (
          <>
            <span class="hh-undo__text">
              {removed.name} removed from the cart.
            </span>
            <span class="hh-undo__actions">
              <button
                type="button"
                class="hh-button hh-button--secondary hh-button--small"
                onClick={undo}
                data-testid="cart-undo-button"
              >
                Undo<span class="hh-visually-hidden"> removing {removed.name}</span>
              </button>
              <button
                type="button"
                class="hh-undo__dismiss"
                onClick={() => setRemoved(null)}
                data-testid="cart-undo-dismiss"
              >
                Dismiss<span class="hh-visually-hidden"> this message</span>
              </button>
            </span>
          </>
        )}
      </div>

      {lines.length === 0 ? (
        <div class="hh-emptystate" data-testid="cart-empty">
          <p class="hh-eyebrow">Nothing added</p>
          <h2 class="hh-emptystate__title">There is nothing in the cart yet</h2>
          <p class="hh-emptystate__body">
            Browse five fictional pieces in wool, merino, waxed canvas, enamel and paper. Add one
            to try the cart and checkout flow.
          </p>
          <a class="hh-button" href={href('/shop/')} data-testid="cart-empty-shop">
            Browse the field kit
          </a>
        </div>
      ) : (
        <div class="hh-cartlayout">
          <section class="hh-cartlayout__main" aria-labelledby="hh-cart-lines-title">
            <div class="hh-cartlines__head">
              <h2 id="hh-cart-lines-title" class="hh-cartlines__title">
                In the cart
              </h2>
              <p class="hh-cartlines__count" data-testid="cart-count">
                {count} {count === 1 ? 'item' : 'items'}
              </p>
            </div>

            <ul class="hh-cartlines" data-testid="cart-lines">
              {lines.map((line) => {
                const thumb = thumbs[line.slug];
                return (
                  <li
                    class="hh-cartline hh-cartline--roomy"
                    key={line.id}
                    data-testid={`cart-line-${line.slug}`}
                  >
                    {thumb && (
                      <img
                        class="hh-cartline__image"
                        src={thumb.src}
                        width={thumb.width}
                        height={thumb.height}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                    <div class="hh-cartline__detail">
                      <a class="hh-cartline__name" href={href(`/shop/${line.slug}/`)}>
                        {line.product.name}
                      </a>
                      <p class="hh-cartline__options">
                        {describeSelection(line.product, line.selection)}
                      </p>
                      <p class="hh-cartline__unit" data-testid={`cart-line-unit-${line.slug}`}>
                        {formatMoneyPrecise(line.unitPrice)} each
                      </p>
                      <div class="hh-cartline__controls">
                        <QuantityStepper
                          value={line.quantity}
                          label={line.product.name}
                          allowZero
                          testId={`cart-qty-${line.slug}`}
                          onChange={(next) =>
                            next <= 0 ? remove(line) : setQuantity(line.id, next)
                          }
                        />
                        <button
                          type="button"
                          class="hh-cartline__remove"
                          onClick={() => remove(line)}
                          data-testid={`cart-remove-${line.slug}`}
                        >
                          Remove<span class="hh-visually-hidden"> {line.product.name}</span>
                        </button>
                      </div>
                    </div>
                    <p
                      class="hh-cartline__price hh-num"
                      data-testid={`cart-line-total-${line.slug}`}
                    >
                      {formatMoneyPrecise(line.lineTotal)}
                    </p>
                  </li>
                );
              })}
            </ul>

            <p class="hh-cartlines__foot">
              <a class="hh-link" href={href('/shop/')} data-testid="cart-continue">
                Continue browsing the store
              </a>
            </p>
          </section>

          <aside
            class="hh-summary"
            aria-labelledby="hh-cart-summary-title"
            data-testid="cart-summary"
          >
            <div class="hh-summary__inner">
              <h2 id="hh-cart-summary-title" class="hh-summary__title">
                Order summary
              </h2>

              <div class="hh-field hh-summary__zone">
                <label class="hh-label" for="hh-cart-zone">
                  Delivery estimate
                </label>
                <select
                  class="hh-select"
                  id="hh-cart-zone"
                  value={zoneId}
                  data-testid="cart-zone"
                  onChange={(event) =>
                    $deliveryZone.set(
                      (event.currentTarget as HTMLSelectElement).value as DeliveryZoneId,
                    )
                  }
                >
                  {deliveryZones.map((zone) => (
                    <option value={zone.id} key={zone.id}>
                      {zone.label} — {zone.estimate}
                    </option>
                  ))}
                </select>
                <p class="hh-hint" data-testid="cart-zone-estimate">
                  Indicative delivery window: {totals.zone.estimate}. Nothing is actually dispatched.
                </p>
              </div>

              <dl class="hh-totals">
                <div class="hh-totals__row">
                  <dt>Subtotal</dt>
                  <dd class="hh-num" data-testid="cart-subtotal">
                    {formatMoneyPrecise(totals.subtotal)}
                  </dd>
                </div>
                <div class="hh-totals__row">
                  <dt>Delivery — {totals.zone.label}</dt>
                  <dd class="hh-num" data-testid="cart-delivery">
                    {totals.delivery === 0 ? 'Included' : formatMoneyPrecise(totals.delivery)}
                  </dd>
                </div>
                <div class="hh-totals__row hh-totals__row--grand">
                  <dt>Total</dt>
                  <dd class="hh-num" data-testid="cart-total">
                    {formatMoneyPrecise(totals.total)}
                  </dd>
                </div>
              </dl>

              {totals.freeDeliveryShortfall !== null && (
                <p class="hh-summary__shortfall" data-testid="cart-shortfall">
                  {formatMoneyPrecise(totals.freeDeliveryShortfall)} more and delivery to{' '}
                  {totals.zone.label} is included.
                </p>
              )}

              <p class="hh-summary__gst" data-testid="cart-gst">
                GST included: {formatMoneyPrecise(totals.gstIncluded)}
              </p>

              <div class="hh-summary__actions">
                <a
                  class="hh-button hh-button--block"
                  href={href('/checkout/')}
                  data-testid="cart-checkout"
                >
                  Try demo checkout
                </a>
                <a
                  class="hh-button hh-button--secondary hh-button--block"
                  href={href('/shop/')}
                  data-testid="cart-continue-button"
                >
                  Continue browsing
                </a>
              </div>

              <p class="hh-notice" data-testid="cart-demo-notice">
                <span>
                  <strong>This cart is a demonstration.</strong> It is stored locally in this browser.
                  Nothing is reserved, ordered, charged or sent.
                </span>
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
