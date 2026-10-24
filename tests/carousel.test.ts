import matter from 'gray-matter';
import { globSync, readFileSync } from 'node:fs';
import { readDist } from './helpers/dist';
import { projectSchema } from '../src/content/schemas';

const projects = globSync('src/content/projects/*.md')
  .map((f) => projectSchema.parse(matter(readFileSync(f, 'utf8')).data))
  .sort((a, b) => a.order - b.order);

// Text is escaped by Astro; compare against the escaped form so the check is about presence, not escaping.
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&#34;');

// The carousel's contract: the HTML alone carries every project, so with no
// script the row of disks is still a readable, swipeable list.
describe.each([
  ['index.html', 'en'],
  ['pt/index.html', 'pt'],
] as const)('floppy carousel without JavaScript (%s)', (page, lang) => {
  const html = readDist(page);

  it('has six projects', () => expect(projects).toHaveLength(6));

  it('renders every project name, tag, localized summary and link', () => {
    for (const p of projects) {
      expect(html, `${p.name} name`).toContain(esc(p.name));
      expect(html, `${p.name} tag`).toContain(`>${esc(p.tag)}<`);
      expect(html, `${p.name} summary`).toContain(esc(p.summary[lang]));
      if (p.url) expect(html, `${p.name} url`).toContain(`href="${p.url}"`);
      if (p.repo) expect(html, `${p.name} repo`).toContain(`href="${p.repo}"`);
    }
  });

  it('draws one floppy per project, each a real link to its details', () => {
    const disks = [...html.matchAll(/<a[^>]*\bdata-disk\b[^>]*>/g)].map((m) => m[0]);
    expect(disks).toHaveLength(6);
    for (const d of disks) {
      const target = d.match(/href="#([^"]+)"/)![1];
      expect(html).toContain(`id="${target}"`);
    }
  });

  it('is an accessible labelled region with a focusable, labelled track and a live status', () => {
    expect(html).toMatch(/<div[^>]*data-carousel[^>]*role="region"[^>]*aria-label="[^"]+"/);
    expect(html).toMatch(/<ol[^>]*data-track[^>]*tabindex="0"[^>]*aria-label="[^"]+"/);
    expect(html).toMatch(/<p[^>]*data-status[^>]*aria-live="polite"/);
    expect(html).toMatch(/data-disk[^>]*aria-current="true"/);
    expect(html).toMatch(/<button[^>]*data-prev[^>]*aria-label/);
    expect(html).toMatch(/<button[^>]*data-next[^>]*aria-label/);
  });
});
