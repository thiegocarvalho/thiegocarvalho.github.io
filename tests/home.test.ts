import { allStyles, readDist } from './helpers/dist';

// Count elements carrying a data attribute, not mentions of it: a bundled or
// inlined stylesheet legitimately names the attribute in its selectors.
const countAttr = (html: string, attr: string) =>
  (html.replace(/<style[\s\S]*?<\/style>/g, '').match(new RegExp(`<[a-z][^>]*\\s${attr}(?=[\\s=>/])`, 'g')) ?? []).length;

it('renders all 13 positions on each locale home page', () => {
  for (const page of ['index.html', 'pt/index.html']) {
    const html = readDist(page);
    expect(countAttr(html, 'data-experience-entry')).toBe(13);
  }
});

// Review Focus 3
it('renders the current role as Present, never as a doubled range', () => {
  const html = readDist('index.html');
  expect(html).toMatch(/2024\s*(—|–|-)\s*Present/);
  expect(html).not.toMatch(/Present\s*(—|–|-)\s*Present/);
  const pt = readDist('pt/index.html');
  expect(pt).toMatch(/2024\s*(—|–|-)\s*Atual/);
  expect(pt).not.toMatch(/Atual\s*(—|–|-)\s*Atual/);
});
it('puts the current role first', () => {
  const html = readDist('index.html');
  const first = html.indexOf('On-Chain Immutable Certification');
  const last = html.indexOf('CENBRACOM');
  expect(first).toBeGreaterThan(-1);
  expect(first).toBeLessThan(last);
});

it('exposes contact as mailto and the four social links, with no form', () => {
  for (const page of ['index.html', 'pt/index.html']) {
    const html = readDist(page);
    expect(html).toContain('mailto:thiego@rocketmail.com');
    for (const url of [
      'https://github.com/thiegocarvalho',
      'https://www.linkedin.com/in/thiegocarvalho/',
      'https://x.com/unusual_zeru',
      'https://www.instagram.com/unusual_zeru/',
    ]) expect(html).toContain(url);
    expect(html).not.toMatch(/<form/);
  }
});

it('leads with the headline as the title, and keeps the job title in the career section', () => {
  // His LinkedIn headline is what the site leads with; "CTO & Partner" is a
  // job title and belongs beside the job it describes, not in the hero.
  const html = readDist('index.html');
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)![1];
  // The last word is wrapped in <em> for the italic; the text itself is the i18n title.
  expect(h1.replace(/<[^>]+>/g, '')).toBe('Software Architect &amp; Engineer');
  expect(html).toMatch(/Thiego <em[^>]*>(?:"|&#34;|&quot;)Zeru(?:"|&#34;|&quot;)<\/em> Carvalho/);
  // Scoped to the visible hero. The meta description still names his current
  // role, which is the right copy for a search snippet.
  const hero = html.slice(html.indexOf('data-hero'), html.indexOf('data-marquee'));
  expect(hero).toContain('OSASCO/SP');
  expect(hero).not.toMatch(/CTO/);
  expect(html.slice(html.indexOf('id="career"'))).toMatch(/CTO &amp; Partner/);
});

it('renders the about prose in each locale', () => {
  expect(readDist('index.html')).toContain('1998');
  expect(readDist('pt/index.html')).toContain('1998');
});

it('always renders the text navigation, pointing at every section', () => {
  // Section links carry the locale's home path rather than a bare hash, so
  // that the same nav still resolves from /blog/. See tests/nav.test.ts.
  for (const [page, home] of [['index.html', '/'], ['pt/index.html', '/pt/']] as const) {
    const html = readDist(page);
    expect(html).toMatch(/<nav[^>]*data-text-nav/);
    for (const id of ['career', 'projects', 'about', 'contact'])
      expect(html, `${page} ${id}`).toContain(`href="${home}#${id}"`);
  }
});

it('lists six projects with a tag on each in the server-rendered HTML', () => {
  // Script is now allowed on the home pages (the carousel); what must hold is that
  // the project list does not depend on it. See tests/carousel.test.ts.
  for (const page of ['index.html', 'pt/index.html']) {
    const html = readDist(page);
    expect(countAttr(html, 'data-project-entry')).toBe(6);
    expect(countAttr(html, 'data-project-tag')).toBe(6);
  }
});

it('declares no fixed width that can overflow a 320px viewport', () => {
  expect(allStyles()).not.toMatch(/\bwidth:\s*\d{4,}px/);
  expect(readDist('index.html')).toMatch(/name="viewport"[^>]*width=device-width/);
});

// The regression that started Task 6b: prose must follow the page's locale.
it('serves English prose on / and Portuguese prose on /pt', () => {
  expect(readDist('index.html')).not.toContain('Certificação Imutável On-Chain');
  expect(readDist('pt/index.html')).toContain('Certificação Imutável On-Chain');
  expect(readDist('pt/index.html')).not.toContain('Builder for an amnesic');
  expect(readDist('index.html')).toContain('amnesic');
});
