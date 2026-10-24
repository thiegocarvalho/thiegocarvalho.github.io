import { allHtml } from './helpers/dist';
import { ui } from '../src/i18n/ui';

// The owner chose no contact form (no backend, no third-party service): every
// page ends with one shared CTA instead, and the nav's CONTACT jumps to it.
describe('contact CTA in the footer', () => {
  const pages = allHtml();

  it('is on every built page, once, inside the footer', () => {
    expect(pages.length).toBeGreaterThanOrEqual(19);
    for (const { path, html } of pages) {
      expect(html.match(/data-contact-cta/g), path).toHaveLength(1);
      const footer = html.slice(html.indexOf('<footer'), html.indexOf('</footer>'));
      expect(footer, path).toContain('id="contact"');
    }
  });

  it('carries the localized headline, the mailto button and the four social links', () => {
    for (const { path, html } of pages) {
      const lang = path.startsWith('pt/') ? 'pt' : 'en';
      const cta = html.slice(html.indexOf('data-contact-cta'), html.indexOf('</footer>'));
      expect(cta, path).toContain(ui[lang]['cta.title'].replace("'", '&#39;'));
      expect(cta, path).toContain('href="mailto:thiego@rocketmail.com"');
      for (const url of [
        'https://github.com/thiegocarvalho',
        'https://www.linkedin.com/in/thiegocarvalho/',
        'https://x.com/unusual_zeru',
        'https://www.instagram.com/unusual_zeru/',
      ]) expect(cta, `${path} ${url}`).toContain(`href="${url}"`);
      expect((cta.match(/<svg class="pixel-icon/g) ?? []).length, path).toBe(5);
    }
  });

  it('has no form and no contact section anywhere else, and the nav jumps to it', () => {
    for (const { path, html } of pages) {
      expect(html, path).not.toMatch(/<form/);
      expect(html.match(/id="contact"/g), path).toHaveLength(1);
      expect(html, path).toMatch(/data-text-nav[\s\S]*?href="#contact"/);
    }
  });
});

describe("the contact phone", () => {
  it("sits inside the contact CTA on every page, decorative and script-free", () => {
    for (const { path, html } of allHtml()) {
      const cta = html.match(/<section[^>]*id="contact"[\s\S]*?<\/section>/)![0];
      expect(cta, path).toMatch(/<div class="phone[^"]*" aria-hidden="true"/);
      expect(cta, path).toMatch(/<div class="phone[^"]*" aria-hidden="true"[^>]*>\s*<svg viewBox/);
      expect(cta, path).not.toContain("<script");
    }
  });
});
