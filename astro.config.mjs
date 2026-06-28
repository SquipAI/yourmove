// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sanity from "@sanity/astro";

export default defineConfig({
  site: "https://yourmove.ai",
  trailingSlash: "never",
  build: { format: "file" },

  integrations: [
    sitemap({
      i18n: {
        defaultLocale: "en",
        locales: {
          en: "en-US",
          es: "es",
          de: "de-DE",
        },
      },
    }),
    react(),
    sanity({
      projectId: "jdxzhhce",
      dataset: "production",
      apiVersion: "2026-05-07",
      useCdn: false,
      studioBasePath: "/studio",
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ["@sanity/client"],
      include: ["@sanity/eventsource"],
    },
  },

  i18n: {
    defaultLocale: "en",
    locales: ["en", "es", "de"],
  },

  image: {
    layout: "constrained",
    domains: ["cdn.sanity.io"],
    service: {
      entrypoint: "astro/assets/services/sharp",
      config: {
        webp: { effort: 6, quality: 80 },
      },
    },
  },

  adapter: cloudflare({
    prerenderEnvironment: "node",
    // Build: keep the tuned Sharp pipeline (runs in Node, bakes optimized webp/avif into dist).
    // Dev: Sharp can't run in the workerd dev runner, so pass images through unoptimized.
    imageService: process.argv.includes("build") ? "custom" : "passthrough",
  }),
});
