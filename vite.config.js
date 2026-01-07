import { defineConfig } from "vite";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  // Set base for GitHub Pages deployment
  // Change 'lifelab' to your repository name
  base: process.env.NODE_ENV === "production" ? "/lifelab/" : "/",

  build: {
    // Output directory
    outDir: "dist",

    // Ensure assets have proper paths
    assetsDir: "assets",

    // Generate source maps for debugging
    sourcemap: true,

    // Optimize for production
    minify: "terser",

    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        notebook: resolve(__dirname, "notebook.html"),
        year: resolve(__dirname, "year.html"),
        settings: resolve(__dirname, "settings.html"),
        about: resolve(__dirname, "about.html"),
      },
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          vendor: [],
        },
      },
    },
  },

  // Server configuration for development
  server: {
    port: 5173,
    open: true,
  },

  // Preview server configuration
  preview: {
    port: 4173,
    open: true,
  },
});
