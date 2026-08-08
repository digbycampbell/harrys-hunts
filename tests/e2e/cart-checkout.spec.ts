import { expect, test, type Page } from '@playwright/test';

/**
 * The cart page and the checkout mockup, driven the way a shopper would.
 *
 * The seeded fixture writes the same `localStorage` shape the store writes, so
 * these specs start from a populated cart without re-walking the shop each time.
 */

const SEED = [
  {
    id: 'merino-quarter-zip--colour:charcoal|size:m',
    slug: 'merino-quarter-zip',
    selection: { colour: 'charcoal', size: 'm' },
    quantity: 2,
  },
  {
    id: 'enamel-camp-mug--set:single|size:350',
    slug: 'enamel-camp-mug',
    selection: { size: '350', set: 'single' },
    quantity: 1,
  },
];

/** Subtotal for SEED: 2 × $289 + 1 × $34. */
const SUBTOTAL = 612;

async function seedCart(page: Page, path: string) {
  await page.goto(path);
  await page.evaluate((lines) => {
    localStorage.setItem('hh-demo-cart-v1', JSON.stringify(lines));
  }, SEED);
  await page.goto(path);
}

async function completeCheckout(page: Page) {
  await page.getByTestId('input-name').fill('Harry Demo');
  await page.getByTestId('input-email').fill('harry@example.test');
  await page.getByTestId('checkout-next').click();

  await page.getByTestId('fill-demo-address').click();
  await page.getByTestId('checkout-next').click();

  await expect(page.getByTestId('payment-demo-panel')).toBeVisible();
  await page.getByTestId('input-acknowledge').check();
  await page.getByTestId('checkout-next').click();

  await expect(page.getByTestId('checkout-stage-review')).toBeVisible();
  await page.getByTestId('checkout-place-order').click();
}

test.describe('cart page', () => {
  test('shows an empty state before anything is added', async ({ page }) => {
    await page.goto('cart/');
    await expect(page.getByTestId('cart-empty')).toBeVisible();
    await expect(page.getByTestId('cart-empty-shop')).toBeVisible();
  });

  test('lists seeded lines with correct unit and line totals', async ({ page }) => {
    await seedCart(page, 'cart/');

    await expect(page.getByTestId('cart-lines').locator('> li')).toHaveCount(2);
    await expect(page.getByTestId('cart-line-merino-quarter-zip')).toContainText('Charcoal marle');
    await expect(page.getByTestId('cart-line-total-merino-quarter-zip')).toHaveText('$578.00');
    await expect(page.getByTestId('cart-line-total-enamel-camp-mug')).toHaveText('$34.00');
    await expect(page.getByTestId('cart-subtotal')).toHaveText(`$${SUBTOTAL}.00`);
  });

  test('quantity changes update the line and the totals', async ({ page }) => {
    await seedCart(page, 'cart/');

    await page
      .getByTestId('cart-qty-enamel-camp-mug')
      .getByRole('button', { name: /increase/i })
      .click();

    await expect(page.getByTestId('cart-line-total-enamel-camp-mug')).toHaveText('$68.00');
    await expect(page.getByTestId('cart-subtotal')).toHaveText('$646.00');
  });

  test('removing a line can be undone', async ({ page }) => {
    await seedCart(page, 'cart/');

    await page.getByTestId('cart-remove-enamel-camp-mug').click();
    await expect(page.getByTestId('cart-line-enamel-camp-mug')).toHaveCount(0);

    const undo = page.getByTestId('cart-undo');
    await expect(undo).toBeVisible();
    await page.getByTestId('cart-undo-button').click();

    await expect(page.getByTestId('cart-line-enamel-camp-mug')).toBeVisible();
    await expect(page.getByTestId('cart-subtotal')).toHaveText(`$${SUBTOTAL}.00`);
  });

  test('the delivery estimator changes the fee and the total', async ({ page }) => {
    await seedCart(page, 'cart/');

    // $612 clears the $250 free-delivery threshold for urban New Zealand.
    await expect(page.getByTestId('cart-delivery')).toHaveText(/included|free|\$0\.00/i);
    await expect(page.getByTestId('cart-total')).toHaveText(`$${SUBTOTAL}.00`);

    await page.getByTestId('cart-zone').selectOption('international');
    await expect(page.getByTestId('cart-delivery')).toHaveText('$58.00');
    await expect(page.getByTestId('cart-total')).toHaveText('$670.00');
    await expect(page.getByTestId('cart-zone-estimate')).toContainText('7–14 working days');
  });

  test('states that the cart is a demonstration', async ({ page }) => {
    await seedCart(page, 'cart/');
    await expect(page.getByTestId('cart-demo-notice')).toContainText(/demonstration/i);
  });
});

