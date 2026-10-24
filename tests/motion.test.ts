import { allHtml, allStyles, distFiles } from './helpers/dist';

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
