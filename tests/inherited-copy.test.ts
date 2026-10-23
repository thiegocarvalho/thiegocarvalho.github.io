import { allHtml } from './helpers/dist';

const FORBIDDEN = ['Oscar Hernandez', 'Valle del cauca', 'Colombia'];

describe('no inherited template copy survives the build', () => {
  it.each(FORBIDDEN)('never contains %s', (needle) => {
    const hits = allHtml().filter(p => p.html.includes(needle)).map(p => p.path);
    expect(hits).toEqual([]);
  });
});
