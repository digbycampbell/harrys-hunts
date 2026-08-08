# Harry's Hunts — agent notes

## What this project is

A demonstration website for a **fictional** New Zealand hunting-tour company.
Read [`README.md`](README.md) first — it covers the stack, commands, design tokens and deployment.

Two constraints override everything else and must never be relaxed:

1. **Nothing may become real.** No network calls, no commerce or booking backend, no payment processing, no card or identity inputs, no analytics. Cart and planner state live in `localStorage` and nowhere else.
2. **Every surface must say it is a demonstration.** If you add a page or an interactive flow, it needs a demo notice; the confirmation states must say plainly that no order, booking or payment was made.

Content rules: no graphic hunting imagery, no dead animals or trophy poses, no invented conservation claims, no real operator claims, no specific access points or block names, no binding prices (figures are "indicative"), no legal advice.

## Conventions that are easy to get wrong

- **Base path.** The site is served from `/harrys-hunts/`. Every internal link goes through `href()` in `src/lib/paths.ts`. Never hand-write a leading-slash path.
- **Design tokens only.** Colours, spacing, type, radii, shadows, easing all come from `src/styles/tokens.css` as `--hh-*` custom properties. Nothing hardcodes a value.
- **Island CSS is global.** Astro's scoped `<style>` cannot reach Preact components, so their styles live in `src/styles/{components,shop,checkout,booking}.css`, all imported by `global.css`.
- **Images in fixed-ratio frames.** Give the frame `position: relative` + `aspect-ratio`, and the `<img>` `position: absolute; inset: 0; width: 100%; height: 100%`. `inset: 0` alone does **not** stretch a replaced element — with `width: auto` the image falls back to its intrinsic size. Use `padding` on the `<img>`, not `inset`, to inset a `contain` image.
- **Scroll reveal is opt-in.** `.hh-reveal` only hides content when `<html data-reveal="on">`, which the head script in `Base.astro` sets only when `IntersectionObserver` exists and motion is wanted. Never write CSS that hides content unconditionally pending JavaScript.
- **Server-only helpers.** `src/lib/thumbs.ts` uses `astro:assets`; call it from `.astro` frontmatter and pass plain descriptors into islands as props.

## Working on this repo

- Dev server: `npm run dev` (Astro 7 daemonises it; manage with `astro dev stop|status|logs`). If islands fail to hydrate with a 504 "Outdated Optimize Dep", stop the server, delete `node_modules/.vite` and `node_modules/.astro`, and restart. Regenerating images also needs that restart before they appear.
- `npm test` builds the site and serves `dist/` with `scripts/serve-dist.mjs`, which mirrors GitHub Pages. Tests must drive visible controls, never grep source.
- Image derivation is a committed artefact: change `scripts/derive-images.mjs` and re-run it rather than editing files in `src/assets/products` or `src/assets/scenes` by hand. Provenance lives in [`src/assets/README.md`](src/assets/README.md).
- Verify UI changes by looking at them: `node scripts/shot.mjs <route> <out.png> <width>` against the running dev server, then read the PNG. Check 390px as well as desktop.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
