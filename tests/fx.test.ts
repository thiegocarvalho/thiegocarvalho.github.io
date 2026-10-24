import { gzipSync } from "node:zlib";
import { allHtml, allStyles } from "./helpers/dist";

const fxTag = (html: string) => [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].find((m) => /blocking=["']render["']/.test(m[1]));

describe("section transitions", () => {
  const css = allStyles();
  it("reveals panels and the footer CTA with a scroll-driven scan, as longhands inside no-preference", () => {
    expect(css).toMatch(/@keyframes scan-in/);
    expect(css).toMatch(/@supports\s*\(animation-timeline:\s*view\(\)\)\s*\{\s*@media\s*\(prefers-reduced-motion:\s*no-preference\)\s*\{\s*\[data-panel\],\s*\[data-contact-cta\]/);
    expect(css).toMatch(/animation-name:\s*scan-in/);
    expect(css).toMatch(/animation-fill-mode:\s*backwards/);
    expect(css).not.toMatch(/\.reveal\b/);
  });
  it("plays a channel switch only when `ch` is set, inside no-preference", () => {
    expect(css).toMatch(/@keyframes ch-off/);
    expect(css).toMatch(/html\.ch::view-transition-old\(root\)/);
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*no-preference\)\s*\{\s*html\.ch \[data-disk\]/);
  });
  it("keeps the disk morph untouched", () => {
    const group = css.match(/::view-transition-group\(\*\.disk\)\s*\{([^}]*)\}/)![1];
    expect(group).toMatch(/animation-duration:\s*0?\.55s/);
    expect(group).toMatch(/z-index:\s*10/);
    expect(group).toMatch(/cubic-bezier\(\.45,\s*0,\s*\.15,\s*1\)/);
    expect(css).toMatch(/@view-transition\s*\{\s*navigation:\s*auto/);
    const home = allHtml().find((p) => p.path === "index.html")!.html;
    expect(home).toMatch(/view-transition-name:\s*disk-gramovoice/);
    // the channel switch drops the names only under html.ch, which the script never sets for project pages
    expect(fxTag(home)![2]).toContain("projects");
  });
});
