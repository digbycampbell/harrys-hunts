/**
 * Derives the site's art-directed image set from the two AI-generated composite
 * boards:
 *
 *   - the merchandise concept sheet, cropped to one subject per product tile
 *   - the wide South Island hero, cropped to distinct scenes so each journey
 *     card has its own view rather than five copies of the same frame
 *
 * Outputs are committed (src/assets/products, src/assets/scenes) so the normal
 * build needs no image surgery; re-run this only when a source board changes.
 *
 *   node scripts/derive-images.mjs
 */
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'src/assets/generated/merchandise-concept-board.png');
const outDir = path.join(root, 'src/assets/products');

/** [left, top, width, height] against the 1024x1536 source board. */
const crops = {
  'field-cap': [425, 25, 345, 370],
  'field-cap-detail': [760, 45, 255, 175],
  'quarter-zip': [75, 345, 445, 370],
  'quarter-zip-detail': [560, 385, 250, 330],
  duffel: [55, 775, 615, 285],
  'duffel-detail': [455, 1300, 300, 225],
  'duffel-hardware': [762, 1300, 262, 225],
  'enamel-mug': [35, 1060, 280, 230],
  'enamel-mug-detail': [300, 1120, 130, 130],
  notebook: [445, 1050, 225, 250],
  'notebook-detail': [665, 1075, 150, 185],
  'wool-swatch': [792, 252, 176, 94],
  'merino-swatch': [828, 528, 178, 152],
  'canvas-swatch': [820, 848, 186, 132],
};

await mkdir(outDir, { recursive: true });

for (const [name, [left, top, width, height]] of Object.entries(crops)) {
  const target = path.join(outDir, `${name}.png`);
  await sharp(source)
    .extract({ left, top, width, height })
    .resize({ width: Math.min(width * 2, 1200), withoutEnlargement: false })
    .png({ compressionLevel: 9, quality: 90 })
    .toFile(target);
  console.log(`wrote ${path.relative(root, target)}`);
}

/* ------------------------------------------------------------------ scenes */

const heroSource = path.join(root, 'src/assets/generated/hero-south-island-ridgeline.png');
const sceneDir = path.join(root, 'src/assets/scenes');

/**
 * [left, top, width, height] against the 1672x941 hero frame.
 *
 * Regions are taken as wide as the frame allows, because these crops also back
 * the full-bleed journey-detail heroes. They are then resampled up to 1600px so
 * a 1440px viewport is covered; the source is a smooth AI render sitting behind
 * a scrim, so the modest upscale is not visible in place.
 */
const scenes = {
  'snowline-peaks': [0, 0, 1080, 610],
  'braided-river': [0, 400, 1100, 541],
  'tussock-ridge': [700, 340, 972, 601],
  'valley-dawn': [780, 90, 892, 651],
  'cloud-inversion': [120, 40, 1160, 620],
};

await mkdir(sceneDir, { recursive: true });

for (const [name, [left, top, width, height]] of Object.entries(scenes)) {
  const target = path.join(sceneDir, `${name}.jpg`);
  await sharp(heroSource)
    .extract({ left, top, width, height })
    .resize({ width: 1600, kernel: 'lanczos3' })
    .sharpen({ sigma: 0.7 })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(target);
  console.log(`wrote ${path.relative(root, target)}`);
}

/* ------------------------------------------------------- icons and og image */

const publicDir = path.join(root, 'public');

await sharp(path.join(publicDir, 'favicon.svg'))
  .resize(180, 180)
  .png({ compressionLevel: 9 })
  .toFile(path.join(publicDir, 'apple-touch-icon.png'));
console.log('wrote public/apple-touch-icon.png');

// Social card: the horizontal lockup band from the generated brand board.
await sharp(path.join(root, 'src/assets/generated/brand-concept-board.png'))
  .extract({ left: 60, top: 700, width: 1282, height: 280 })
  .resize(1200, 630, { fit: 'contain', background: '#f6f2ea' })
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(path.join(publicDir, 'og-image.jpg'));
console.log('wrote public/og-image.jpg');
