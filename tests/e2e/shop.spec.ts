import { expect, test } from '@playwright/test';

/**
 * Behavioural coverage for the mock storefront: browsing, variants, the cart
 * drawer and persistence. Everything is driven through visible controls.
 */

test.describe('storefront', () => {
  test('lists every collection and links through to a product', async ({ page }) => {
    await page.goto('shop/');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Five things');
    await expect(page.getByTestId('collection-grid-field-wear')).toBeVisible();
    await expect(page.getByTestId('collection-grid-carry')).toBeVisible();
    await expect(page.getByTestId('collection-grid-camp')).toBeVisible();

    await expect(page.getByTestId('product-card-wool-field-cap')).toBeVisible();
    await page
      .getByTestId('product-card-merino-quarter-zip')
      .getByRole('link', { name: /merino quarter-zip/i })
      .click();

    await expect(page).toHaveURL(/\/harrys-hunts\/shop\/merino-quarter-zip\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Merino Quarter-Zip');
  });

  test('updates the price when a variant with a surcharge is chosen', async ({ page }) => {
    await page.goto('shop/enamel-camp-mug/');

    await expect(page.getByTestId('product-price')).toContainText('$34');

    await page.getByTestId('option-size-500').click();
    await expect(page.getByTestId('product-price')).toContainText('$40');

    await page.getByTestId('option-set-pair').click();
    await expect(page.getByTestId('product-price')).toContainText('$68');

    await page.getByTestId('option-size-350').click();
    await expect(page.getByTestId('product-price')).toContainText('$62');
  });

  test('prevents choosing a sold-out variant', async ({ page }) => {
    await page.goto('shop/merino-quarter-zip/');

    const soldOut = page.getByTestId('option-size-xxl');
    await expect(soldOut).toBeDisabled();
    await expect(soldOut).toContainText(/sold out/i);

    await expect(page.getByTestId('option-size-m')).toHaveAttribute('aria-checked', 'true');
  });

  test('adds a product to the cart and opens the drawer with the right line', async ({ page }) => {
    await page.goto('shop/wool-field-cap/');

    await expect(page.getByTestId('cart-count')).toHaveText('0');

    await page.getByTestId('option-colour-tussock').click();
    await page.getByTestId('product-quantity').getByRole('button', { name: /increase/i }).click();
    await page.getByTestId('add-to-cart').click();

    const drawer = page.getByTestId('cart-drawer');
    await expect(drawer).toBeVisible();
    await expect(drawer.getByTestId('cart-line-wool-field-cap')).toContainText('Tussock');
    await expect(drawer.getByTestId('cart-line-total-wool-field-cap')).toHaveText('$158.00');
    await expect(page.getByTestId('cart-count')).toHaveText('2');
    await expect(drawer).toContainText(/nothing is reserved, charged or sent/i);
  });

  test('merges repeat adds of the same variant and separates different ones', async ({ page }) => {
    await page.goto('shop/wool-field-cap/');

    await page.getByTestId('add-to-cart').click();
    await page.getByTestId('cart-drawer').getByRole('button', { name: /close cart/i }).click();

    await page.getByTestId('add-to-cart').click();
    await expect(page.getByTestId('cart-lines').locator('> li')).toHaveCount(1);
    await expect(page.getByTestId('cart-count')).toHaveText('2');

    await page.getByTestId('cart-drawer').getByRole('button', { name: /close cart/i }).click();
    await page.getByTestId('option-colour-charcoal').click();
    await page.getByTestId('add-to-cart').click();

    await expect(page.getByTestId('cart-lines').locator('> li')).toHaveCount(2);
    await expect(page.getByTestId('cart-count')).toHaveText('3');
  });

  test('changes quantity and removes a line from the drawer', async ({ page }) => {
    await page.goto('shop/field-notebook/');
    await page.getByTestId('add-to-cart').click();

    const drawer = page.getByTestId('cart-drawer');
    await drawer.getByTestId('cart-qty-field-notebook').getByRole('button', { name: /increase/i }).click();
    await expect(page.getByTestId('cart-count')).toHaveText('2');
    await expect(drawer.getByTestId('cart-line-total-field-notebook')).toHaveText('$84.00');

    await drawer.getByRole('button', { name: /remove field notebook/i }).click();
    await expect(page.getByTestId('cart-empty')).toBeVisible();
    await expect(page.getByTestId('cart-count')).toHaveText('0');
  });

  test('keeps the cart across a page load', async ({ page }) => {
    await page.goto('shop/enamel-camp-mug/');
    await page.getByTestId('add-to-cart').click();
    await expect(page.getByTestId('cart-count')).toHaveText('1');

    await page.goto('journeys/');
    await expect(page.getByTestId('cart-count')).toHaveText('1');

    await page.getByTestId('cart-trigger').click();
    await expect(page.getByTestId('cart-line-enamel-camp-mug')).toBeVisible();
  });

  test('starts with an empty cart and says so', async ({ page }) => {
    await page.goto('shop/');
    await page.getByTestId('cart-trigger').click();

    const empty = page.getByTestId('cart-empty');
    await expect(empty).toBeVisible();
    await expect(empty).toContainText(/nothing here yet/i);
  });

  test('drawer traps focus, closes on Escape and restores focus', async ({ page }) => {
    await page.goto('shop/');

    const trigger = page.getByTestId('cart-trigger');
    await trigger.click();
    await expect(page.getByTestId('cart-drawer')).toBeVisible();

    // Focus starts inside the dialog.
    await expect(page.getByRole('button', { name: /close cart/i })).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(page.getByTestId('cart-drawer')).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('closes the drawer when the scrim is clicked', async ({ page, isMobile }) => {
    // The drawer is full-width on small screens, so no scrim is exposed.
    test.skip(Boolean(isMobile), 'desktop drawer only');
    await page.goto('shop/');
    await page.getByTestId('cart-trigger').click();
    await page.getByTestId('cart-scrim').click({ position: { x: 10, y: 10 } });
    await expect(page.getByTestId('cart-drawer')).toBeHidden();
  });

  test('product gallery switches images without a page load', async ({ page }) => {
    await page.goto('shop/waxed-canvas-duffel/');

    const gallery = page.getByTestId('product-gallery');
    const firstTab = gallery.getByTestId('gallery-thumb-0');
    const secondTab = gallery.getByTestId('gallery-thumb-1');

    await expect(firstTab).toHaveAttribute('aria-selected', 'true');
    await secondTab.click();
    await expect(secondTab).toHaveAttribute('aria-selected', 'true');
    await expect(firstTab).toHaveAttribute('aria-selected', 'false');

    // Arrow keys move along the tablist.
    await secondTab.press('ArrowLeft');
    await expect(firstTab).toHaveAttribute('aria-selected', 'true');
    await expect(firstTab).toBeFocused();
  });

  test('states on the product page that nothing is sold', async ({ page }) => {
    await page.goto('shop/waxed-canvas-duffel/');
    await expect(page.getByTestId('product-purchase')).toContainText(/nothing is sold here/i);
    await expect(page.getByRole('main')).toContainText(/fictional product/i);
  });
});
