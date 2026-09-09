const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

const target = `workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        },`;
const replacement = `workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
        },`;

code = code.replace(target, replacement);
fs.writeFileSync('vite.config.ts', code);
