import { defineConfig, devices } from '@playwright/test';

/**
 * Tests run against the built, previewed site rather than the dev server, so
 * every assertion also proves the GitHub Pages base path is wired correctly.
 *
 * `baseURL` includes the base path. Use RELATIVE paths in tests
 * (`page.goto('journeys/')`), never a leading slash — a leading slash would
 * resolve to the server root and skip the base path.
 */
const PORT = 4322;
const BASE_URL = `http://127.0.0.1:${PORT}/harrys-hunts/`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  timeout: 30_000,
  expect: { timeout: 7_000 },

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],

  webServer: {
    command: `npm run build && node scripts/serve-dist.mjs ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
