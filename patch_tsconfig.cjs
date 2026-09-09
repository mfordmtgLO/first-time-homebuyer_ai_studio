const fs = require('fs');
let code = fs.readFileSync('tsconfig.json', 'utf8');

const target = `"moduleResolution": "bundler",`;
const replacement = `"types": ["vite/client", "vite-plugin-pwa/client"],
    "moduleResolution": "bundler",`;

if (!code.includes('"vite-plugin-pwa/client"')) {
  code = code.replace(target, replacement);
  fs.writeFileSync('tsconfig.json', code);
}
