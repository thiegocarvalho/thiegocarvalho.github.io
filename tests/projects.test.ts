import matter from 'gray-matter';
import { globSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { allStyles, readDist } from './helpers/dist';
import { projectSchema } from '../src/content/schemas';

const SITE = 'https://thiegocarvalho.github.io';
const projects = globSync('src/content/projects/*.md')
  .map((f) => ({ slug: basename(f, '.md'), ...projectSchema.parse(matter(readFileSync(f, 'utf8')).data) }))
  .sort((a, b) => a.order - b.order);
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&#34;');
const route = (slug: string, lang: 'en' | 'pt') => (lang === 'pt' ? `/pt/projects/${slug}/` : `/projects/${slug}/`);
const file = (slug: string, lang: 'en' | 'pt') => `${route(slug, lang).slice(1)}index.html`;

describe('project pages', () => {
  it('exist for all 6 projects in both locales', () => {
    expect(projects).toHaveLength(6);
    for (const p of projects) for (const l of ['en', 'pt'] as const) expect(() => readDist(file(p.slug, l)), route(p.slug, l)).not.toThrow();
  });

  describe.each(projects.flatMap((p) => (['en', 'pt'] as const).map((l) => [p, l] as const)))('%#', (p, lang) => {
    const html = readDist(file(p.slug, lang));
    const other = route(p.slug, lang === 'en' ? 'pt' : 'en');

    it(`${route(p.slug, lang)}: title, description, canonical, hreflang pair`, () => {
      expect(html).toContain(`<html lang="${lang === 'pt' ? 'pt-br' : 'en'}"`);
      expect(html).toContain(`<title>${p.name} — Thiego &quot;Zeru&quot; Carvalho</title>`);
      const desc = html.match(/<meta name="description" content="([^"]+)"/)![1];
      const decoded = desc.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      expect(decoded.startsWith(p.summary[lang].slice(0, 60))).toBe(true);
      expect(decoded.length).toBeLessThanOrEqual(160);
      expect(html).toContain(`<link rel="canonical" href="${SITE}${route(p.slug, lang)}"`);
      expect(html).toContain(`hreflang="en" href="${SITE}/projects/${p.slug}/"`);
      expect(html).toContain(`hreflang="pt-br" href="${SITE}/pt/projects/${p.slug}/"`);
      expect(html).toContain(`hreflang="x-default" href="${SITE}/projects/${p.slug}/"`);
    });

    it('carries the full localized summary, tech and links in the HTML, with no script beyond the eject hook', () => {
      expect(html).toContain(esc(p.summary[lang]));
      for (const t of p.tech) expect(html).toContain(esc(t));
      if (p.url) expect(html).toContain(`href="${p.url}"`);
      if (p.repo) expect(html).toContain(`href="${p.repo}"`);
      // the eject hook plus the footer phone's dial script
      expect(html.match(/<script\b/g)).toHaveLength(2);
    });

    it('has a way back to the home projects, in the page and in the terminal, and the language switch', () => {
      const home = lang === 'pt' ? '/pt/' : '/';
      expect(html.match(new RegExp(`href="${home}\\?disk=${p.slug}#projects"[^>]*>(?:&lt;|<)`, 'g'))!.length).toBeGreaterThanOrEqual(2);
      expect(html).toMatch(new RegExp(`data-lang-switch[\\s\\S]{0,120}href="${other}"`));
    });

    it('puts the same view-transition-name on the drive disk as on the home disk', () => {
      const name = `view-transition-name:disk-${p.slug}`;
      expect(html).toContain(name);
      expect(readDist(lang === 'pt' ? 'pt/index.html' : 'index.html')).toContain(name);
    });
  });

  it('home disks link to the right localized project page', () => {
    for (const [page, lang] of [['index.html', 'en'], ['pt/index.html', 'pt']] as const) {
      const html = readDist(page);
      for (const p of projects) {
        const disk = html.match(new RegExp(`<a[^>]*\\bdata-disk\\b[^>]*view-transition-name:disk-${p.slug}[^>]*>`))![0];
        expect(disk, p.slug).toContain(`href="${route(p.slug, lang)}"`);
        // the always-visible detail text offers the same link for non-pointer users
        expect(html).toContain(`class="open" href="${route(p.slug, lang)}"`);
      }
    }
  });
});

describe('transition and drive CSS', () => {
  const css = allStyles();

  it('opts in to cross-document view transitions', () => {
    expect(css).toMatch(/@view-transition\s*\{\s*navigation:\s*auto/);
  });

  it('shapes the disk flight with a view-transition-class', () => {
    expect(css).toMatch(/::view-transition-group\(\*\.disk\)\{[^}]*animation-duration/);
    expect(readDist('index.html')).toContain('view-transition-class:disk');
  });

  it('keeps the view transition off under reduced motion', () => {
    expect(css).toMatch(/prefers-reduced-motion:\s*no-preference\)\s*\{\s*@view-transition/);
  });

  it('runs the drive and terminal sequence only under no-preference, with the finished state as the base style', () => {
    const m = css.match(/@media\s*\(prefers-reduced-motion:\s*no-preference\)\s*\{[^@]*?animation-name:\s*insert-disk[\s\S]*?\}\s*\}/);
    expect(m, 'drive sequence is inside a no-preference block').not.toBeNull();
    expect(css).toMatch(/@keyframes\s+\S*insert-disk/);
    expect(css).toMatch(/@keyframes\s+\S*rise/);
    // global reduced-motion rule still kills every animation, including the sequence
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce\)\s*\{\s*\*[\s\S]*?animation:\s*none\s*!important/);
  });

  it('shows the disk lying flat and fully inside the front-loading drive, with real thickness, no rounded corners', () => {
    expect(css).toMatch(/\.insert[^{]*\.tilt[^{]*\{[^}]*rotateX\(68deg\)/);
    expect(css).toMatch(/\.insert\[[^\]]+\]\{[^}]*translateY\(calc\(var\(--w\) \* -\.8\)\)/);
    const html = readDist('projects/gramovoice/index.html');
    expect((html.match(/class="[^"]*\bedge\b/g) ?? []).length).toBe(5);
    expect(css).not.toMatch(/\.floppy\{[^}]*border-radius/);
  });
});
