/**
 * Slide-over cart. Modal dialog semantics with a focus trap, Escape to close,
 * and focus returned to whatever opened it.
 */
import { useStore } from '@nanostores/preact';
import { useEffect, useRef } from 'preact/hooks';
import {
  $cartOpen,
  $deliveryZone,
  $itemCount,
  $lines,
  $subtotal,
  closeCart,
  removeLine,
  setQuantity,
  totalsFor,
} from '../lib/cart';
import { useCartReady } from '../lib/use-cart-ready';
import { describeSelection } from '../data/products';
import { formatMoneyPrecise } from '../lib/money';
import { href } from '../lib/paths';
import type { ThumbMap } from '../lib/thumbs';
import QuantityStepper from './QuantityStepper';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function CartDrawer({ thumbs }: { thumbs: ThumbMap }) {
  const open = useStore($cartOpen);
  const ready = useCartReady();
  const lines = useStore($lines);
  const subtotal = useStore($subtotal);
  const count = useStore($itemCount);
  const zone = useStore($deliveryZone);
  const panelRef = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>('[data-autofocus]')?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeCart();
        return;
      }
      if (event.key !== 'Tab' || !panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null,
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      opener.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const totals = totalsFor(subtotal, zone);

  return (
    <div class="hh-drawer" data-testid="cart-drawer">
      <div class="hh-drawer__scrim" onClick={closeCart} data-testid="cart-scrim" />
      <div
        class="hh-drawer__panel hh-rise"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hh-drawer-title"
        ref={panelRef}
      >
        <header class="hh-drawer__head">
          <div>
            <p class="hh-eyebrow">Demonstration store</p>
            <h2 id="hh-drawer-title" class="hh-drawer__title">
              Cart{ready && count > 0 ? ` · ${count}` : ''}
            </h2>
          </div>
          <button
            type="button"
            class="hh-drawer__close"
            onClick={closeCart}
            data-autofocus
            aria-label="Close cart"
          >
            <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </header>

        <p class="hh-notice hh-drawer__notice">
          <span>
            <strong>Browser-only cart.</strong> Nothing is reserved, ordered, charged or sent.
          </span>
        </p>

        {!ready ? (
          <div class="hh-drawer__body" aria-busy="true">
            <p class="hh-visually-hidden">Loading your cart</p>
            <div class="hh-skeleton" style="height:5.5rem" />
            <div class="hh-skeleton" style="height:5.5rem; margin-top:1rem" />
          </div>
        ) : lines.length === 0 ? (
          <div class="hh-drawer__body hh-drawer__empty" data-testid="cart-empty">
            <p class="hh-drawer__emptytitle">Nothing here yet</p>
            <p class="hh-muted">
              The fictional field kit has five pieces. Add one to try the cart.
            </p>
            <a class="hh-button hh-button--secondary" href={href('/shop/')} onClick={closeCart}>
              Browse the store
            </a>
          </div>
        ) : (
          <ul class="hh-drawer__body hh-drawer__lines" data-testid="cart-lines">
            {lines.map((line) => {
              const thumb = thumbs[line.slug];
              return (
                <li class="hh-cartline" key={line.id} data-testid={`cart-line-${line.slug}`}>
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
                    <a class="hh-cartline__name" href={href(`/shop/${line.slug}/`)} onClick={closeCart}>
                      {line.product.name}
                    </a>
                    <p class="hh-cartline__options">
                      {describeSelection(line.product, line.selection)}
                    </p>
                    <div class="hh-cartline__controls">
                      <QuantityStepper
                        value={line.quantity}
                        label={line.product.name}
                        allowZero
                        compact
                        testId={`cart-qty-${line.slug}`}
                        onChange={(next) => setQuantity(line.id, next)}
                      />
                      <button
                        type="button"
                        class="hh-cartline__remove"
                        onClick={() => removeLine(line.id)}
                      >
                        Remove<span class="hh-visually-hidden"> {line.product.name}</span>
                      </button>
                    </div>
                  </div>
                  <p class="hh-cartline__price" data-testid={`cart-line-total-${line.slug}`}>
                    {formatMoneyPrecise(line.lineTotal)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}

        {ready && lines.length > 0 && (
          <footer class="hh-drawer__foot">
            <div class="hh-drawer__row">
              <span>Subtotal</span>
              <strong data-testid="cart-subtotal">{formatMoneyPrecise(totals.subtotal)}</strong>
            </div>
            <p class="hh-drawer__ship">
              {totals.freeDeliveryShortfall
                ? `${formatMoneyPrecise(totals.freeDeliveryShortfall)} from the included urban-delivery demo rate.`
                : 'Urban New Zealand delivery is included in this demonstration total.'}
            </p>
            <div class="hh-drawer__actions">
              <a class="hh-button hh-button--block" href={href('/checkout/')} onClick={closeCart}>
                Try demo checkout
              </a>
              <a
                class="hh-button hh-button--secondary hh-button--block"
                href={href('/cart/')}
                onClick={closeCart}
              >
                View full cart
              </a>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
