import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { allStyles, allHtml, readDist } from "./helpers/dist";

// allStyles() is a guard that four later tasks lean on: it exists so that a CSS
// assertion can never pass by reading nothing. An unexercised guard is not a
// guard, so both of its branches are pinned here.
describe("allStyles", () => {
  it("returns the real CSS of the current build", () => {
    const css = allStyles();
    expect(css.trim().length).toBeGreaterThan(0);
    // Tailwind's preflight is in every build; if this stops matching, the
    // helper has started reading something other than the site's stylesheet.
    expect(css).toMatch(/box-sizing|::backdrop|\*,/);
  });

  it("throws rather than returning an empty corpus when a build has no CSS", () => {
    const cwd = process.cwd();
    const tmp = mkdtempSync(join(tmpdir(), "allstyles-"));
    try {
      mkdirSync(join(tmp, "dist"));
      writeFileSync(join(tmp, "dist", "index.html"), "<html><body>no css</body></html>");
      process.chdir(tmp);
      expect(() => allStyles()).toThrow(/no CSS found/i);
    } finally {
      process.chdir(cwd);
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});

describe("readDist", () => {
  it("throws a build-shaped message for a file that is not there", () => {
    expect(() => readDist("nope/missing.html")).toThrow(/was the site built/i);
  });
});

describe("allHtml", () => {
  it("returns paths that readDist accepts", () => {
    const pages = allHtml();
    expect(pages.length).toBeGreaterThan(0);
    for (const { path } of pages) expect(() => readDist(path)).not.toThrow();
  });
});
