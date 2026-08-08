/**
 * Minimal static server for `dist/`, used by the Playwright suite.
 *
 * It deliberately mirrors GitHub Pages behaviour so the tests prove the real
 * deployment works: everything is served under the `/harrys-hunts/` base path,
 * a directory request resolves to its `index.html`, and an unknown path returns
 * `404.html` with a 404 status.
 *
 *   node scripts/serve-dist.mjs [port]
 */
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const base = '/harrys-hunts';
const port = Number(process.argv[2] ?? 4322);

const types = new Map(
  Object.entries({
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.woff2': 'font/woff2',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8',
  }),
);

async function resolveFile(pathname) {
  // Requests outside the base path are 404s, exactly as on GitHub Pages.
  if (pathname !== base && !pathname.startsWith(`${base}/`)) return null;

  const relative = decodeURIComponent(pathname.slice(base.length)) || '/';
  const target = path.join(root, relative);
  if (target !== root && !target.startsWith(root + path.sep)) return null;

  try {
    const info = await stat(target);
    if (info.isDirectory()) {
      const index = path.join(target, 'index.html');
      await stat(index);
      return index;
    }
    return target;
  } catch {
    return null;
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://localhost:${port}`);
  const file = await resolveFile(url.pathname);

  if (file) {
    response.writeHead(200, {
      'content-type': types.get(path.extname(file)) ?? 'application/octet-stream',
      'cache-control': 'no-store',
    });
    createReadStream(file).pipe(response);
    return;
  }

  const notFound = path.join(root, '404.html');
  try {
    await stat(notFound);
    response.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    createReadStream(notFound).pipe(response);
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Serving dist at http://127.0.0.1:${port}${base}/`);
});
