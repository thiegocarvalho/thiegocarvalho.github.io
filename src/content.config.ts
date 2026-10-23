import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { aboutSchema, experienceSchema, postSchema, projectSchema } from './content/schemas';

const experience = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/experience' }),
  schema: experienceSchema,
});

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: projectSchema,
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: postSchema,
});

const about = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/about' }),
  schema: aboutSchema,
});

export const collections = { experience, projects, posts, about };
