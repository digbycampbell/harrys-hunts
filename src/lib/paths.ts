const BASE = import.meta.env.BASE_URL;

/**
 * Resolves an app-absolute path (`/journeys/`) against the GitHub Pages base path.
 * Always use this for internal links so deep links work under `/harrys-hunts/`.
 */
export function href(path: string): string {
  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith('#') || path.startsWith('mailto:')) {
    return path;
  }
  const base = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}` || '/';
}

/** True when `current` (a `URL.pathname`) is inside the section at `path`. */
export function isActive(current: string, path: string): boolean {
  const target = href(path);
  if (target === href('/')) return current === target;
  return current === target || current.startsWith(target);
}
