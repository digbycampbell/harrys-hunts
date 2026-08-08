/**
 * Fictional merchandise catalogue for the demonstration storefront.
 *
 * Prices are indicative demo figures in NZD and are never charged: checkout is
 * a mockup with no payment processing and no backend. See src/lib/cart.ts.
 */
import type { ImageMetadata } from 'astro';

import fieldCap from '../assets/products/field-cap.png';
import fieldCapDetail from '../assets/products/field-cap-detail.png';
import quarterZip from '../assets/products/quarter-zip.png';
import quarterZipDetail from '../assets/products/quarter-zip-detail.png';
import duffel from '../assets/products/duffel.png';
import duffelDetail from '../assets/products/duffel-detail.png';
import duffelHardware from '../assets/products/duffel-hardware.png';
import enamelMug from '../assets/products/enamel-mug.png';
import enamelMugDetail from '../assets/products/enamel-mug-detail.png';
import notebook from '../assets/products/notebook.png';
import notebookDetail from '../assets/products/notebook-detail.png';
import woolSwatch from '../assets/products/wool-swatch.png';
import merinoSwatch from '../assets/products/merino-swatch.png';
import canvasSwatch from '../assets/products/canvas-swatch.png';

export type CollectionId = 'field-wear' | 'carry' | 'camp';

export interface OptionValue {
  id: string;
  label: string;
  /** Added to the base price, in whole NZD. */
  priceDelta?: number;
  /** Marks a value as unavailable so the UI can show a real out-of-stock state. */
  soldOut?: boolean;
  swatch?: string;
}

export interface OptionGroup {
  id: string;
  label: string;
  /** `swatch` renders colour chips; `pill` renders labelled buttons. */
  style: 'swatch' | 'pill';
  /** Preselected value id; falls back to the first available value. */
  defaultValue?: string;
  values: OptionValue[];
}

export interface ProductImage {
  src: ImageMetadata;
  alt: string;
}

export interface Product {
  slug: string;
  name: string;
  collection: CollectionId;
  tagline: string;
  /** Base price in whole NZD. */
  price: number;
  summary: string;
  description: string[];
  specs: { label: string; value: string }[];
  care: string;
  options: OptionGroup[];
  images: ProductImage[];
  /** Grams, used by the delivery estimator. */
  weight: number;
  badge?: string;
  featured?: boolean;
}

export const collections: { id: CollectionId; name: string; blurb: string }[] = [
  {
    id: 'field-wear',
    name: 'Field wear',
    blurb: 'Wool and merino built for cold mornings and long sits.',
  },
  {
    id: 'carry',
    name: 'Carry',
    blurb: 'Waxed canvas and vegetable-tanned leather that ages instead of wearing out.',
  },
  {
    id: 'camp',
    name: 'Camp and desk',
    blurb: 'The small things that end up on every trip.',
  },
];

