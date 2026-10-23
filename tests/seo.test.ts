import { allHtml, readDist } from './helpers/dist';

it('declares a canonical and both hreflang alternates on the home pages', () => {
  for (const [page, lang] of [['index.html','en'], ['pt/index.html','pt-br']] as const) {
    const html = readDist(page);
    expect(html).toContain(`<html lang="${lang}"`);
    expect(html).toMatch(/<link rel="canonical" href="https:\/\/thiegocarvalho\.github\.io/);
    expect(html).toMatch(/hreflang="en"/);
    expect(html).toMatch(/hreflang="pt-br"/);
    expect(html).toMatch(/hreflang="x-default"/);
  }
});
it('gives every page a title and meta description', () => {
  for (const { path, html } of allHtml()) {
    expect(html, path).toMatch(/<title>.+<\/title>/);
    expect(html, path).toMatch(/<meta name="description" content=".+"/);
  }
});
