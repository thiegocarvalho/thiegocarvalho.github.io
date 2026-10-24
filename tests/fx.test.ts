import { allHtml, allStyles } from "./helpers/dist";


describe("pixel cursors", () => {
  const css = allStyles();
  it("defines arrow, hand and I-beam cursors as SVG data URIs with a keyword fallback", () => {
    expect(css).toMatch(/cursor:\s*url\("data:image\/svg\+xml,[^"]+"\)\s*\d+\s+\d+,\s*default/);
    expect(css).toMatch(/cursor:\s*url\("data:image\/svg\+xml,[^"]+"\)\s*\d+\s+\d+,\s*pointer/);
    expect(css).toMatch(/cursor:\s*url\("data:image\/svg\+xml,[^"]+"\)\s*\d+\s+\d+,\s*text/);
  });
  it("uses crisp pixel art no larger than 32px", () => {
    const uris = [...css.matchAll(/cursor:\s*url\("data:image\/svg\+xml,([^"]+)"\)/g)].map((m) => decodeURIComponent(m[1]));
    expect(uris).toHaveLength(3);
    for (const svg of uris) {
      expect(svg).toMatch(/crispEdges/);
      expect(Number(svg.match(/width='(\d+)'/)![1])).toBeLessThanOrEqual(32);
      expect(Number(svg.match(/height='(\d+)'/)![1])).toBeLessThanOrEqual(32);
    }
  });
});

describe("section transitions", () => {
  const css = allStyles();
  it("reveals panels and the footer CTA with a scroll-driven scan, as longhands inside no-preference", () => {
    expect(css).toMatch(/@keyframes scan-in/);
    expect(css).toMatch(/@supports\s*\(animation-timeline:\s*view\(\)\)\s*\{\s*@media\s*\(prefers-reduced-motion:\s*no-preference\)\s*\{\s*\[data-panel\],\s*\[data-contact-cta\]/);
    expect(css).toMatch(/animation-name:\s*scan-in/);
    expect(css).toMatch(/animation-fill-mode:\s*backwards/);
    expect(css).not.toMatch(/\.reveal\b/);
  });
  it("animates nothing on ordinary link clicks: no channel switch, no root crossfade", () => {
    expect(css).not.toMatch(/ch-off|html\.ch\b/);
    expect(css).toMatch(/::view-transition-old\(root\),\s*::view-transition-new\(root\)\s*\{\s*animation:\s*none/);
    expect(css).not.toMatch(/\.trail\b/);
    for (const { path, html } of allHtml()) expect(html, path).not.toMatch(/pagereveal|class="trail/);
  });
  it("keeps the disk morph untouched", () => {
    const group = css.match(/::view-transition-group\(\*\.disk\)\s*\{([^}]*)\}/)![1];
    expect(group).toMatch(/animation-duration:\s*0?\.55s/);
    expect(group).toMatch(/z-index:\s*10/);
    expect(group).toMatch(/cubic-bezier\(\.45,\s*0,\s*\.15,\s*1\)/);
    expect(css).toMatch(/@view-transition\s*\{\s*navigation:\s*auto/);
    const home = allHtml().find((p) => p.path === "index.html")!.html;
    expect(home).toMatch(/view-transition-name:\s*disk-gramovoice/);
  });
});
