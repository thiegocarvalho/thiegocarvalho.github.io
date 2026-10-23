import matter from 'gray-matter';
import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { experienceSchema, projectSchema } from '../src/content/schemas';

const entries = globSync('src/content/experience/*.md')
  .map(f => experienceSchema.parse(matter(readFileSync(f, 'utf8')).data));

it('holds all 13 positions', () => {
  expect(entries).toHaveLength(13);
});
it('marks exactly one position as current', () => {
  const current = entries.filter(e => !e.end);
  expect(current).toHaveLength(1);
  expect(current[0].company).toBe('Defiverso');
});
it('carries role and highlights in both locales for all 13 positions', () => {
  for (const e of entries) {
    for (const lang of ['en', 'pt'] as const) {
      expect(e.role[lang].trim().length, `${e.company} role.${lang}`).toBeGreaterThan(0);
      expect(e.highlights[lang].length, `${e.company} highlights.${lang}`).toBeGreaterThan(0);
    }
  }
});
it('keeps the same number of highlights in both locales', () => {
  for (const e of entries) expect(e.highlights.en.length).toBe(e.highlights.pt.length);
});
it('carries every project summary in both locales', () => {
  for (const f of globSync('src/content/projects/*.md')) {
    const p = projectSchema.parse(matter(readFileSync(f, 'utf8')).data);
    for (const lang of ['en', 'pt'] as const) {
      expect(p.summary[lang].trim().length, `${p.name} summary.${lang}`).toBeGreaterThan(0);
    }
  }
});
