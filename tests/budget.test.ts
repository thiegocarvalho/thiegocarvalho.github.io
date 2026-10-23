import { allHtml, allStyles, distFiles } from "./helpers/dist";

describe("Stage A budgets", () => {
  it("ships no JavaScript bundle in Stage A", () => {
    for (const { path, html } of allHtml()) {
      expect(html, path).not.toMatch(/<script[^>]+src=/);
    }
    expect(distFiles("**/*.js")).toEqual([]);
  });

  it("ships no executable inline script either", () => {
    for (const { path, html } of allHtml()) {
      const executable = [...html.matchAll(/<script\b([^>]*)>/g)].filter(
        (m) => !/type=["']?(application\/ld\+json|application\/json)/.test(m[1]),
      );
      expect(executable.length, path).toBe(0);
    }
  });

  it("keeps each page under 150kb of HTML", () => {
    for (const { path, html } of allHtml()) {
      expect(Buffer.byteLength(html), path).toBeLessThan(150_000);
    }
  });

  it("keeps total CSS under 60kb", () => {
    expect(Buffer.byteLength(allStyles())).toBeLessThan(60_000);
  });
});
