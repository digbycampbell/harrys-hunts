/**
 * Dev-only screenshot helper: `node scripts/shot.mjs <path> [out.png] [width] [--viewport]`
 * Paths are relative to the running dev server's base path.
 */
import { chromium } from '@playwright/test';

const [, , route = '/', out = '/tmp/shot.png', width = '1440', mode] = process.argv;
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: Number(width), height: Number(width) > 700 ? 900 : 780 },
  // 1x keeps very tall full-page captures under Chrome's texture limit.
  deviceScaleFactor: 1,
});
const url = `http://localhost:4321/harrys-hunts${route}`;
await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
// Scroll the whole page so lazy images and the reveal observer settle.
await page.evaluate(async () => {
  document.documentElement.style.scrollBehavior = 'auto';
  const step = window.innerHeight * 0.8;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((resolve) => setTimeout(resolve, 60));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(600);
await page.screenshot({ path: out, fullPage: mode !== '--viewport' });
console.log(`${url} -> ${out}`);
await browser.close();
