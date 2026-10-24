import { allHtml, allStyles, distFiles, readDist } from './helpers/dist';

// Replaces the DeskPoster assertions: the poster was a placeholder for a 3D
// scene that is not coming, so the invariant now is that nothing of it ships.
it('ships no desk poster, markup or asset', () => {
  for (const { path, html } of allHtml()) expect(html, path).not.toMatch(/data-desk-poster|desk-poster/);
  expect(distFiles('**/desk-poster*')).toEqual([]);
});

it('disables decorative motion under prefers-reduced-motion', () => {
  const css = allStyles();
  expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
  expect(css).toMatch(/prefers-reduced-motion:\s*reduce\)\s*\{[^}]*\{[^}]*animation:\s*none/);
});

// The page must always scroll normally: no scroll-jacking, no gating.
it('never locks or hijacks page scroll', () => {
  const css = allStyles();
  expect(css).not.toMatch(/scroll-snap-type:\s*y/);
  expect(css).not.toMatch(/(?:^|[},\s])(?:html|body)\s*\{[^}]*overflow(?:-y)?:\s*hidden/);
  for (const { path, html } of allHtml()) {
    expect(html, path).not.toMatch(/addEventListener\(["']wheel["']|addEventListener\(["']touchmove["']/);
  }
});

it('scopes the scroll-in reveal to browsers with scroll-driven animations', () => {
  expect(allStyles()).toMatch(/@supports\s*\(animation-timeline:\s*view\(\)\)/);
});

// A minifier folds `animation-name/-timing/-fill` plus `animation-timeline` into
// the `animation` shorthand with a trailing `view()`, and Chrome then silently
// ignores the whole animation. Every scroll-driven animation therefore has to
// survive the build as longhands; this caught a dead reveal in the first pass.
it('ships scroll-driven animations as longhands the browser actually honours', () => {
  const css = allStyles();
  expect(css).not.toMatch(/animation:[^;}]*\b(view|scroll)\(/);
  expect(css).toMatch(/animation-timeline:\s*view\(\)/);
});

it('drives the hero exit, the disk fan and the career records from scroll position', () => {
  const css = allStyles();
  for (const name of ['hero-away', 'fan-out', 'file-in'])
    expect(css, name).toMatch(new RegExp(`animation-name:\\s*${name}`));
});

it('falls back to the finished fan where scroll-driven animation is unsupported', () => {
  const css = allStyles();
  // --fan is registered with initial value 1 (fanned), and only animated inside @supports + no-preference.
  expect(css).toMatch(/@property\s+--fan\s*\{[^}]*initial-value:\s*1/);
  expect(css).toMatch(/@supports\s*\(animation-timeline:\s*view\(\)\)\s*\{\s*@media\s*\(prefers-reduced-motion:\s*no-preference\)[^{]*\{\s*\.track/);
});

it('keeps the career year column sticky and the profile page script-free', () => {
  expect(allStyles()).toMatch(/\.when[^{]*\{[^}]*position:\s*sticky/);
  expect(readDist('about/index.html')).not.toMatch(/<script\b/);
});
