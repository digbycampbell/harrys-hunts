# Harry's Hunts — New Zealand Field Journeys

A demonstration website for a **fictional** premium hunting-tour company operating across New Zealand's North and South Islands.

**Live demo:** https://digbycampbell.github.io/harrys-hunts/

> [!IMPORTANT]
> Harry's Hunts is not a real company.
> No booking can be made, no order can be placed and no payment can be taken anywhere on this site.
> Every guide, lodge, journey, testimonial, product and price is invented.
> The interaction design is real; the business behind it is not.

## What this is

The point of the demo is to make the creative and commercial reach of AI-assisted product work tangible: a complete, opinionated brand and storefront — art direction, copy, design system, interaction design, accessibility and deployment — built end to end.

Three things are fully interactive:

- **A journey catalogue** — five fictional journeys across both islands, each with season, duration, terrain, party size, accommodation, fitness guidance and what is included.
- **A staged bespoke-booking planner** (`/book/`) — nine questions, live summary rail, validation, back-and-edit, keyboard operation, and a demonstration confirmation. It sends nothing.
- **A mock storefront** (`/shop/`) — five products with variants, a cart drawer, a cart page, a delivery estimator and a checkout mockup that ends in a demo success state. It charges nothing.

## What is deliberately not here

- No booking engine, availability check, enquiry endpoint or CRM.
- No commerce backend, payment processor or card entry. The checkout payment panel is a disabled, obviously fictional sandbox token.
- No analytics, tracking or third-party requests of any kind. The site makes no network calls beyond loading its own assets.
- No collection or transmission of payment details or identity documents. Cart and planner state live in `localStorage` on the visitor's own device and nowhere else.

Journey descriptions avoid real operator claims, specific access points or block names, binding prices, invented conservation claims and anything resembling legal advice.
Prices are labelled as indicative planning figures throughout.

## Stack

