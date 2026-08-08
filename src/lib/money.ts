const nzd = new Intl.NumberFormat('en-NZ', {
  style: 'currency',
  currency: 'NZD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const nzdPrecise = new Intl.NumberFormat('en-NZ', {
  style: 'currency',
  currency: 'NZD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Whole-dollar NZD, e.g. `$289`. Demo figures only — nothing is ever charged. */
export function formatMoney(amount: number): string {
  return nzd.format(amount);
}

/** Two-decimal NZD, used in cart and checkout totals. */
export function formatMoneyPrecise(amount: number): string {
  return nzdPrecise.format(amount);
}
