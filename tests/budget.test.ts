import { gzipSync } from "node:zlib";
import { allHtml, allStyles, distFiles, readDist } from "./helpers/dist";

// The only pages allowed to carry script: the two home pages ship the floppy
// carousel. Everything else stays at zero JS.
const HOME_PAGES = ["index.html", "pt/index.html"];

const scriptTags = (html: string) =>
  [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].map((m) => ({ attrs: m[1], body: m[2] }));
const isExecutable = (attrs: string) => !/type=["']?(application\/ld\+json|application\/json)/.test(attrs);

describe("JavaScript budget", () => {
  it("ships no script on any page except the home pages", () => {
    for (const { path, html } of allHtml()) {
      if (HOME_PAGES.includes(path)) continue;
      expect(html, path).not.toMatch(/<script\b/);
    }
  });

  it("ships zero JS on the profile pages (sticky timeline and scroll animation are pure CSS)", () => {
    for (const page of ["about/index.html", "pt/about/index.html"]) {
      expect(readDist(page), page).not.toMatch(/<script\b/);
    }
  });

  it("emits JS bundles only for the home pages' carousel", () => {
    // Every emitted .js file must be referenced by a home page; nothing else may ship one.
    const referenced = HOME_PAGES.flatMap((p) => [...readDist(p).matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1].replace(/^\//, "")));
    expect(distFiles("**/*.js").sort()).toEqual([...new Set(referenced)].sort());
  });

  it("loads home-page script as type=module only", () => {
    for (const page of HOME_PAGES) {
      const tags = scriptTags(readDist(page)).filter((t) => isExecutable(t.attrs));
      expect(tags.length, page).toBeGreaterThan(0);
      for (const t of tags) expect(t.attrs, page).toMatch(/type=["']module["']/);
    }
  });

  it("keeps all JS on each home page under 10 KB gzipped", () => {
    for (const page of HOME_PAGES) {
      const html = readDist(page);
      const inline = scriptTags(html).filter((t) => isExecutable(t.attrs)).map((t) => t.body);
      const external = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => readDist(m[1].replace(/^\//, "")));
      const total = [...inline, ...external].reduce((n, js) => n + gzipSync(js).length, 0);
      expect(total, page).toBeGreaterThan(0);
      expect(total, page).toBeLessThan(10 * 1024);
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
