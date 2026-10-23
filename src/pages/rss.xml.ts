import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { localizePath } from '../i18n/utils';
import type { Lang } from '../i18n/ui';

export async function GET(context: APIContext) {
  const posts = (await getCollection('posts', (p) => !p.data.draft)).sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );
  return rss({
    title: 'Thiego "Zeru" Carvalho',
    description: 'Writing on architecture, payments and product.',
    site: context.site!,
    items: posts.map((p) => {
      const [lang, ...rest] = p.id.split('/');
      return {
        title: p.data.title,
        description: p.data.description,
        pubDate: p.data.pubDate,
        link: localizePath(`/blog/${rest.join('/')}/`, lang as Lang),
      };
    }),
  });
}
