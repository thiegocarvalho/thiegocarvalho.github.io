import { distFiles, readDist } from './helpers/dist';
import { ui } from '../src/i18n/ui';

// Review Focus 2: zero published posts must not crash, and must say so
it('renders a blog index for both locales', () => {
  expect(readDist('blog/index.html')).toMatch(/<h1/);
  expect(readDist('pt/blog/index.html')).toMatch(/<h1/);
});
it('shows the empty state on the English index, which has only a draft', () => {
  const html = readDist('blog/index.html');
  expect(html).toContain(ui.en['blog.empty']);
  expect(html).not.toContain('hello-world');
});

// Review Focus 1: a post in one locale only
it('never advertises an hreflang alternate for a translation that does not exist', () => {
  const html = readDist('pt/blog/arquitetura-de-pagamentos-hibridos/index.html');
  // Scoped to <link rel="alternate">, which is the declaration search engines
  // read as "the same document in another language". An hreflang attribute on
  // an <a> is a different thing -- it describes the language of whatever that
  // link points at -- and the language switch legitimately carries one.
  const alternates = [...html.matchAll(/<link rel="alternate"[^>]*>/g)].map((m) => m[0]).join('');
  expect(alternates).not.toMatch(/hreflang="en"/);
  expect(alternates).not.toMatch(/hreflang="x-default"/);
  expect(alternates).toMatch(/hreflang="pt-br"/);
  expect(html).not.toMatch(/href="https:\/\/thiegocarvalho\.github\.io\/blog\//);
});
it('lists an untranslated post only under its own locale', () => {
  expect(readDist('pt/blog/index.html')).toContain('arquitetura');
  expect(readDist('blog/index.html')).not.toContain('arquitetura');
});

// Review Focus 4: diacritics in the filename
it('resolves a post whose filename carries diacritics to an ASCII URL', () => {
  const pages = distFiles('pt/blog/**/index.html');
  expect(pages.some((p) => /arquitetura-de-pagamentos-hibridos/.test(p))).toBe(true);
  for (const p of distFiles('**/*.html')) expect(p).toMatch(/^[\x20-\x7e]+$/);
});

it('excludes drafts from the build', () => {
  expect(distFiles('**/blog/**/index.html').join()).not.toMatch(/draft|hello/);
});

it('publishes an RSS feed with the published post and no draft', () => {
  const xml = readDist('rss.xml');
  expect(xml).toContain('<rss');
  expect(xml).toContain('arquitetura-de-pagamentos-hibridos');
  expect(xml).not.toContain('hello-world');
});

it('keeps inline spacing intact in the post body', () => {
  const html = readDist('pt/blog/arquitetura-de-pagamentos-hibridos/index.html');
  expect(html).toMatch(/<strong>um único ledger interno<\/strong> como/);
});
