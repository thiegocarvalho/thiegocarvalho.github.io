import { allHtml, allStyles, readDist } from './helpers/dist';

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
    for (const page of ['blog/index.html', 'pt/blog/index.html', 'about/index.html', 'pt/about/index.html']) {
      const html = readDist(page);
      const nav = html.slice(html.indexOf('data-text-nav'));
      const navEnd = nav.indexOf('</nav>');
      expect(navEnd).toBeGreaterThan(-1);
      expect(nav.slice(0, navEnd)).not.toMatch(/href="#/);
    }
  });

  it('resolves every nav link from every page, in the right locale', () => {
    // Projects/contact are sections of the home page, so they carry the home path
    // (not a bare hash); profile and blog are real routes.
    for (const { path, html } of allHtml()) {
      const pt = path.startsWith('pt/');
      const nav = html.slice(html.indexOf('data-text-nav'), html.indexOf('</nav>'));
      const home = pt ? '/pt/' : '/';
      for (const href of [`${home}#projects`, `${home}#contact`, `${home}about/`, `${home}blog/`]) {
        expect(nav, `${path} -> ${href}`).toContain(`href="${href}"`);
      }
    }
  });

  it('has no leftover career/about section links', () => {
    for (const { path, html } of allHtml()) {
      const nav = html.slice(html.indexOf('data-text-nav'), html.indexOf('</nav>'));
      expect(nav, path).not.toMatch(/#career|#about/);
    }
  });

  it('marks the current page in the nav', () => {
    expect(readDist('about/index.html')).toMatch(/href="\/about\/"[^>]*aria-current="page"/);
    expect(readDist('pt/about/index.html')).toMatch(/href="\/pt\/about\/"[^>]*aria-current="page"/);
    expect(readDist('blog/index.html')).toMatch(/href="\/blog\/"[^>]*aria-current="page"/);
  });

  it('keeps the nav as one row on phones, with the language switch shortened but still named', () => {
    // The phone layout drops wrapping and shortens the switch to a code; the
    // full language name stays on the link as its accessible name.
    const nav = readDist('about/index.html');
    expect(nav).toMatch(/data-lang-switch[\s\S]{0,260}aria-label="Português"/);
    expect(readDist('pt/about/index.html')).toMatch(/data-lang-switch[\s\S]{0,260}aria-label="English"/);
    expect(allStyles()).not.toMatch(/nav[^{]*\{[^}]*flex-wrap:\s*wrap/);
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

  it('maps /about/ and /pt/about/ onto each other', () => {
    expect(readDist('about/index.html')).toMatch(/data-lang-switch[\s\S]{0,120}href="\/pt\/about\/"/);
    expect(readDist('pt/about/index.html')).toMatch(/data-lang-switch[\s\S]{0,120}href="\/about\/"/);
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
