import { cp, mkdir, readdir, rm } from 'node:fs/promises';

const source = new URL('../', import.meta.url);
const output = new URL('../dist/', import.meta.url);
await rm(output, { recursive: true, force: true });
await mkdir(output);
const pages = (await readdir(source)).filter(name => name.endsWith('.html'));
for (const name of [...pages, 'robots.txt', 'sitemap.xml', '_redirects', 'assets', 'css', 'js']) {
  await cp(new URL(name, source), new URL(name, output), { recursive: true });
}
console.log(`Built ${pages.length} static pages in dist/; no server runtime or receiving backend.`);
