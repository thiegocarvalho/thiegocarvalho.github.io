import { gzipSync } from "node:zlib";
import { allHtml, allStyles, distFiles, readDist } from "./helpers/dist";

// Script budget: every page carries the one shared pointer-trail/channel-switch module (<= 1 KB gz,
// see fx.test.ts); the two home pages add the floppy carousel; the project pages add one tiny
// inline eject script (<= 1 KB gzipped, asserted below). Nothing else ships JS.
const HOME_PAGES = ["index.html", "pt/index.html"];

const allScriptTags = (html: string) =>
  [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].map((m) => ({ attrs: m[1], body: m[2] }));
// The shared fx script is inline and carries blocking="render"; everything else is counted by the tests below.
const isFx = (t: { attrs: string }) => /blocking=["']render["']/.test(t.attrs);
const scriptTags = (html: string) => allScriptTags(html).filter((t) => !isFx(t));
const isExecutable = (attrs: string) => !/type=["']?(application\/ld\+json|application\/json)/.test(attrs);

describe("JavaScript budget", () => {
  // Changed: "no script" now means no script beyond the shared fx module, which every page carries.
  it("ships no script on any page except the home and project pages", () => {
    for (const { path, html } of allHtml()) {
      if (HOME_PAGES.includes(path) || /(^|\/)projects\/[^/]+\/index\.html$/.test(path)) continue;
      expect(scriptTags(html), path).toHaveLength(0);
    }
  });

  // Changed: was "zero JS"; the profile pages now carry only the shared fx module (sticky timeline and scroll animation stay pure CSS).
  it("ships nothing but the shared fx module on the profile pages", () => {
    for (const page of ["about/index.html", "pt/about/index.html"]) {
      expect(scriptTags(readDist(page)), page).toHaveLength(0);
      expect(allScriptTags(readDist(page)), page).toHaveLength(1);
    }
  });

  it("ships only one tiny inline eject script (<= 1 KB gzipped) besides fx on the 12 project pages", () => {
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
