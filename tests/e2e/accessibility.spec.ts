import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * Focused accessibility coverage.
 *
 * axe catches the mechanical failures; the hand-written checks below cover the
 * things axe cannot see — skip link, focus visibility, landmark structure,
 * heading order and reduced-motion behaviour.
 */

const pages = [
  { name: 'home', path: '' },
  { name: 'journey catalogue', path: 'journeys/' },
  { name: 'journey detail', path: 'journeys/alpine-tahr-traverse/' },
  { name: 'store', path: 'shop/' },
  { name: 'product', path: 'shop/merino-quarter-zip/' },
  { name: 'cart', path: 'cart/' },
  { name: 'checkout', path: 'checkout/' },
  { name: 'planner', path: 'book/' },
  { name: 'about', path: 'about/' },
];

async function analyse(page: Page) {
  return new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
}

test.describe('accessibility', () => {
  for (const entry of pages) {
    test(`${entry.name} has no axe violations`, async ({ page }) => {
      await page.goto(entry.path);
      const results = await analyse(page);
      expect(
        results.violations.map((violation) => ({
          id: violation.id,
          nodes: violation.nodes.map((node) => node.target.join(' ')),
        })),
      ).toEqual([]);
    });
  }

  test('the open cart drawer has no axe violations', async ({ page }) => {
    await page.goto('shop/enamel-camp-mug/');
    await page.getByTestId('add-to-cart').click();
    await expect(page.getByTestId('cart-drawer')).toBeVisible();

    const results = await analyse(page);
    expect(results.violations.map((violation) => violation.id)).toEqual([]);
  });

  test('the planner review step has no axe violations', async ({ page }) => {
    await page.goto('book/?journey=high-country-first-season');

    for (let stage = 0; stage < 10; stage += 1) {
      const step = await page.locator('[data-testid="booking-wizard"]').getAttribute('data-step');
      if (step === 'review') break;
      if (step === 'details') {
        await page.getByTestId('booking-name').fill('Harry Demo');
        await page.getByTestId('booking-email').fill('harry@example.test');
        await page.getByTestId('choice-level-first').click();
      }
      await page.getByTestId('booking-next').click();
    }

    await expect(page.getByTestId('booking-review')).toBeVisible();
    const results = await analyse(page);
    expect(results.violations.map((violation) => violation.id)).toEqual([]);
  });

  test('the skip link is the first stop and jumps to the main landmark', async ({ page }) => {
    await page.goto('');
    await page.keyboard.press('Tab');

    const skip = page.getByRole('link', { name: /skip to content/i });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();

    await page.keyboard.press('Enter');
    await expect(page.locator('#main')).toBeFocused();
  });

  test('every page exposes the expected landmarks and exactly one h1', async ({ page }) => {
    for (const entry of pages) {
      await page.goto(entry.path);
      await expect(page.getByRole('banner')).toHaveCount(1);
      await expect(page.getByRole('main')).toHaveCount(1);
      await expect(page.getByRole('contentinfo')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveCount(1);
    }
  });

  test('heading levels never skip a rank', async ({ page }) => {
    for (const entry of pages) {
      await page.goto(entry.path);
      const levels = await page.evaluate(() =>
        Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((heading) =>
          Number(heading.tagName.slice(1)),
        ),
      );
      let previous = 0;
      for (const level of levels) {
        if (previous !== 0) expect(level - previous).toBeLessThanOrEqual(1);
        previous = level;
      }
    }
  });

  test('keyboard focus is visibly indicated on primary controls', async ({ page }) => {
    await page.goto('shop/');
    // The cart trigger is in the header at every breakpoint. Real keyboard
    // presses are what trigger :focus-visible, so tab to it rather than
    // focusing programmatically.
    const control = page.getByTestId('cart-trigger');
    for (let presses = 0; presses < 30; presses += 1) {
      await page.keyboard.press('Tab');
      if (await control.evaluate((element) => element === document.activeElement)) break;
    }
    await expect(control).toBeFocused();

    const outline = await control.evaluate((element) => {
      const styles = getComputedStyle(element);
      return { width: styles.outlineWidth, style: styles.outlineStyle };
    });
    expect(outline.style).not.toBe('none');
    expect(Number.parseFloat(outline.width)).toBeGreaterThan(0);
  });

  test('reduced-motion visitors still see every section', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(new URL('', test.info().project.use.baseURL).href);

    // The reveal opt-in must stay off, so no content depends on the observer.
    await expect(page.locator('html')).not.toHaveAttribute('data-reveal', 'on');
    const hidden = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.hh-reveal')).filter(
        (element) => Number(getComputedStyle(element).opacity) < 1,
      ).length,
    );
    expect(hidden).toBe(0);
    await context.close();
  });

  test('content is readable and visible with JavaScript disabled', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(new URL('', test.info().project.use.baseURL).href);

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // Sections below the fold must not depend on the reveal observer.
    await expect(page.getByRole('heading', { name: /four things we will not trade/i })).toBeVisible();
    await expect(page.getByTestId('site-footer')).toContainText('This is a demonstration');
    await context.close();
  });
});
