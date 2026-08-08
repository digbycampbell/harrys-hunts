import { expect, test } from '@playwright/test';

/**
 * Route and base-path coverage.
 *
 * The suite runs against the built site served under `/harrys-hunts/`, so these
 * assertions also prove the GitHub Pages deployment resolves correctly.
 */

const routes = [
  { path: '', heading: /the country sets/i },
  { path: 'journeys/', heading: /.+/ },
  { path: 'journeys/volcanic-plateau-roar/', heading: /volcanic plateau roar/i },
  { path: 'journeys/kaweka-sika-line/', heading: /kaweka sika line/i },
  { path: 'journeys/alpine-tahr-traverse/', heading: /alpine tahr traverse/i },
  { path: 'journeys/braided-river-chamois/', heading: /braided river chamois/i },
  { path: 'journeys/high-country-first-season/', heading: /high country first season/i },
  { path: 'shop/', heading: /five things/i },
  { path: 'shop/wool-field-cap/', heading: /wool field cap/i },
  { path: 'shop/merino-quarter-zip/', heading: /merino quarter-zip/i },
  { path: 'shop/waxed-canvas-duffel/', heading: /waxed canvas duffel/i },
  { path: 'shop/enamel-camp-mug/', heading: /enamel camp mug/i },
  { path: 'shop/field-notebook/', heading: /field notebook/i },
  { path: 'cart/', heading: /.+/ },
  { path: 'checkout/', heading: /.+/ },
  { path: 'book/', heading: /tell us the week/i },
  { path: 'about/', heading: /.+/ },
];

test.describe('routes under the Pages base path', () => {
  for (const route of routes) {
    test(`deep link to /${route.path} renders`, async ({ page }) => {
      const response = await page.goto(route.path);
      expect(response?.status()).toBe(200);
      expect(page.url()).toContain('/harrys-hunts/');
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(route.heading);
    });
  }

  test('unknown paths return the styled 404 with a 404 status', async ({ page }) => {
    const response = await page.goto('journeys/there-is-no-such-journey/');
    expect(response?.status()).toBe(404);
    await expect(page.getByTestId('not-found')).toBeVisible();
    await expect(page.getByRole('link', { name: /journeys/i }).first()).toBeVisible();
  });

  test('every internal link and asset resolves under the base path', async ({ page }) => {
    await page.goto('');

    const badHrefs = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'))
        .map((anchor) => anchor.getAttribute('href') ?? '')
        .filter(
          (value) =>
            value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/harrys-hunts/'),
        ),
    );
    expect(badHrefs).toEqual([]);

    const badSrcs = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLImageElement>('img[src]'))
        .map((image) => image.getAttribute('src') ?? '')
        .filter((value) => value.startsWith('/') && !value.startsWith('/harrys-hunts/')),
    );
    expect(badSrcs).toEqual([]);
  });

  test('primary navigation reaches every top-level surface', async ({ page, isMobile }) => {
    // The inline nav collapses into the menu below 60rem; see the mobile suite.
    test.skip(Boolean(isMobile), 'desktop header only');
    await page.goto('');
    const header = page.getByTestId('site-header');

    await header.getByRole('link', { name: 'Journeys', exact: true }).click();
    await expect(page).toHaveURL(/\/harrys-hunts\/journeys\/$/);

    await header.getByRole('link', { name: 'Store', exact: true }).click();
    await expect(page).toHaveURL(/\/harrys-hunts\/shop\/$/);

    await header.getByRole('link', { name: /plan a journey/i }).click();
    await expect(page).toHaveURL(/\/harrys-hunts\/book\/$/);
  });

  test('no page scrolls sideways at the current viewport', async ({ page }) => {
    for (const route of [...routes.map((entry) => entry.path), 'nope/']) {
      await page.goto(route);
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth, `horizontal overflow on /${route}`).toBeLessThanOrEqual(clientWidth + 1);
    }
  });

  test('the footer reaches the demonstration explanation', async ({ page }) => {
    await page.goto('');
    await page.getByTestId('site-footer').getByRole('link', { name: /asset provenance/i }).click();
    await expect(page).toHaveURL(/\/harrys-hunts\/about\/#assets$/);
    await expect(page.locator('#assets')).toBeVisible();
  });

  test('each page carries a unique title, description and canonical URL', async ({ page }) => {
    const seen = new Set<string>();
    for (const route of ['', 'journeys/', 'shop/', 'book/', 'about/']) {
      await page.goto(route);
      const title = await page.title();
      expect(title).toContain("Harry's Hunts");
      expect(seen.has(title)).toBe(false);
      seen.add(title);

      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description?.length ?? 0).toBeGreaterThan(40);

      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toContain('/harrys-hunts/');
    }
  });
});

test.describe('mobile navigation', () => {
  test.skip(({ isMobile }) => !isMobile, 'covers the small-screen menu only');

  test('opens, navigates and closes', async ({ page }) => {
    await page.goto('');

    const toggle = page.getByTestId('menu-toggle');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    const nav = page.getByTestId('mobile-nav');
    await expect(nav).toBeVisible();
    await nav.getByRole('link', { name: 'Store', exact: true }).click();

    await expect(page).toHaveURL(/\/harrys-hunts\/shop\/$/);
    await expect(page.getByTestId('mobile-nav')).toBeHidden();
  });

  test('closes on Escape and returns focus to the toggle', async ({ page }) => {
    await page.goto('');
    const toggle = page.getByTestId('menu-toggle');
    await toggle.click();
    await expect(page.getByTestId('mobile-nav')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByTestId('mobile-nav')).toBeHidden();
    await expect(toggle).toBeFocused();
  });
});
