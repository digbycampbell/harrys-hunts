/**
 * Build-time thumbnails for the client-side cart.
 *
 * The cart islands run in the browser and cannot use `astro:assets`, so we
 * optimise one small image per product on the server and hand the plain
 * descriptors to the island as props. Keeps raw 1200px PNGs out of the drawer.
 *
 * Server-only: import this from `.astro` files, never from an island.
 */
import { getImage } from 'astro:assets';
import { products } from '../data/products';

export interface Thumb {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export type ThumbMap = Record<string, Thumb>;

export async function productThumbs(width = 160): Promise<ThumbMap> {
  const entries = await Promise.all(
    products.map(async (product) => {
      const image = product.images[0];
      const optimised = await getImage({ src: image.src, width, format: 'webp', quality: 78 });
      return [
        product.slug,
        {
          src: optimised.src,
          width: optimised.attributes.width ?? width,
          height: optimised.attributes.height ?? width,
          alt: image.alt,
        },
      ] as const;
    }),
  );
  return Object.fromEntries(entries);
}
