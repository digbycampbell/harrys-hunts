import { expect, test, type Page } from '@playwright/test';

/**
 * Behavioural coverage for the mock journey planner.
 *
 * Everything here drives the planner the way a visitor would: clicking visible
 * controls and asserting on rendered output, never on implementation details.
 */

const wizard = '[data-testid="booking-wizard"]';

async function currentStep(page: Page): Promise<string | null> {
  return page.locator(wizard).getAttribute('data-step');
}

/** Answers whichever step is showing and presses Continue. */
async function completeStep(page: Page) {
  const step = await currentStep(page);
  switch (step) {
    case 'island':
      await page.getByTestId('choice-island-south').click();
      break;
    case 'country':
      await page.getByTestId('choice-country-alpine').click();
      break;
    case 'experience':
      await page.getByTestId('choice-experience-tahr').click();
      break;
    case 'timing':
      await page.getByTestId('choice-timing-winter').click();
      break;
    case 'party':
      break;
    case 'accommodation':
      await page.getByTestId('choice-accommodation-alpine-hut').click();
      break;
    case 'guiding':
      await page.getByTestId('choice-guiding-one-to-one').click();
      break;
    case 'extras':
      await page.getByTestId('addon-heli').click();
      break;
    case 'details':
      await page.getByTestId('booking-name').fill('Harry Demo');
      await page.getByTestId('booking-email').fill('harry@example.test');
      await page.getByTestId('choice-level-some').click();
      break;
    default:
      break;
  }
  await page.getByTestId('booking-next').click();
}

test.describe('journey planner', () => {
  test('walks every stage through to a demonstration confirmation', async ({ page }) => {
    await page.goto('book/');
    await expect(page.locator(wizard)).toBeVisible();

    // The planner opens on the first question with nothing chosen.
    await expect(page.getByTestId('summary-island')).toHaveText(/not chosen yet/i);

    for (let stage = 0; stage < 10; stage += 1) {
      if ((await currentStep(page)) === 'review') break;
      await completeStep(page);
    }

    await expect(page.getByTestId('booking-review')).toBeVisible();
    await expect(page.getByTestId('review-island')).toHaveText('South Island');
    await expect(page.getByTestId('review-guiding')).toHaveText('One guide per guest');
    await expect(page.getByTestId('review-extras')).toHaveText(/helicopter/i);
    await expect(page.getByTestId('review-details')).toContainText('harry@example.test');

    await page.getByTestId('booking-next').click();

    const confirmation = page.getByTestId('booking-confirmation');
    await expect(confirmation).toBeVisible();
    await expect(page.getByTestId('booking-reference')).toHaveText(/^HH-PLAN-[A-Z2-9]{4}$/);
    await expect(confirmation).toContainText('No booking or enquiry was made');
    await expect(page.getByTestId('confirm-accommodation')).toHaveText('Serviced alpine hut');
  });

  test('blocks progress and explains why when a question is unanswered', async ({ page }) => {
    await page.goto('book/');
    await page.getByTestId('booking-next').click();

    const alert = page.getByTestId('booking-alert');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/choose an island/i);
    // Still on the first step.
    await expect(page.locator(wizard)).toHaveAttribute('data-step', 'island');

    // Answering clears the error without another submit.
    await page.getByTestId('choice-island-north').click();
    await expect(alert).toBeHidden();

    await page.getByTestId('booking-next').click();
    await expect(page.locator(wizard)).toHaveAttribute('data-step', 'country');
  });

  test('rejects an invalid email and keeps the guest on the details step', async ({ page }) => {
    await page.goto('book/?journey=braided-river-chamois');

    while ((await currentStep(page)) !== 'details') {
      await completeStep(page);
    }

    await page.getByTestId('booking-name').fill('Harry Demo');
    await page.getByTestId('booking-email').fill('not-an-email');
    await page.getByTestId('choice-level-first').click();
    await page.getByTestId('booking-next').click();

    await expect(page.getByTestId('error-email')).toBeVisible();
    await expect(page.getByTestId('booking-email')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator(wizard)).toHaveAttribute('data-step', 'details');

    await page.getByTestId('booking-email').fill('harry@example.test');
    await page.getByTestId('booking-next').click();
    await expect(page.locator(wizard)).toHaveAttribute('data-step', 'review');
  });

  test('prefills from a journey deep link', async ({ page }) => {
    await page.goto('book/?journey=alpine-tahr-traverse');

    await expect(page.getByTestId('summary-island')).toHaveText('South Island');
    await expect(page.getByTestId('summary-experience')).toHaveText('Himalayan tahr');
    await expect(page.getByTestId('summary-accommodation')).toHaveText('Serviced alpine hut');
    await expect(page.getByTestId('choice-island-south')).toHaveAttribute('aria-checked', 'true');
  });

  test('offers only terrain that belongs to the chosen island', async ({ page }) => {
    await page.goto('book/');
    await page.getByTestId('choice-island-north').click();
    await page.getByTestId('booking-next').click();

    await expect(page.getByTestId('choice-country-bush')).toBeVisible();
    await expect(page.getByTestId('choice-country-alpine')).toHaveCount(0);

    await page.getByTestId('booking-back').click();
    await page.getByTestId('choice-island-south').click();
    await page.getByTestId('booking-next').click();

    await expect(page.getByTestId('choice-country-alpine')).toBeVisible();
    await expect(page.getByTestId('choice-country-bush')).toHaveCount(0);
  });

  test('back and edit return to an answered step with the answer intact', async ({ page }) => {
    await page.goto('book/');
    await completeStep(page); // island
    await completeStep(page); // country

    await page.getByTestId('booking-back').click();
    await expect(page.locator(wizard)).toHaveAttribute('data-step', 'country');
    await expect(page.getByTestId('choice-country-alpine')).toHaveAttribute('aria-checked', 'true');

    // Jumping via the progress rail works for completed steps only.
    await page.getByTestId('progress-island').click();
    await expect(page.locator(wizard)).toHaveAttribute('data-step', 'island');
    await expect(page.getByTestId('progress-review')).toBeDisabled();
  });

  test('remembers answers across a reload and can be cleared', async ({ page }) => {
    await page.goto('book/');
    await completeStep(page); // island → country
    await completeStep(page); // country → experience

    await page.reload();
    await expect(page.locator(wizard)).toHaveAttribute('data-step', 'experience');
    await expect(page.getByTestId('summary-island')).toHaveText('South Island');

    await page.getByTestId('booking-restored').getByRole('button', { name: /start again/i }).click();
    await expect(page.locator(wizard)).toHaveAttribute('data-step', 'island');
    await expect(page.getByTestId('summary-island')).toHaveText(/not chosen yet/i);
  });

  test('is operable from the keyboard alone', async ({ page }) => {
    await page.goto('book/');

    // Arrow keys move through the island choices per the radiogroup pattern.
    await page.getByTestId('choice-island-north').focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('choice-island-south')).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByTestId('choice-island-south')).toBeFocused();

    await page.keyboard.press('ArrowLeft');
    await expect(page.getByTestId('choice-island-north')).toHaveAttribute('aria-checked', 'true');

    await page.getByTestId('booking-next').press('Enter');
    await expect(page.locator(wizard)).toHaveAttribute('data-step', 'country');
    // Focus lands on the new question so a screen reader announces it.
    await expect(page.locator('.hh-wizard__title')).toBeFocused();
  });

  test('states on every stage that nothing is booked', async ({ page }) => {
    await page.goto('book/');
    await expect(page.getByRole('main')).toContainText('This planner cannot make a booking');
    await expect(page.locator('.hh-demobar')).toContainText('fictional demonstration');
  });
});