| Concern    | Choice                                                                          |
| ---------- | ------------------------------------------------------------------------------- |
| Framework  | [Astro](https://astro.build) 7, static output — no server required               |
| Interactivity | Preact islands ([`nanostores`](https://github.com/nanostores/nanostores) for shared cart state) |
| Styling    | Hand-written CSS with custom-property design tokens. No CSS framework.           |
| Images     | `astro:assets` + sharp, responsive `widths`/`sizes`, WebP derivatives            |
| Fonts      | Self-hosted variable fonts (Cormorant Garamond, Inter) via Fontsource            |
| Tests      | Playwright, plus `@axe-core/playwright` for accessibility                        |
| Hosting    | GitHub Pages via GitHub Actions                                                  |

Only five runtime dependencies, all of which earn their place. There is no client-side router, no state library beyond a 300-byte atom store, and no component kit.

## Local development

```bash
npm install
npm run dev      # http://localhost:4321/harrys-hunts/
```

The dev server serves the site under the same `/harrys-hunts/` base path as production, so links behave locally exactly as they will once deployed.

```bash
npm run build    # static output into dist/
npm run check    # astro check — TypeScript and template diagnostics
npm test         # Playwright: builds, serves dist/, runs the suite
```

`npm test` needs a browser once:

```bash
npx playwright install --with-deps chromium
```

## Tests

`tests/e2e/` covers public behaviour, driven through visible controls — never by reading implementation source.

| File                    | Covers                                                                                   |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| `booking.spec.ts`       | The full planner journey, validation and error recovery, island-dependent options, back/edit, persistence across reload, deep-link prefill, keyboard operation. |
| `shop.spec.ts`          | Browsing, variant pricing, sold-out states, add to cart, line merging, quantity and removal, persistence, drawer focus trap, gallery tabs. |
| `cart-checkout.spec.ts` | The cart page, delivery estimator, totals, and the staged checkout through to the demo confirmation — including that no order or payment is claimed. |
| `routing.spec.ts`       | Every route and deep link under the Pages base path, the 404 status and page, internal-link correctness, navigation, metadata. |
| `accessibility.spec.ts` | axe (WCAG 2.1 A/AA) on every page plus the open drawer and the planner review, skip link, landmarks, heading order, focus visibility, reduced-motion, and the no-JavaScript experience. |

Tests run against the **built** site served by `scripts/serve-dist.mjs`, which mirrors GitHub Pages: base-path-only routing, directory indexes, and `404.html` returned with a 404 status.
That means a passing suite also proves the deployment configuration is right.

Both a desktop and a mobile (Pixel 7) project run by default.

## Design tokens

All tokens live in `src/styles/tokens.css` as custom properties under an `--hh-` prefix.
Nothing in the codebase hardcodes a colour, size or duration.

**Palette** — deep forest green, warm bone, charcoal, weathered brass, muted tussock and waxed tan.
Semantic aliases (`--hh-ink`, `--hh-surface`, `--hh-line`, `--hh-focus`, …) sit on top of the raw ramps, and body-size text pairings clear WCAG AA on their surface.

**Type** — Cormorant Garamond for display, Inter for everything else, on a fluid `clamp()` scale from `--hh-step--2` to `--hh-step-6`.

**Also defined** — spacing, measure, radii, shadows, easing and durations, layer indices, and a `prefers-contrast: more` override.

Reduced motion is honoured globally: transitions and animations collapse, and the scroll-reveal effect is opt-in via a `data-reveal` flag that is only set when motion is wanted and `IntersectionObserver` exists — so content is never hidden behind an animation that might not run.

Island CSS (Preact components, which Astro's scoped styles cannot reach) lives in `src/styles/components.css`, `shop.css`, `checkout.css` and `booking.css`.

## Brand assets and provenance

The three source images were **generated with AI specifically for this fictional demonstration**: a brand concept board, a wide South Island landscape and a merchandise concept sheet.
They are tracked unmodified in `src/assets/generated/`.

`scripts/derive-images.mjs` crops those composite boards into the per-product tiles (`src/assets/products/`) and the five distinct journey scenes (`src/assets/scenes/`), and writes the touch icon and social card.

The **logo is not derived from the raster board**.
The mark, lockup and favicon are original code-native SVG — see `src/components/BrandMark.astro`, `src/components/BrandLockup.astro` and `public/favicon.svg`.
The board informed the idea (an interlocked HH monogram, a minimal Southern Alps ridge, red-stag antler linework); the production artwork is drawn in paths.

Full detail: [`src/assets/README.md`](src/assets/README.md).

The brand direction is original and does not copy or imitate the marks, layouts, copy or trade dress of any existing company.

## Deployment

`.github/workflows/deploy.yml` builds on every push to `main` and publishes `dist/` to GitHub Pages with `actions/deploy-pages`.
`.github/workflows/ci.yml` type-checks, builds and runs the full Playwright suite on pull requests and branch pushes.

The base path is configured once, in `astro.config.mjs`:

```js
site: 'https://digbycampbell.github.io',
base: '/harrys-hunts/',
```

Every internal link goes through `href()` in `src/lib/paths.ts`, so a rename of the repository needs one change in one file.

### One-time repository setting

The workflow uses the Pages **GitHub Actions** source, which cannot be enabled from within a pull request.
Before the first deploy, set:

> Settings → Pages → Build and deployment → **Source: GitHub Actions**

No other repository setting is required.

## Project layout

```
src/
  assets/          generated originals, derived product and scene images
  components/      Astro components and Preact islands
  data/            tours, products and booking options — all fictional
  layouts/         the page shell
  lib/             paths, money, cart state, build-time thumbnails
  pages/           routes
  styles/          tokens, global CSS, island CSS
scripts/           image derivation, dist server, screenshot helper
tests/e2e/         Playwright suites
```

## Licence

Code is provided for demonstration purposes.
The Harry's Hunts name, brand and all content are fictional and were created for this demonstration.
