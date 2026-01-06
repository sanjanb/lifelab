// @ts-check
import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import { VitePWA } from "vite-plugin-pwa";

// https://astro.build/config
export default defineConfig({
  // Static site generation for GitHub Pages
  output: "static",

  // Site URL - update this with your actual domain when deploying
  // For GitHub Pages: https://<username>.github.io
  // For custom domain: https://yourdomain.com
  site: "https://YOUR_GITHUB_USERNAME.github.io",

  base: "/lifelab",

  // Build configuration
  build: {
    // Output directory
    outDir: "./dist",
    // Asset handling
    assets: "_astro",
  },

  // Development server
  server: {
    port: 3000,
    host: true,
  },

  integrations: [svelte()],

  vite: {
    plugins: [
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.svg"],
        manifest: {
          name: "LifeLab - Personal Life Tracker",
          short_name: "LifeLab",
          description:
            "Track and visualize your life across multiple domains with emotional safety",
          theme_color: "#3b82f6",
          background_color: "#ffffff",
          display: "standalone",
          orientation: "portrait",
          start_url: "/lifelab/",
          scope: "/lifelab/",
          icons: [
            {
              src: "/lifelab/pwa-192x192.svg",
              sizes: "192x192",
              type: "image/svg+xml",
            },
            {
              src: "/lifelab/pwa-512x512.svg",
              sizes: "512x512",
              type: "image/svg+xml",
            },
            {
              src: "/lifelab/pwa-512x512.svg",
              sizes: "512x512",
              type: "image/svg+xml",
              purpose: "any maskable",
            },
          ],
        },
        workbox: {
          navigateFallback: "/lifelab/",
          globPatterns: ["**/*.{css,js,html,svg,png,ico,txt,woff2}"],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-cache",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
  },
});
