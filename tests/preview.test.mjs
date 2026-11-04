import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const moduleUrl = new URL('../scripts/preview.mjs', import.meta.url);
let server, origin;
before(async () => {
  if (!existsSync(moduleUrl)) return;
  const { createPreviewServer } = await import(moduleUrl);
  server = createPreviewServer(fileURLToPath(new URL('../', import.meta.url)));
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  origin = 'http://127.0.0.1:' + server.address().port;
});
after(async () => { if (server?.listening) await new Promise(resolve => server.close(resolve)); });

test('legacy preview redirects preserve the query on localhost and do not loop', async () => {
  assert.ok(origin, 'clean-route static preview is missing');
  const response = await fetch(origin + '/contact.html?product=workstation', { redirect: 'manual' });
  assert.equal(response.status, 301);
  assert.equal(response.headers.get('location'), '/contact?product=workstation');
  const final = await fetch(new URL(response.headers.get('location'), origin));
  assert.equal(final.status, 200);
  assert.ok(final.url.startsWith(origin));
  assert.equal(final.headers.get('x-robots-tag'), 'noindex');
});

test('clean routes, trailing aliases and homepage agree while unknown routes remain 404', async () => {
  assert.ok(origin, 'clean-route static preview is missing');
  for (const route of ['/', '/workstation', '/contact', '/sitemap.xml']) assert.equal((await fetch(origin + route)).status, 200, route);
  const slash = await fetch(origin + '/workstation/?source=check', { redirect: 'manual' });
  assert.equal(slash.status, 301);
  assert.equal(slash.headers.get('location'), '/workstation?source=check');
  assert.equal((await fetch(origin + '/not-a-real-page')).status, 404);
});

test('the preview exposes public assets, not repository sources or POST endpoints', async () => {
  assert.ok(origin, 'clean-route static preview is missing');
  assert.equal((await fetch(origin + '/js/contact.js')).status, 200);
  for (const route of ['/package.json', '/.git/config', '/deploy/cloudflare-https-redirect.json', '/node_modules/jsdom/package.json', '/README.md', '/api/contact']) assert.equal((await fetch(origin + route)).status, 404, route);
  assert.equal((await fetch(origin + '/contact', { method: 'POST', body: 'test=1' })).status, 405);
});

test('encoded traversal cannot escape a public directory into repository files', async () => {
  assert.ok(origin, 'clean-route static preview is missing');
  for (const route of ['/assets/..%2fpackage.json', '/css/..%2fREADME.md', '/assets/..%2ftests/site.test.mjs', '/assets/..%5cpackage.json']) {
    assert.equal((await fetch(origin + route)).status, 404, route);
  }
});
