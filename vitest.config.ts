import { defineConfig } from "vitest/config";

// Plain Node runner over dist/. Deliberately NOT wrapped in getViteConfig()
// from astro/config: astro:content and astro:i18n must not resolve here.
export default defineConfig({
  test: {
    globals: true,
    globalSetup: "./tests/global-setup.ts",
    include: ["tests/**/*.test.ts"],
  },
});
