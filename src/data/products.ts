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
    blurb: 'Wool and merino concepts for cold starts and quiet hours outside.',
  },
  {
    id: 'carry',
    name: 'Carry',
    blurb: 'A waxed-canvas carry concept with leather trim and plain hardware.',
  },
  {
    id: 'camp',
    name: 'Camp and desk',
    blurb: 'Two small, useful concepts for the hut or desk.',
  },
];

export const products: Product[] = [
  {
    slug: 'wool-field-cap',
    name: 'Wool Field Cap',
    collection: 'field-wear',
    tagline: 'Boiled wool, low crown, brass slide',
    price: 79,
    summary:
      'A fictional low-crown cap in boiled wool, with an unstructured front and brass rear slide.',
    description: [
      'The concept sits low under a hood and packs flat in a lid pocket. Boiled wool gives it the right cold-weather character.',
      'A small bone-coloured mark sits on the left panel. That is all the branding it needs.',
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
    tagline: 'Mid-weight merino with a raised collar',
    price: 289,
    summary:
      'A fictional mid-weight merino layer with a raised collar, brass pull and quiet chest mark.',
    description: [
      'The concept uses a 280 gsm merino blend, flat shoulder seams and a raised collar. The brass pull is deliberately easy to find in gloves.',
      'The fictional sizing is close enough for a base layer underneath, with the option to size up for a shirt.',
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
    badge: 'Merino concept',
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
      'The fictional layout has a full-length zip, an internal pocket for wet gear and a reinforced base. At 45 litres, it is drawn as a one-bag option for a week away.',
      'Waxed canvas is meant to show marks and lighten at the folds. The care notes explain the intended upkeep without claiming a real product lifespan.',
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
    badge: '45-litre concept',
    featured: true,
  },
  {
    slug: 'enamel-camp-mug',
    name: 'Enamel Camp Mug',
    collection: 'camp',
    tagline: 'Bone enamel with a forest rim',
    price: 34,
    summary:
      'A fictional steel-core enamel mug in warm bone with a forest rim and the house mark.',
    description: [
      'The concept is drawn with a rolled, glazed rim and two sizes. It belongs on a hut table or clipped outside a pack.',
      'Enamel chips. That is part of owning one.',
    ],
    specs: [
      { label: 'Body', value: 'Vitreous enamel over carbon steel' },
      { label: 'Rim', value: 'Rolled steel, forest glaze' },
      { label: 'Concept use', value: 'Open flame, gas ring, dishwasher' },
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
      'A fictional field notebook with water-resistant paper, a board cover, elastic closure and ribbon marker.',
    description: [
      'The concept has 96 pages and a blank field-log template for wind, weather, sign and distance. It is intended for pencil in damp conditions and pen back indoors.',
      'The A6 version fits a chest pocket. That earns it a place in the range.',
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
