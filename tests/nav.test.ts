import { allHtml, readDist } from './helpers/dist';

// TextNav is primary navigation on every page, so its section links have to
// resolve from pages that do not contain those sections. A bare "#career" on
// /blog/ points at nothing and fails silently, which is the worst kind of
// broken link: nothing errors, the click just does nothing.
describe('text navigation', () => {
  it('appears on every built page', () => {
    for (const { path, html } of allHtml()) {
      expect(html, path).toContain('data-text-nav');
    }
  });

  it('never leaves a bare hash link that cannot resolve off the home page', () => {
    for (const page of ['blog/index.html', 'pt/blog/index.html']) {
      const html = readDist(page);
      const nav = html.slice(html.indexOf('data-text-nav'));
      const navEnd = nav.indexOf('</nav>');
      expect(navEnd).toBeGreaterThan(-1);
      expect(nav.slice(0, navEnd)).not.toMatch(/href="#/);
    }
  });

  it('points section links at the right locale home', () => {
    const en = readDist('blog/index.html');
    const pt = readDist('pt/blog/index.html');
    for (const section of ['career', 'projects', 'about', 'contact']) {
      expect(en, `en ${section}`).toContain(`href="/#${section}"`);
      expect(pt, `pt ${section}`).toContain(`href="/pt/#${section}"`);
    }
  });

  it('links each locale at its own blog index', () => {
    expect(readDist('index.html')).toContain('href="/blog/"');
    expect(readDist('pt/index.html')).toContain('href="/pt/blog/"');
  });
});

// Without a switch the site is bilingual only to crawlers: hreflang tells
// search engines the other version exists, but a visitor on / cannot reach
// /pt by any means the page offers.
describe('language switch', () => {
  it('appears on every built page', () => {
    for (const { path, html } of allHtml()) {
      expect(html, path).toContain('data-lang-switch');
    }
  });

  it('points at the counterpart page when that page exists in both locales', () => {
    expect(readDist('index.html')).toMatch(/data-lang-switch[\s\S]{0,120}href="\/pt\/"/);
    expect(readDist('pt/index.html')).toMatch(/data-lang-switch[\s\S]{0,120}href="\/"/);
    expect(readDist('blog/index.html')).toMatch(/data-lang-switch[\s\S]{0,120}href="\/pt\/blog\/"/);
    expect(readDist('pt/blog/index.html')).toMatch(/data-lang-switch[\s\S]{0,120}href="\/blog\/"/);
  });

  it('falls back to the other locale home for a page with no counterpart', () => {
    // The Portuguese post has no English translation, so the English URL for
    // it was never built; linking to it would turn a missing translation into
    // a 404.
    const post = readDist('pt/blog/arquitetura-de-pagamentos-hibridos/index.html');
    expect(post).toMatch(/data-lang-switch[\s\S]{0,120}href="\/"/);
    expect(post).not.toContain('href="/blog/arquitetura-de-pagamentos-hibridos/"');
  });

  it('never links a page at its own locale', () => {
    const en = readDist('index.html');
    const seg = en.slice(en.indexOf('data-lang-switch'));
    expect(seg.slice(0, 160)).not.toMatch(/href="\/"/);
  });
});
