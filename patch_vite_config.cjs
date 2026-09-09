const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

const target = `VitePWA({
        selfDestroying: true
      })`;

const replacement = `VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png', 'pwa-maskable-512x512.png'],
        manifest: {
          id: '/',
          name: 'First-Time Homebuyer Roadmap',
          short_name: 'Homebuyer',
          description: 'Comprehensive first-time homebuyer roadmap and portal.',
          theme_color: '#E2DFD2',
          background_color: '#F9F8F4',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      })`;

code = code.replace(target, replacement);
fs.writeFileSync('vite.config.ts', code);
