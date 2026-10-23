import { allStyles, readDist } from './helpers/dist';

it('ships a poster with intrinsic dimensions on both home pages', () => {
  for (const page of ['index.html', 'pt/index.html']) {
    const html = readDist(page);
    expect(html).toMatch(/data-desk-poster/);
    expect(html).toMatch(/data-desk-poster[^>]*width="\d+"[^>]*height="\d+"/);
    expect(html).not.toMatch(/data-desk-poster[^>]*loading="lazy"/);
  }
});
it('disables decorative motion under prefers-reduced-motion', () => {
  expect(allStyles()).toMatch(/prefers-reduced-motion/);
});
