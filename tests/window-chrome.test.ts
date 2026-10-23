import { allStyles, readDist } from './helpers/dist';

const page = () => readDist('index.html');

describe('window chrome markup', () => {
  it('renders every window as a real <section> with a title bar carrying its title', () => {
    const m = page().match(/<section\b[^>]*\bdata-window\b[^>]*>([\s\S]*?)<\/section>/);
    expect(m, 'no <section data-window> in index.html').not.toBeNull();
    expect(m![1]).toMatch(/<h2\b[^>]*>\s*[^<\s][^<]*<\/h2>/);
  });

  it('labels the section by its heading', () => {
    expect(page()).toMatch(/<section\b[^>]*aria-labelledby="([^"]+)"/);
  });

  it('keeps the close box decorative: hidden from AT, not a control', () => {
    const html = page();
    expect(html).toMatch(/data-window-close[^>]*aria-hidden="true"/);
    expect(html).not.toMatch(/<button\b[^>]*data-window-close/);
  });

  it('ships no script', () => {
    expect(page()).not.toMatch(/<script\b/);
  });
});

describe('window chrome styles', () => {
  it('uses no rounded corners on window chrome', () => {
    const css = allStyles();
    expect(css).toMatch(/data-window/); // the rules exist, so the negative below is not blind
    expect(css).not.toMatch(/\[data-window[^{]*\{[^}]*border-radius:\s*(?!0)/);
  });

  it('uses no blur or soft shadow on window chrome', () => {
    const rules = allStyles().match(/[^{}]*data-window[^{}]*\{[^}]*\}/g) ?? [];
    expect(rules.length).toBeGreaterThan(0);
    for (const r of rules) expect(r).not.toMatch(/blur\(|box-shadow:[^;]*\d+(px)?\s+\d+(px)?\s+[1-9]\d*(px)\s/);
  });

  it('defines the semantic tokens', () => {
    const css = allStyles();
    for (const t of ['surface', 'bevel-light', 'bevel-dark', 'accent-cyan', 'accent-magenta'])
      expect(css).toContain(`--color-${t}`);
  });
});
