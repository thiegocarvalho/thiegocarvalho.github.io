import { allStyles, readDist } from './helpers/dist';

const page = () => readDist('index.html');

describe('HUD panel markup', () => {
  it('renders each panel as a real <section> labelled by its heading', () => {
    // Replaces the Win3.11 window-markup assertion: the invariant is semantic structure, not bevels.
    const sections = [...page().matchAll(/<section\b[^>]*\bdata-panel\b[^>]*>([\s\S]*?)<\/section>/g)];
    expect(sections.length).toBe(4);
    for (const m of sections) {
      expect(m[0]).toMatch(/aria-labelledby="([^"]+)"/);
      expect(m[1]).toMatch(/<h2\b[^>]*>\s*[^<\s][^<]*<\/h2>/);
    }
  });

  it('numbers the sections in the dossier voice, hidden from assistive tech', () => {
    const html = page();
    for (const n of ['01', '02', '03', '04']) expect(html).toMatch(new RegExp(`data-panel-index[^>]*aria-hidden="true"[^>]*>// ${n} —`));
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
    expect(html).toContain('STACK: NODE.JS · PYTHON · SOLIDITY');
    expect(html).toContain('STATUS: AVAILABLE');
    expect(readDist('pt/index.html')).toContain('STATUS: DISPONÍVEL');
  });

  it('draws the skills marquee and hazard stripe as decoration, not content', () => {
    const html = page();
    expect(html).toMatch(/data-marquee[^>]*aria-hidden="true"/);
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