test.describe('checkout mockup', () => {
  test('an empty cart cannot reach the form', async ({ page }) => {
    await page.goto('checkout/');
    await expect(page.getByTestId('checkout-empty')).toBeVisible();
    await expect(page.getByTestId('checkout-stage-contact')).toHaveCount(0);
  });

  test('walks the stages through to a demonstration confirmation', async ({ page }) => {
    await seedCart(page, 'checkout/');
    await expect(page.getByTestId('checkout-stage-contact')).toBeVisible();

    await completeCheckout(page);

    const success = page.getByTestId('checkout-success');
    await expect(success).toBeVisible();
    await expect(page.getByTestId('checkout-reference')).toHaveText(/HH-DEMO-/);
    await expect(success).toContainText(/no order/i);
    await expect(success).toContainText(/no payment/i);

    // The confirmation keeps a snapshot of what was "ordered".
    await expect(page.getByTestId('success-line-merino-quarter-zip')).toBeVisible();
    await expect(page.getByTestId('success-total')).toHaveText(`$${SUBTOTAL}.00`);

    // …and the cart is emptied.
    await expect(page.getByTestId('cart-count')).toHaveText('0');
  });

  test('blocks an incomplete stage and points at the first problem', async ({ page }) => {
    await seedCart(page, 'checkout/');

    await page.getByTestId('checkout-next').click();

    await expect(page.getByTestId('checkout-error-summary')).toBeVisible();
    await expect(page.getByTestId('error-name')).toBeVisible();
    await expect(page.getByTestId('input-name')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByTestId('input-name')).toBeFocused();
    await expect(page.getByTestId('checkout-stage-contact')).toBeVisible();
  });

  test('rejects a malformed email', async ({ page }) => {
    await seedCart(page, 'checkout/');

    await page.getByTestId('input-name').fill('Harry Demo');
    await page.getByTestId('input-email').fill('nope');
    await page.getByTestId('checkout-next').click();

    await expect(page.getByTestId('error-email')).toBeVisible();
    await expect(page.getByTestId('checkout-stage-contact')).toBeVisible();

    await page.getByTestId('input-email').fill('harry@example.test');
    await page.getByTestId('checkout-next').click();
    await expect(page.getByTestId('checkout-stage-delivery')).toBeVisible();
  });

  test('the payment panel collects nothing and invites no card entry', async ({ page }) => {
    await seedCart(page, 'checkout/');

    await page.getByTestId('input-name').fill('Harry Demo');
    await page.getByTestId('input-email').fill('harry@example.test');
    await page.getByTestId('checkout-next').click();
    await page.getByTestId('fill-demo-address').click();
    await page.getByTestId('checkout-next').click();

    const panel = page.getByTestId('payment-demo-panel');
    await expect(panel).toBeVisible();
    await expect(page.getByTestId('payment-card-display')).toBeDisabled();
    await expect(page.getByTestId('payment-token-display')).toBeDisabled();
    await expect(panel).toContainText(/no payment/i);

    // Nothing anywhere on the page could take a real card or password.
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
    const editable = await page
      .locator('input:not([disabled]):not([type="checkbox"]):not([type="radio"])')
      .evaluateAll((inputs) =>
        inputs.map((input) => (input as HTMLInputElement).getAttribute('autocomplete') ?? ''),
      );
    expect(editable.some((value) => value.startsWith('cc-'))).toBe(false);
  });

  test('review can be edited and the change is reflected back', async ({ page }) => {
    await seedCart(page, 'checkout/');

    await page.getByTestId('input-name').fill('Harry Demo');
    await page.getByTestId('input-email').fill('harry@example.test');
    await page.getByTestId('checkout-next').click();
    await page.getByTestId('fill-demo-address').click();
    await page.getByTestId('checkout-next').click();
    await page.getByTestId('input-acknowledge').check();
    await page.getByTestId('checkout-next').click();

    await expect(page.getByTestId('review-contact')).toContainText('Harry Demo');
    await page.getByTestId('edit-contact').click();

    await expect(page.getByTestId('checkout-stage-contact')).toBeVisible();
    await page.getByTestId('input-name').fill('Another Demo');
    await page.getByTestId('checkout-next').click();
    await page.getByTestId('checkout-next').click();
    await page.getByTestId('checkout-next').click();

    await expect(page.getByTestId('review-contact')).toContainText('Another Demo');
  });

  test('back returns to the previous stage with answers intact', async ({ page }) => {
    await seedCart(page, 'checkout/');

    await page.getByTestId('input-name').fill('Harry Demo');
    await page.getByTestId('input-email').fill('harry@example.test');
    await page.getByTestId('checkout-next').click();
    await expect(page.getByTestId('checkout-stage-delivery')).toBeVisible();

    await page.getByTestId('checkout-back').click();
    await expect(page.getByTestId('checkout-stage-contact')).toBeVisible();
    await expect(page.getByTestId('input-name')).toHaveValue('Harry Demo');
  });

  test('the delivery zone chosen in the cart carries into checkout', async ({ page }) => {
    await seedCart(page, 'cart/');
    // Australia is free over $450, so pick the zone that always carries a fee.
    await page.getByTestId('cart-zone').selectOption('international');
    await expect(page.getByTestId('cart-total')).toHaveText('$670.00');

    await page.getByTestId('cart-checkout').click();
    await expect(page.getByTestId('checkout-total')).toHaveText('$670.00');
  });

  test('makes no network request to any other origin', async ({ page }) => {
    const external: string[] = [];
    page.on('request', (request) => {
      if (!request.url().startsWith('http://127.0.0.1') && !request.url().startsWith('data:')) {
        external.push(request.url());
      }
    });

    await seedCart(page, 'checkout/');
    await completeCheckout(page);
    await expect(page.getByTestId('checkout-success')).toBeVisible();

    expect(external).toEqual([]);
  });
});
