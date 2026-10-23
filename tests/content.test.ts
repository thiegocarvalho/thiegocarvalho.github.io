import matter from 'gray-matter';
import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { experienceSchema } from '../src/content/schemas';

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
it('gives every position at least one highlight', () => {
  for (const e of entries) expect(e.highlights.length).toBeGreaterThan(0);
});
