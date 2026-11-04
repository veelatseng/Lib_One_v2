import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const moduleUrl = new URL('../js/contact.js', import.meta.url);
const api = existsSync(moduleUrl) ? await import(moduleUrl) : null;
function data() {
  const form = new FormData();
  for (const [key, value] of Object.entries({ organization: '測試圖書館', contact_name: '測試聯絡人', email: 'reader@example.com', phone: '', message: '需求含 &、?、# 與換行\n請協助評估配置。' })) form.set(key, value);
  form.append('interests[]', 'HyPass 圖書館智慧辦證服務站｜HyPass Self-Service Registration Kiosk');
  form.append('interests[]', '館員工作站｜Workstation');
  return form;
}
function subjectModule() { assert.ok(api, 'static Email inquiry module is missing'); return api; }

test('Email draft keeps the recipient fixed and encodes Chinese, delimiters and multiline needs', () => {
  const { buildMailto } = subjectModule();
  const url = new URL(buildMailto(data()));
  assert.equal(url.protocol, 'mailto:');
  assert.equal(url.pathname, 'service@hyweb.com.tw');
  assert.deepEqual([...url.searchParams.keys()].sort(), ['body', 'subject']);
  assert.match(url.searchParams.get('subject'), /測試圖書館/);
  const body = url.searchParams.get('body');
  for (const expected of ['reader@example.com', 'HyPass', 'Workstation', '&、?、#', '\n請協助評估配置。']) assert.ok(body.includes(expected), expected);
});

test('user-entered newlines cannot create extra Email subject headers or recipients', () => {
  const { buildMailto } = subjectModule();
  const form = data();form.set('organization', 'Library\r\nBcc: attacker@example.com&cc=other@example.com');
  const url = new URL(buildMailto(form));
  assert.equal(url.pathname, 'service@hyweb.com.tw');
  assert.doesNotMatch(url.searchParams.get('subject'), /[\r\n]/);
  assert.equal(url.searchParams.get('cc'), null);
  assert.equal(url.searchParams.get('bcc'), null);
});

test('copyable inquiry includes an explicit default when phone or product choice is empty', () => {
  const { buildInquiry } = subjectModule();
  const form = data();form.delete('interests[]');
  const text = buildInquiry(form);
  assert.match(text, /聯絡電話：未提供/);
  assert.match(text, /有興趣的設備：尚未指定/);
  assert.match(text, /測試聯絡人/);
});

test('query preselection changes only an existing exact product ID and ignores unknown IDs', () => {
  const { selectProduct } = subjectModule();
  const choices = ['workstation','hypass-self-service-registration-kiosk'].map(id => ({ dataset: { productId: id }, checked: false }));
  const form = { querySelectorAll: () => choices };
  assert.equal(selectProduct(form, 'hypass-self-service-registration-kiosk'), true);
  assert.equal(choices[1].checked, true);
  assert.equal(choices[0].checked, false);
  assert.equal(selectProduct(form, 'unknown\"][checked]'), false);
  assert.equal(choices.length, 2);
});

async function formFixture() {
  const dom = new JSDOM(await readFile(new URL('../contact.html', import.meta.url), 'utf8'), { url: 'https://lib-one.com/contact?product=hypass-self-service-registration-kiosk' });
  const form = dom.window.document.querySelector('#contact-form');
  for (const [key, value] of data()) {
    if (key !== 'interests[]') form.elements.namedItem(key).value = value;
  }
  form.elements.namedItem('privacy_consent').checked = true;
  const browser = { FormData: dom.window.FormData, location: { search: dom.window.location.search }, navigator: {} };
  return { dom, form, browser };
}

test('an unavailable Email app leaves a complete visible draft and never claims delivery', async () => {
  const { initContactForm } = subjectModule();
  const { dom, form, browser } = await formFixture();
  Object.defineProperty(browser.location, 'href', { set() { throw new Error('no Email app'); } });
  initContactForm(dom.window.document, browser);
  form.dispatchEvent(new dom.window.Event('submit', { cancelable: true }));
  assert.equal(form.querySelector('.prepared-inquiry')?.hidden, false);
  assert.match(form.querySelector('#inquiry-draft')?.value || '', /HyPass/);
  assert.match(form.querySelector('[role="status"]').textContent, /無法開啟/);
  assert.equal(form.elements.namedItem('organization').value, '測試圖書館');
  assert.ok(!form.querySelector('[type="submit"]').disabled);
  dom.window.close();
});

test('missing Clipboard API permits manual copying even for a long Chinese inquiry', async () => {
  const { initContactForm } = subjectModule();
  const { dom, form, browser } = await formFixture();
  form.elements.namedItem('message').value = '圖書館設備選型需求。'.repeat(300);
  initContactForm(dom.window.document, browser);
  form.querySelector('[data-copy-inquiry]')?.click();
  await Promise.resolve();
  assert.equal(form.querySelector('.prepared-inquiry')?.hidden, false);
  assert.ok(form.querySelector('#inquiry-draft').value.endsWith('圖書館設備選型需求。'.repeat(300)));
  assert.match(form.querySelector('[role="status"]').textContent, /手動複製/);
  dom.window.close();
});

test('invalid required fields prevent draft creation and local or remote submission', async () => {
  const { initContactForm } = subjectModule();
  const { dom, form, browser } = await formFixture();
  let navigations = 0;
  Object.defineProperty(browser.location, 'href', { set() { navigations++; } });
  initContactForm(dom.window.document, browser);
  form.elements.namedItem('email').value = 'invalid-email';
  const event = new dom.window.Event('submit', { cancelable: true });
  form.dispatchEvent(event);
  assert.equal(event.defaultPrevented, true);
  assert.equal(navigations, 0);
  assert.equal(form.querySelector('.prepared-inquiry')?.hidden, true);
  dom.window.close();
});
