# Asset provenance

Everything in this directory belongs to a **fictional demonstration brand**.
Harry's Hunts is not a real company, and none of these images depict a real operator, property, guide or guest.

## Generated originals — `generated/`

These three files were **generated with AI specifically for this demonstration**.
They were produced as design inputs for a fictional New Zealand field-journeys brand and are not photographs of real places, people or products.

| File                              | Role                                                                        |
| --------------------------------- | --------------------------------------------------------------------------- |
| `brand-concept-board.png`         | Brand concept board: monogram study, lockup study and palette swatches.       |
| `hero-south-island-ridgeline.png` | Wide South Island landscape used as the home-page hero.                       |
| `merchandise-concept-board.png`   | Merchandise concept sheet: cap, quarter-zip, duffel, mug, notebook, swatches. |

The originals are tracked here unmodified.
The copies outside this repository are left in place and are not referenced by the build.

## Derived images — `products/` and `scenes/`

Both concept boards are single composite sheets, so the site cannot use them directly for individual product tiles or journey cards.
`scripts/derive-images.mjs` crops them into per-subject images:

- `products/` — one tile per product plus detail and material-swatch crops, taken from `merchandise-concept-board.png`.
- `scenes/` — five visually distinct landscape crops taken from `hero-south-island-ridgeline.png`, so each journey card has its own view rather than five copies of one frame.

Re-run `node scripts/derive-images.mjs` after changing a source board.
The script also writes `public/apple-touch-icon.png` and the social card `public/og-image.jpg`.

Astro's `astro:assets` pipeline generates the responsive derivatives (widths and modern formats) at build time from these files.

## The logo is not derived from the board

The brand board is a **design input only**.
The production logo, lockup and favicon are original code-native SVG:

- `src/components/BrandMark.astro` — the Southern Alps ridge, the interlocked HH monogram and the red-stag antler linework, drawn as SVG paths.
- `src/components/BrandLockup.astro` — the mark plus a live HTML wordmark.
- `public/favicon.svg` — a heavier-weight redraw of the monogram that survives at 16 px.

No part of the raster board is traced, embedded or used as the mark.

## Deliberately original

The brand direction is original.
It does not copy or imitate the marks, layouts, copy or trade dress of any existing company.
References to a broad "premium country" mood informed tone only.
