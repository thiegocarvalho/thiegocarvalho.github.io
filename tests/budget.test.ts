import { gzipSync } from "node:zlib";
import { allHtml, allStyles, distFiles, readDist } from "./helpers/dist";

// Script budget: the two home pages carry the floppy carousel; the project pages carry one tiny
// inline eject script (<= 1 KB gzipped, asserted below). Nothing else ships JS.
const HOME_PAGES = ["index.html", "pt/index.html"];

const allScriptTags = (html: string) =>
  [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].map((m) => ({ attrs: m[1], body: m[2] }));
const scriptTags = allScriptTags;
const isExecutable = (attrs: string) => !/type=["']?(application\/ld\+json|application\/json)/.test(attrs);

describe("JavaScript budget", () => {
  it("ships no script on any page except the home and project pages", () => {
    for (const { path, html } of allHtml()) {
      if (HOME_PAGES.includes(path) || /(^|\/)projects\/[^/]+\/index\.html$/.test(path)) continue;
      expect(scriptTags(html), path).toHaveLength(0);
    }
  });

  it("ships zero JS on the profile pages (sticky timeline and scroll animation stay pure CSS)", () => {
    for (const page of ["about/index.html", "pt/about/index.html"]) {
      expect(allScriptTags(readDist(page)), page).toHaveLength(0);
    }
  });

  it("ships only one tiny inline eject script (<= 1 KB gzipped) on the 12 project pages", () => {
    // The script only delays navigation for the eject animation; the link works without it.
    const pages = distFiles("**/projects/*/index.html");
    expect(pages).toHaveLength(12);
    for (const page of pages) {
      const tags = scriptTags(readDist(page));
      expect(tags, page).toHaveLength(1);
      expect(tags[0].attrs, page).toMatch(/type=["']module["']/);
      expect(tags[0].attrs, page).not.toMatch(/src=/);
      expect(gzipSync(tags[0].body).length, page).toBeLessThanOrEqual(1024);
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
      const inline = allScriptTags(html).filter((t) => isExecutable(t.attrs)).map((t) => t.body);
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
