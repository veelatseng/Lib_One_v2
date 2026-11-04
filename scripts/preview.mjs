import http from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json', '.map': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf' };

export function createPreviewServer(directory) {
  const root = resolve(directory);
  return http.createServer(async (request, response) => {
    const reply = (status, text, headers = {}) => {
      response.writeHead(status, { 'X-Robots-Tag': 'noindex', 'Cache-Control': 'no-store', ...headers });
      response.end(request.method === 'HEAD' ? undefined : text);
    };
    if (!['GET', 'HEAD'].includes(request.method)) return reply(405, 'Method Not Allowed', { Allow: 'GET, HEAD' });
    try {
      const url = new URL(request.url, 'http://localhost');
      const path = decodeURIComponent(url.pathname);
      if (path.includes('\\') || path.split('/').some(segment => segment === '..' || segment === '.')) return reply(404, 'Not Found');
      const pageNames = (await readdir(root)).filter(name => name.endsWith('.html'));
      const pages = new Map(pageNames.map(name => ['/' + name.slice(0, -5), name]));
      const rules = (await readFile(resolve(root, '_redirects'), 'utf8')).split('\n').filter(line => line.trim() && !line.startsWith('#')).map(line => line.trim().split(/\s+/));
      const redirect = rules.find(rule => rule[0] === path);
      if (redirect) return reply(Number(redirect[2]), '', { Location: redirect[1] + url.search });
      let file = path === '/' ? 'index.html' : pages.get(path);
      if (!file && (['/robots.txt', '/sitemap.xml'].includes(path) || /^\/(assets|css|js)\//.test(path))) file = path.slice(1);
      if (!file) return reply(404, 'Not Found');
      const absolute = resolve(root, file);
      if (!absolute.startsWith(root + sep)) return reply(404, 'Not Found');
      const body = await readFile(absolute);
      reply(200, body, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Content-Length': body.length });
    } catch (error) {
      reply(error instanceof URIError ? 400 : 404, error instanceof URIError ? 'Bad Request' : 'Not Found');
    }
  });
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const directory = fileURLToPath(new URL('../dist/', import.meta.url));
  const port = Number(process.env.PORT || 4173);
  createPreviewServer(directory).listen(port, '127.0.0.1', () => console.log(`Preview: http://127.0.0.1:${port} (run npm run build first)`));
}
