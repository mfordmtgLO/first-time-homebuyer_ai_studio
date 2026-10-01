import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss()
    ],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    define: {
      'process.env': {},
      global: 'window',
    },
    build: {
      sourcemap: false, // Ensures production builds do not expose original TypeScript/React source code
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        input: {
          main: path.resolve(process.cwd(), 'index.html'),
          firebase: path.resolve(process.cwd(), 'src/firebase.ts'),
        },
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
              if (id.includes('motion')) {
                return 'vendor-motion';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-lucide';
              }
              if (id.includes('@sentry')) {
                return 'vendor-sentry';
              }
              return 'vendor-libs';
            }
            if (id.includes('src/firebase') || id.endsWith('src/firebase.ts') || id.includes('firebase-applet-config.json')) {
              return 'firebase-core';
            }
          }
        }
      }
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
