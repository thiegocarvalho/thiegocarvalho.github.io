import { allStyles, readDist } from './helpers/dist';

const page = () => readDist('index.html');

describe('HUD panel markup', () => {
  it('renders each panel as a real <section> labelled by its heading', () => {
    // Replaces the Win3.11 window-markup assertion: the invariant is semantic structure, not bevels.
    const sections = [...page().matchAll(/<section\b[^>]*\bdata-panel\b[^>]*>([\s\S]*?)<\/section>/g)];
    expect(sections.length).toBe(2); // changed: home is blog + projects (contact is the footer CTA)
    for (const m of sections) {
      expect(m[0]).toMatch(/aria-labelledby="([^"]+)"/);
      expect(m[1]).toMatch(/<h2\b[^>]*>\s*[^<\s][^<]*<\/h2>/);
    }
  });

  it('numbers the sections in the dossier voice, hidden from assistive tech', () => {
    const html = page();
    for (const n of ['01', '02']) expect(html).toMatch(new RegExp(`data-panel-index[^>]*aria-hidden="true"[^>]*>// ${n} —`));
  });

  it('keeps the Windows 3.11 chrome out of every page', () => {
    // Replaces the old bevel/rounded-corner assertions: that chrome is gone, so pin its absence.
    expect(page()).not.toMatch(/data-window/);
    expect(allStyles()).not.toMatch(/data-window|--color-bevel|--color-bar-/);
  });
});

describe('HUD hero', () => {
  it('carries only labels grounded in the content', () => {
    const html = page();
    expect(html).toContain('FILE 001-ZERU // OSASCO/SP — BRAZIL');
    // STACK and BOOT labels were removed on request (the profile page covers the stack).
    expect(html).not.toContain('STACK:');
    expect(html).not.toContain('BOOT:');
    expect(html).toContain('STATUS: AVAILABLE');
    expect(readDist('pt/index.html')).toContain('STATUS: DISPONÍVEL');
  });

  it('draws the skills marquee (profile page) and hazard stripe as decoration, not content', () => {
    // The marquee moved with the about text to the profile page; home keeps only the stripe.
    const html = page();
    expect(readDist('about/index.html')).toMatch(/data-marquee[^>]*aria-hidden="true"/);
    expect(html).not.toMatch(/data-marquee/);
    expect(html).toMatch(/class="hazard"[^>]*aria-hidden="true"|aria-hidden="true"[^>]*class="hazard"/);
  });
});

describe('HUD styles', () => {
  it('defines the semantic tokens, including the hazard yellow', () => {
    const css = allStyles();
    for (const t of ['surface', 'line', 'accent-cyan', 'accent-magenta', 'hazard'])
      expect(css).toContain(`--color-${t}`);
  });

  it('animates the marquee with CSS only', () => {
    expect(allStyles()).toMatch(/@keyframes\s+[\w-]*scroll/);
  });
});

describe('hero glitch', () => {
  it('highlights SOFTWARE with decorative glitch layers, in both locales', () => {
    for (const p of ['index.html', 'pt/index.html']) {
      expect(readDist(p), p).toMatch(/<em[^>]*data-text="Software"[^>]*>Software<\/em>/);
    }
  });
  it('glitches in CSS only, with longhand animation, hidden from assistive tech and off under reduced motion', () => {
    const css = allStyles();
    expect(css).toMatch(/@keyframes glitch-a/);
    expect(css).toMatch(/content:\s*attr\(data-text\)\s*\/\s*(""|'')/);
    expect(css).toMatch(/animation-name:\s*glitch-a/);
    expect(css).toMatch(/prefers-reduced-motion:\s*no-preference\)\s*\{[^@]*animation-name:\s*glitch-a/);
    expect(css).toMatch(/animation-iteration-count:\s*infinite/);
  });
});

describe('hero CRT', () => {
  it('keeps the title as the h1 inside the monitor, with the name beside it, in both locales', () => {
    for (const [p, title] of [['index.html', 'Software Architect &amp; Engineer'], ['pt/index.html', 'Arquiteto &amp; Engenheiro de Software']] as const) {
      const html = readDist(p);
      const crt = html.match(/<div class="crt[^"]*"[\s\S]*?<\/h1>/)![0];
      expect(crt, p).toMatch(/class="glass/);
      expect(crt.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)![1].replace(/<[^>]+>/g, ''), p).toBe(title);
      expect(html.indexOf('class="name'), p).toBeLessThan(html.indexOf('<h1'));
    }
  });
  it('draws the monitor in CSS with scanlines, a decorative power-on only under no-preference, and its own scroll exit', () => {
    const css = allStyles();
    expect(css).toMatch(/\.glass[^{]*:after\{[^}]*repeating-linear-gradient/);
    expect(css).toMatch(/prefers-reduced-motion:\s*no-preference\)\s*\{[^@]*animation-name:\s*power-on/);
    expect(css).toMatch(/animation-name:\s*crt-away/);
    // the title waits for the tube to light, but only under no-preference and never past ~1.3s
    const on = css.match(/\.glass[^{\s]* h1[^{]*\{([^}]*animation-name:\s*title-on[^}]*)\}/)![1];
    const sec = (k: string) => parseFloat(on.match(new RegExp(`animation-${k}:\\s*([\\d.]+)s`))![1]);
    expect(sec('delay') + sec('duration')).toBeLessThanOrEqual(1.3);
    expect(css).toMatch(/prefers-reduced-motion:\s*no-preference\)\s*\{[^@]*title-on/);
  });
});
