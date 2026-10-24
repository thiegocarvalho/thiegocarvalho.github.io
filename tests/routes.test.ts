import { distFiles, readDist } from './helpers/dist';

// The profile page is a route pair: /about/ and /pt/about/, English slugs in
// both locales (as /pt/blog/ already does).
describe.each([
  ['about/index.html', 'en', 'https://thiegocarvalho.github.io/about/'],
  ['pt/about/index.html', 'pt-br', 'https://thiegocarvalho.github.io/pt/about/'],
] as const)('profile route (%s)', (page, lang, canonical) => {
  const html = readDist(page);

  it('exists, in the right language, with its own canonical', () => {
    expect(html).toContain(`<html lang="${lang}"`);
    expect(html).toContain(`<link rel="canonical" href="${canonical}"`);
  });

  it('declares hreflang to its counterpart and x-default', () => {
    expect(html).toContain('hreflang="en" href="https://thiegocarvalho.github.io/about/"');
    expect(html).toContain('hreflang="pt-br" href="https://thiegocarvalho.github.io/pt/about/"');
    expect(html).toContain('hreflang="x-default" href="https://thiegocarvalho.github.io/about/"');
  });

  it('has its own title and description, distinct from home', () => {
    const home = readDist(lang === 'en' ? 'index.html' : 'pt/index.html');
    const title = html.match(/<title>(.+?)<\/title>/)![1];
    expect(title).not.toBe(home.match(/<title>(.+?)<\/title>/)![1]);
    expect(title).toMatch(/Perfil|Profile/);
    expect(html).toMatch(/<h1\b/);
    expect(html).toMatch(/og:url" content="[^"]*about\//);
  });

  it('is in the sitemap', () => {
    expect(distFiles('sitemap-*.xml').map(readDist).join('')).toContain(canonical);
  });
});

it('does not publish the old single-page anchors on home', () => {
  for (const page of ['index.html', 'pt/index.html']) {
    expect(readDist(page)).not.toMatch(/id="(career|about)"/);
  }
});
