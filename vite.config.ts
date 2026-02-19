import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),

    // Gzip pre-compression
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024, // Only compress files > 1KB
    }),

    // Brotli pre-compression (better ratio than gzip)
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
    }),
  ],

  build: {
    // Use terser for deeper minification (~5-10% smaller than esbuild)
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,   // Remove console.log in production
        drop_debugger: true,  // Remove debugger statements
        passes: 2,            // Two-pass compression for better results
      },
      mangle: {
        safari10: true,       // Safari 10 compatibility
      },
      format: {
        comments: false,      // Remove all comments
      },
    },

    // Use lightningcss for faster, smaller CSS output
    cssMinify: 'lightningcss',

    // No source maps in production
    sourcemap: false,

    // Code splitting — vendor chunks for independent caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Charting library (~200KB) — loaded only when results are shown
          'vendor-charts': ['recharts'],
          // MUI components (~150KB) — used in report table
          'vendor-mui': [
            '@mui/material',
            '@emotion/react',
            '@emotion/styled',
          ],
          // React core (~140KB) — changes rarely, caches well
          'vendor-react': ['react', 'react-dom'],
        },
      },
    },

    // Increase chunk warning limit since vendor chunks are intentionally large
    chunkSizeWarningLimit: 300,

    // Target modern browsers for smaller output
    target: 'es2020',
  },

})
