// Plain Zod objects, importable from Node tests as well as from the Astro
// content config. Kept free of `astro:content` so the Vitest runner resolves them.
import { z } from 'astro/zod';

// One value per locale. Shared fields (company, tag, skills, location) stay single-valued.
export const localizedText = z.object({ en: z.string(), pt: z.string() });
export const localizedList = z.object({ en: z.array(z.string()), pt: z.array(z.string()) });

export const experienceSchema = z.object({
  role: localizedText,
  company: z.string(),
  employment: z.enum(['full-time', 'contract', 'freelance', 'part-time']).optional(),
  start: z.coerce.date(),
  end: z.coerce.date().optional(), // absent = current
  location: z.string(),
  arrangement: z.enum(['on-site', 'hybrid', 'remote']).optional(),
  highlights: localizedList,
  skills: z.array(z.string()).default([]),
  order: z.number(),
});

export const projectSchema = z.object({
  name: z.string(),
  kind: z.enum(['work', 'personal']),
  tag: z.string(),
  url: z.string().optional(),
  repo: z.string().optional(),
  summary: localizedText,
  tech: z.array(z.string()),
  order: z.number(),
});

export const postSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  draft: z.boolean().default(false),
  lang: z.enum(['en', 'pt']),
});

export const aboutSchema = z.object({
  lang: z.enum(['en', 'pt']),
});
