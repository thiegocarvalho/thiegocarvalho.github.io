import { ui, type Lang, type UiKey } from './ui';

export const LANGS: Lang[] = ['en', 'pt'];

/** Document language tag: short form in routes and props, full tag in markup. */
export const htmlLang = (lang: Lang): string => (lang === 'pt' ? 'pt-br' : 'en');

export function useTranslations(lang: Lang) {
  return (key: UiKey): string => ui[lang][key] ?? ui.en[key];
}

/**
 * `path` is the locale-neutral path as served for English ("/", "/blog/x/").
 * English is unprefixed; Portuguese gets a `/pt` prefix.
 */
export function localizePath(path: string, lang: Lang): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return lang === 'en' ? clean : `/pt${clean}`;
}

/**
 * hreflang entries for exactly the locales a page exists in. Never emits a
 * locale outside `availableLangs`; `x-default` only when `en` is present.
 */
export function alternatesFor(
  path: string,
  availableLangs: Lang[],
): { lang: string; href: string }[] {
  const entries = LANGS.filter((l) => availableLangs.includes(l)).map((l) => ({
    lang: htmlLang(l),
    href: localizePath(path, l),
  }));
  if (availableLangs.includes('en')) {
    entries.push({ lang: 'x-default', href: localizePath(path, 'en') });
  }
  return entries;
}
