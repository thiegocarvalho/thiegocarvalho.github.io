export type Lang = 'en' | 'pt';

export const ui = {
  en: {
    'nav.career': 'Career',
    'nav.projects': 'Projects',
    'nav.about': 'About',
    'nav.blog': 'Blog',
    'nav.contact': 'Contact',
    'blog.empty': 'Nothing written here yet.',
    'experience.present': 'Present',
  },
  pt: {
    'nav.career': 'Carreira',
    'nav.projects': 'Projetos',
    'nav.about': 'Sobre',
    'nav.blog': 'Blog',
    'nav.contact': 'Contato',
    'blog.empty': 'Nada escrito aqui ainda.',
    'experience.present': 'Atual',
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type UiKey = keyof (typeof ui)['en'];