export const products: Product[] = [
  {
    slug: 'wool-field-cap',
    name: 'Wool Field Cap',
    collection: 'field-wear',
    tagline: 'Six panels, boiled wool, brass rear slide',
    price: 79,
    summary:
      'A low-crown six-panel cap in boiled wool, with a soft unstructured front and a weathered brass rear slide.',
    description: [
      'Cut low so it sits under a hood without fighting it, and unstructured so it packs flat in a lid pocket. The boiled wool sheds a light drizzle and stays warm when it eventually gives up.',
      'The mark is embroidered in bone thread on the left panel — small enough to be a detail rather than a statement.',
    ],
    specs: [
      { label: 'Fabric', value: '100% boiled lambswool, 420 gsm' },
      { label: 'Fit', value: 'Low crown, unstructured, adjustable 54–61 cm' },
      { label: 'Hardware', value: 'Weathered brass slide, leather tab' },
      { label: 'Made', value: 'Fictional demonstration product' },
    ],
    care: 'Spot clean with cool water. Reshape damp and air dry away from direct heat.',
    options: [
      {
        id: 'colour',
        label: 'Colour',
        style: 'swatch',
        values: [
          { id: 'forest', label: 'Forest', swatch: 'var(--hh-forest-800)' },
          { id: 'tussock', label: 'Tussock', swatch: 'var(--hh-tussock-500)' },
          { id: 'charcoal', label: 'Charcoal', swatch: 'var(--hh-charcoal-800)' },
          { id: 'bone', label: 'Bone', swatch: 'var(--hh-bone-200)', soldOut: true },
        ],
      },
    ],
    images: [
      { src: fieldCap, alt: "Forest green wool field cap with the Harry's Hunts antler mark embroidered on the side panel." },
      { src: fieldCapDetail, alt: 'Technical line drawing of the cap from behind, showing the adjustable rear slide.' },
      { src: woolSwatch, alt: 'Close-up swatch of dark green boiled wool.' },
    ],
    weight: 140,
    featured: true,
  },
  {
    slug: 'merino-quarter-zip',
    name: 'Merino Quarter-Zip',
    collection: 'field-wear',
    tagline: 'Mid-weight merino, brass pull, no branding to speak of',
    price: 289,
    summary:
      'A mid-weight merino quarter-zip that works as a mid-layer on the tops and as a jersey at the table afterwards.',
    description: [
      'Knitted from a 280 gsm merino blend with a raised collar that actually covers the neck, and a brass zip pull you can find with gloves on. Flatlock seams at the shoulder so a pack strap has nothing to chew.',
      'Sized to layer: order your normal size for a close fit over a base layer, or one up if you plan to wear a shirt underneath.',
    ],
    specs: [
      { label: 'Fabric', value: '85% merino / 15% nylon, 280 gsm' },
      { label: 'Collar', value: 'Raised, quarter-length YKK-style brass zip' },
      { label: 'Seams', value: 'Flatlock shoulders, gusseted underarm' },
      { label: 'Made', value: 'Fictional demonstration product' },
    ],
    care: 'Machine wash cool on wool cycle. Dry flat. Do not tumble dry.',
    options: [
      {
        id: 'colour',
        label: 'Colour',
        style: 'swatch',
        values: [
          { id: 'charcoal', label: 'Charcoal marle', swatch: 'var(--hh-charcoal-800)' },
          { id: 'forest', label: 'Deep forest', swatch: 'var(--hh-forest-700)' },
          { id: 'tussock', label: 'Tussock', swatch: 'var(--hh-tussock-500)' },
        ],
      },
      {
        id: 'size',
        label: 'Size',
        style: 'pill',
        defaultValue: 'm',
        values: [
          { id: 'xs', label: 'XS' },
          { id: 's', label: 'S' },
          { id: 'm', label: 'M' },
          { id: 'l', label: 'L' },
          { id: 'xl', label: 'XL' },
          { id: 'xxl', label: 'XXL', soldOut: true },
        ],
      },
    ],
    images: [
      { src: quarterZip, alt: 'Charcoal marle merino quarter-zip with a brass zip pull and a small antler mark on the chest.' },
      { src: quarterZipDetail, alt: 'Technical line drawing of the quarter-zip from behind, showing the shoulder seams.' },
      { src: merinoSwatch, alt: 'Close-up swatch of charcoal marle merino knit.' },
    ],
    weight: 420,
    badge: 'Best seller',
    featured: true,
  },
  {
    slug: 'waxed-canvas-duffel',
    name: 'Waxed Canvas Duffel',
    collection: 'carry',
    tagline: '18 oz waxed canvas, vegetable-tanned leather, 45 litres',
    price: 449,
    summary:
      'A 45-litre barrel duffel in 18 oz waxed canvas with vegetable-tanned leather ends, straps and a removable shoulder sling.',
    description: [
      'Built to be the only bag on a week-long trip: a full-length brass zip, an internal wet pocket for waterproofs, and a base panel that takes a wet boot without complaint.',
      'The wax finish will mark, scuff and lighten at the fold lines. That is the point. Re-wax it every couple of seasons and it will outlast several better-behaved bags.',
    ],
    specs: [
      { label: 'Body', value: '18 oz waxed cotton canvas' },
      { label: 'Trim', value: 'Vegetable-tanned leather, aged brass hardware' },
      { label: 'Capacity', value: '45 L — 56 × 28 × 28 cm' },
      { label: 'Made', value: 'Fictional demonstration product' },
    ],
    care: 'Brush off dry dirt. Re-wax annually with a neutral proofing bar. Never machine wash.',
    options: [
      {
        id: 'colour',
        label: 'Colour',
        style: 'swatch',
        values: [
          { id: 'tan', label: 'Waxed tan', swatch: 'var(--hh-tan-400)' },
          { id: 'forest', label: 'Waxed forest', swatch: 'var(--hh-forest-700)' },
        ],
      },
      {
        id: 'monogram',
        label: 'Leather patch',
        style: 'pill',
        values: [
          { id: 'standard', label: 'House mark' },
          { id: 'blank', label: 'Blank patch', priceDelta: -15 },
        ],
      },
    ],
    images: [
      { src: duffel, alt: "Waxed tan canvas barrel duffel with leather straps and a stamped Harry's Hunts leather patch." },
      { src: duffelDetail, alt: 'Close-up of the stamped leather patch with water beading on the waxed canvas around it.' },
      { src: duffelHardware, alt: 'Close-up of the aged brass zip pull and leather tab on the duffel.' },
      { src: canvasSwatch, alt: 'Close-up swatch of waxed tan canvas.' },
    ],
    weight: 1650,
    badge: 'Made to order',
    featured: true,
  },
  {
    slug: 'enamel-camp-mug',
    name: 'Enamel Camp Mug',
    collection: 'camp',
    tagline: 'Bone enamel, forest rim, indestructible enough',
    price: 34,
    summary:
      'A steel-core enamel mug in warm bone with a deep forest rim, printed with the full house mark.',
    description: [
      'Heavy enough not to blow off a hut table, light enough to clip to a pack. The rim is rolled and glazed so it does not take the skin off your lip at altitude.',
      'It will chip. Every good one does.',
    ],
    specs: [
      { label: 'Body', value: 'Vitreous enamel over carbon steel' },
      { label: 'Rim', value: 'Rolled steel, forest glaze' },
      { label: 'Safe for', value: 'Open flame, gas ring, dishwasher' },
      { label: 'Made', value: 'Fictional demonstration product' },
    ],
    care: 'Dishwasher safe. Not suitable for microwaves.',
    options: [
      {
        id: 'size',
        label: 'Size',
        style: 'pill',
        values: [
          { id: '350', label: '350 ml' },
          { id: '500', label: '500 ml', priceDelta: 6 },
        ],
      },
      {
        id: 'set',
        label: 'Quantity set',
        style: 'pill',
        values: [
          { id: 'single', label: 'Single' },
          { id: 'pair', label: 'Pair', priceDelta: 28 },
        ],
      },
    ],
    images: [
      { src: enamelMug, alt: "Bone enamel camp mug with a forest green rim and the Harry's Hunts antler mark." },
      { src: enamelMugDetail, alt: 'Overhead line drawing of the enamel mug showing the mark inside the base.' },
    ],
    weight: 320,
  },
  {
    slug: 'field-notebook',
    name: 'Field Notebook',
    collection: 'camp',
    tagline: 'Water-resistant paper, bone board, elastic closure',
    price: 42,
    summary:
      'A hard-wearing pocket notebook on water-resistant paper, with a bone board cover, a tussock elastic and a ribbon marker.',
    description: [
      'Ninety-six pages of 100 gsm water-resistant stock that takes pencil in the rain and pen once it dries. The endpapers carry a blank field-log template for wind, weather, sign and distance.',
      'It fits a chest pocket, which is the only specification that really matters.',
    ],
    specs: [
      { label: 'Paper', value: '96 pages, 100 gsm water-resistant stock' },
      { label: 'Cover', value: 'Bone board with a debossed mark' },
      { label: 'Binding', value: 'Section sewn, lies flat' },
      { label: 'Made', value: 'Fictional demonstration product' },
    ],
    care: 'Wipe the cover clean. Let the pages dry fully before closing.',
    options: [
      {
        id: 'format',
        label: 'Format',
        style: 'pill',
        values: [
          { id: 'pocket', label: 'Pocket — A6' },
          { id: 'field', label: 'Field — A5', priceDelta: 9 },
        ],
      },
      {
        id: 'ruling',
        label: 'Ruling',
        style: 'pill',
        values: [
          { id: 'ruled', label: 'Ruled' },
          { id: 'dot', label: 'Dot grid' },
          { id: 'plain', label: 'Plain' },
        ],
      },
    ],
    images: [
      { src: notebook, alt: "Bone-covered field notebook with a debossed Harry's Hunts mark and a tussock elastic closure." },
      { src: notebookDetail, alt: 'Line drawing of the notebook lying open, showing ruled pages and a ribbon marker.' },
    ],
    weight: 180,
    featured: true,
  },
];

export const productsBySlug = new Map(products.map((product) => [product.slug, product]));

export function getProduct(slug: string): Product | undefined {
  return productsBySlug.get(slug);
}

export function productsInCollection(collection: CollectionId): Product[] {
  return products.filter((product) => product.collection === collection);
}

/** Base price plus every selected option's delta, in whole NZD. */
export function priceForSelection(product: Product, selection: Record<string, string>): number {
  return product.options.reduce((total, group) => {
    const value = group.values.find((candidate) => candidate.id === selection[group.id]);
    return total + (value?.priceDelta ?? 0);
  }, product.price);
}

/** The first non-sold-out value of every option group. */
export function defaultSelection(product: Product): Record<string, string> {
  return Object.fromEntries(
    product.options.map((group) => {
      const preferred = group.values.find(
        (value) => value.id === group.defaultValue && !value.soldOut,
      );
      const fallback = group.values.find((value) => !value.soldOut) ?? group.values[0];
      return [group.id, (preferred ?? fallback).id];
    }),
  );
}

export function describeSelection(product: Product, selection: Record<string, string>): string {
  return product.options
    .map((group) => group.values.find((value) => value.id === selection[group.id])?.label)
    .filter(Boolean)
    .join(' · ');
}
