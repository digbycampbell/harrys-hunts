import { useStore } from '@nanostores/preact';
import { useEffect, useState } from 'preact/hooks';
import { $cartReady, hydrateCart } from './cart';

/**
 * True once this island has mounted and the cart has been read from storage.
 *
 * Islands hydrate independently, so readiness is tracked locally as well as in
 * the shared atom. Relying on the shared flag alone left an island stuck on its
 * loading skeleton if it re-mounted after the flag had already been consumed.
 */
export function useCartReady(): boolean {
  const shared = useStore($cartReady);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    hydrateCart();
    setMounted(true);
  }, []);

  return mounted || shared;
}
