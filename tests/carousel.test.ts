import matter from 'gray-matter';
import { globSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';
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

  // Changed in part 2: disks used to link to on-page #project-<slug> anchors; they now link to the project pages.
  it('draws one floppy per project, each a real link to its project page', () => {
    const disks = [...html.matchAll(/<a[^>]*\bdata-disk\b[^>]*>/g)].map((m) => m[0]);
    expect(disks).toHaveLength(6);
    for (const d of disks) {
      const target = d.match(/href="([^"]+)"/)![1];
      expect(target).toMatch(lang === 'pt' ? /^\/pt\/projects\/[a-z0-9-]+\/$/ : /^\/projects\/[a-z0-9-]+\/$/);
    }
  });

  it('gives every disk a stable slug and a disk-<slug> view-transition-name, ready for project pages', () => {
    const slugs = globSync('src/content/projects/*.md').map((f) => basename(f, '.md')).sort();
    expect(slugs).toHaveLength(6);
    const slots = [...html.matchAll(/<li[^>]*\bdata-slot\b[^>]*>/g)].map((m) => m[0]);
    expect(slots.map((s) => s.match(/data-slug="([^"]+)"/)![1]).sort()).toEqual(slugs);
    for (const slug of slugs) {
      expect(html, slug).toMatch(new RegExp(`<a[^>]*\\bdata-disk\\b[^>]*style="[^"]*view-transition-name:\\s*disk-${slug}(?:;|")`));
    }
    // Names must be unique per page, or the transition API ignores the duplicates.
    const names = [...html.matchAll(/view-transition-name:\s*(disk-[a-z0-9-]+)/g)].map((m) => m[1]);
    expect(new Set(names).size).toBe(names.length);
  });

  it('starts centred in the stack so the fan is symmetric', () => {
    const slots = [...html.matchAll(/<li[^>]*\bdata-slot\b[^>]*>/g)].map((m) => m[0]);
    const offsets = slots.map((s) => Number(s.match(/--o:(-?\d+)/)![1]));
    expect(offsets).toEqual([-2, -1, 0, 1, 2, 3]);
    const current = [...html.matchAll(/<a[^>]*\bdata-disk\b[^>]*>/g)].map((m) => m[0]).findIndex((d) => /aria-current="true"/.test(d));
    expect(current).toBe(2);
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
