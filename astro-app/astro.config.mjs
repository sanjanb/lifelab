// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  // Static site generation for GitHub Pages
  output: "static",

  // Site URL - update this with your GitHub Pages URL when deploying
  // Format: https://<username>.github.io/<repo-name>/
  // For now, using root path for local development
  site: "https://yourusername.github.io",
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
});
