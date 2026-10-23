// @ts-check
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://thiegocarvalho.github.io",
  output: "static",

  i18n: {
    defaultLocale: "en",
    locales: ["en", { path: "pt", codes: ["pt-br", "pt"] }],
    routing: { prefixDefaultLocale: false },
  },

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": "/src",
        "@components": "/src/components",
      },
    },
  },

  build: {
    inlineStylesheets: "auto",
  },

  server: {
    host: true,
    port: 4321,
  },

  integrations: [
    sitemap({ i18n: { defaultLocale: "en", locales: { en: "en", pt: "pt-br" } } }),
  ],
});