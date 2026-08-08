/**
 * Header cart trigger. Reads the client-only cart store and opens the drawer.
 * Rendered with `client:load` so the badge is correct on first interaction.
 */
import { useStore } from '@nanostores/preact';
import { $itemCount, openCart } from '../lib/cart';
import { useCartReady } from '../lib/use-cart-ready';

export default function CartButton() {
  const count = useStore($itemCount);
  const ready = useCartReady();

  const label = ready
    ? count === 0
      ? 'Open cart, empty'
      : `Open cart, ${count} ${count === 1 ? 'item' : 'items'}`
    : 'Open cart';

  return (
    <button
      type="button"
      class="hh-carttrigger"
      onClick={openCart}
      aria-label={label}
      data-testid="cart-trigger"
    >
      <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" focusable="false">
        <path
          d="M4 7h16l-1.3 11.2a2 2 0 0 1-2 1.8H7.3a2 2 0 0 1-2-1.8L4 7Z"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linejoin="round"
        />
        <path
          d="M8.5 9.5V6.8a3.5 3.5 0 1 1 7 0v2.7"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
        />
      </svg>
      <span class="hh-carttrigger__text">Cart</span>
      <span
        class="hh-carttrigger__count"
        data-testid="cart-count"
        data-empty={count === 0 ? 'true' : 'false'}
      >
        {ready ? count : 0}
      </span>
    </button>
  );
}
