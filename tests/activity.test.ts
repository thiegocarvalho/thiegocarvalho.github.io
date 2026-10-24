import { readDist } from "./helpers/dist";

// The graph is fetched at build time and left out when no token is available
// (local builds without GITHUB_TOKEN), so its shape is only asserted when it is there.
describe.each(["index.html", "pt/index.html"])("contribution graph on %s", (page) => {
  const html = readDist(page);
  const section = html.match(/<section[^>]*id="activity"[\s\S]*?<\/section>/)?.[0];

  it("sits right after the projects, or is absent without breaking the page", () => {
    if (!section) return expect(html).toContain('id="projects"');
    expect(html.indexOf('id="activity"')).toBeGreaterThan(html.indexOf('id="projects"'));
  });

  it.runIf(section)("draws a year of days as static cells, labelled for assistive tech", () => {
    const days = section!.match(/<p class="days[^"]*"[^>]*>([\s\S]*?)<\/p>/)!;
    expect(days[0]).toMatch(/role="img" aria-label="[\d.,]+ /);
    const cells = days[1].match(/<i\b/g)!.length;
    expect(cells).toBeGreaterThanOrEqual(365);
    expect(cells).toBeLessThanOrEqual(371);
    expect(days[1]).toMatch(/<i[^>]*title="[\d.,]+ · /);
    expect(section).not.toContain("<script");
    expect(section).toMatch(/[\d.,]+ CONTRIBU/);
    expect(section).toContain('href="https://github.com/thiegocarvalho"');
  });
});
