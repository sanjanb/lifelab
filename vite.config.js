import { defineConfig } from "vite";

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
