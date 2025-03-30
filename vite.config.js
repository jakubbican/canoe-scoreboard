// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  // Base path for production deployment
  // Use '/' for serving from the root or './' for relative paths
  base: "./",

  build: {
    // Output directory for production build
    outDir: "dist",
    // Enable source map generation for debugging
    sourcemap: true,
    // Optimize large chunks
    chunkSizeWarningLimit: 1000,
    // Asset handling
    assetsInlineLimit: 4096, // 4kb
    // Recommended for Vite 6+ to ensure proper code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
        },
      },
    },
  },

  server: {
    // Development server port
    port: 3000,
    // Enable CORS for WebSocket connections
    cors: true,
    // Automatically open browser with specific parameters
    open: "/?type=vertical&server=ws://localhost:8081/",
    // Listen on all interfaces
    host: "0.0.0.0",
  },

  // Preview server configuration
  preview: {
    port: 4173,
    open: "/?type=vertical&server=ws://localhost:8081/",
    cors: true,
  },
});
