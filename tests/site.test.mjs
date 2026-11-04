import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const origin = 'https://lib-one.com';
const read = path => readFile(new URL(path, root), 'utf8');
const files = (await readdir(root)).filter(name => name.endsWith('.html')).sort();
const pages = await Promise.all(files.map(async file => ({ file, html: await read(file), url: origin + (file === 'index.html' ? '/' : '/' + file.slice(0, -5)) })));
const sandbox = { window: {} };
vm.runInNewContext(await read('js/data.js'), sandbox);
const products = JSON.parse(JSON.stringify(sandbox.window.LIB_ONE_DATA.products));
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map(m => [m[1], m[2]]));
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'g'))].map(m => attrs(m[0]));
const plain = html => html.replace(/<[^>]*>/g, '').replace(/\s+/g, '').trim();
const schema = html => [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(m => { const value = JSON.parse(m[1]); return value['@graph'] || [value]; });

test('all 15 content pages agree on their canonical URL and sitemap entry', async () => {
  assert.equal(pages.length, 15);
  for (const p of pages) {
    const canonical = tags(p.html, 'link').filter(link => link.rel === 'canonical');
    assert.deepEqual(canonical.map(link => link.href), [p.url], p.file);
    const directives = tags(p.html, 'meta').find(meta => meta.name === 'robots')?.content.split(/[,\s]+/) || [];
    assert.ok(directives.includes('index') && !directives.includes('noindex'), p.file);
  }
  const locations = [...(await read('sitemap.xml')).matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  assert.deepEqual(locations.sort(), pages.map(p => p.url).sort());
  assert.match(await read('robots.txt'), /Sitemap: https:\/\/lib-one\.com\/sitemap\.xml/);
});

test('internal navigation links directly to real clean routes and retains valid fragments', () => {
  const byPath = new Map(pages.map(p => [new URL(p.url).pathname, p]));
  for (const p of pages) {
    for (const a of tags(p.html, 'a')) {
      if (!a.href || /^(mailto:|tel:|https?:)/.test(a.href)) continue;
      const url = new URL(a.href.replaceAll('&amp;', '&'), p.url);
      assert.ok(!url.pathname.endsWith('.html'), `${p.file}: ${a.href}`);
      const destination = byPath.get(url.pathname);
      assert.ok(destination, `${p.file}: ${a.href}`);
      if (url.hash) assert.ok(destination.html.includes(`id="${url.hash.slice(1)}"`), `${p.file}: missing ${url.hash}`);
    }
  }
  for (const product of products) assert.equal(product.path, '/' + product.id);
});

test('Product identity, brand, images and visible descriptions are consistent', () => {
  for (const p of pages.filter(p => !['index.html', 'contact.html'].includes(p.file))) {
    const product = schema(p.html).find(s => s['@type'] === 'Product');
    assert.equal(product['@id'], p.url + '#product', p.file);
    assert.equal(product.url, p.url, p.file);
    assert.equal(product.brand['@id'], origin + '/#brand', p.file);
    assert.ok(product.image.startsWith(origin + '/assets/'), p.file);
    const intro = p.html.match(/<p class="product-intro">([\s\S]*?)<\/p>/)?.[1];
    assert.equal(plain(product.description), plain(intro), p.file);
    assert.equal(product.featureList, undefined, 'Product features use additionalProperty');
    assert.ok(!product.offers && !product.aggregateRating && !product.review, 'do not invent commercial data');
  }
  const home = schema(pages.find(p => p.file === 'index.html').html);
  assert.ok(home.some(s => s['@type'] === 'Organization' && s['@id'] === origin + '/#organization'));
  assert.ok(home.some(s => s['@type'] === 'Brand' && s['@id'] === origin + '/#brand'));
});

test('all 13 products reach an inquiry form with exactly 13 selectable products including HyPass', () => {
  const contact = pages.find(p => p.file === 'contact.html');
  const choices = tags(contact.html, 'input').filter(input => input.name === 'interests[]');
  assert.equal(choices.length, 13);
  assert.deepEqual(choices.map(c => c['data-product-id']).sort(), products.map(p => p.id).sort());
  for (const p of pages) {
    const header = tags(p.html, 'a').find(a => a.class === 'header-contact');
    assert.equal(new URL(header.href, p.url).pathname, '/contact', p.file);
  }
  for (const product of products) {
    const p = pages.find(p => p.file === product.id + '.html');
    const cta = tags(p.html, 'a').find(a => a['data-product-inquiry'] === product.id);
    assert.ok(cta, product.id);
    const url = new URL(cta.href.replaceAll('&amp;', '&'), p.url);
    assert.equal(url.pathname, '/contact');
    assert.equal(url.searchParams.get('product'), product.id);
  }
  assert.match(contact.html, /以 Email 傳送需求/);
  assert.match(contact.html, /不會自動寄信/);
  assert.ok(tags(contact.html, 'a').some(a => a.href === 'mailto:service@hyweb.com.tw'));
});

test('the desktop space product no longer describes a standing chassis', () => {
  const p = pages.find(p => p.file === 'desktop-space-kiosk.html');
  const intro = p.html.match(/<p class="product-intro">([\s\S]*?)<\/p>/)[1];
  assert.doesNotMatch(intro, /直立式機身/);
  assert.match(intro, /桌上型螢幕/);
});

test('the three pilot products expose a comparison and at least three visible FAQs', () => {
  for (const file of ['workstation.html', 'rfid-workstation.html', 'desktop-self-service-kiosk.html']) {
    const p = pages.find(p => p.file === file);
    assert.match(p.html, /<table\b[^>]*class="product-comparison"/);
    const faq = p.html.match(/<section\b[^>]*class="[^\"]*product-faq[^\"]*"[^>]*>([\s\S]*?)<\/section>/)?.[1];
    assert.ok(faq, file);
    assert.ok((faq.match(/<details>/g) || []).length >= 3, file);
  }
  assert.match(pages.find(p => p.file === 'index.html').html, /Lib One 是凌網資訊股份有限公司的智慧圖書館品牌/);
});

test('each legacy HTML page has a permanent asset redirect without loops', async () => {
  const rules = (await read('_redirects')).split('\n').filter(line => line.trim() && !line.startsWith('#')).map(line => line.trim().split(/\s+/));
  for (const p of pages) {
    const rule = rules.find(rule => rule[0] === '/' + p.file);
    assert.ok(rule, p.file);
    assert.equal(rule[1], new URL(p.url).pathname);
    assert.ok(['301', '308'].includes(rule[2]));
    assert.notEqual(rule[0], rule[1]);
  }
});
