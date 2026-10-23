// Plain Zod objects, importable from Node tests as well as from the Astro
// content config. Kept free of `astro:content` so the Vitest runner resolves them.
import { z } from 'astro/zod';

export const experienceSchema = z.object({
  role: z.string(),
  company: z.string(),
  employment: z.enum(['full-time', 'contract', 'freelance', 'part-time']).optional(),
  start: z.coerce.date(),
  end: z.coerce.date().optional(), // absent = current
  location: z.string(),
  arrangement: z.enum(['on-site', 'hybrid', 'remote']).optional(),
  highlights: z.array(z.string()),
  skills: z.array(z.string()).default([]),
  order: z.number(),
});

export const projectSchema = z.object({
  name: z.string(),
  status: z.string(),
  kind: z.enum(['work', 'personal']),
  tag: z.string(),
  url: z.string().optional(),
  repo: z.string().optional(),
  summary: z.string(),
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
