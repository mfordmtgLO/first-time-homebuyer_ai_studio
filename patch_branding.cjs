const fs = require('fs');

// 1. Update vite.config.ts
let viteConfig = fs.readFileSync('vite.config.ts', 'utf8');
viteConfig = viteConfig.replace("name: 'First-Time Homebuyer Roadmap'", "name: 'GrantMatch Homebuyer'");
viteConfig = viteConfig.replace("short_name: 'Homebuyer'", "short_name: 'GrantMatch'");
viteConfig = viteConfig.replace(
  "description: 'Comprehensive first-time homebuyer roadmap and portal.'", 
  "description: 'Local down payment grants, mortgage calculator, and homebuyer readiness tool.'"
);
fs.writeFileSync('vite.config.ts', viteConfig);

// 2. Update index.html
let indexHtml = fs.readFileSync('index.html', 'utf8');
indexHtml = indexHtml.replace("<title>First-Time Homebuyer Roadmap</title>", "<title>GrantMatch Homebuyer</title>");
indexHtml = indexHtml.replace(
  /<meta name="description" content=".*?" \/>/,
  '<meta name="description" content="Find local down payment grants, calculate your mortgage, and get pre-approved for your first home." />'
);
indexHtml = indexHtml.replace(
  /<meta property="og:description" content=".*?" \/>/,
  '<meta property="og:description" content="Find local down payment grants, calculate your mortgage, and get pre-approved for your first home." />'
);
indexHtml = indexHtml.replace('<meta property="og:title" content="First-Time Homebuyer Roadmap" />', '<meta property="og:title" content="GrantMatch Homebuyer" />');
indexHtml = indexHtml.replace('<meta name="apple-mobile-web-app-title" content="Homebuyer" />', '<meta name="apple-mobile-web-app-title" content="GrantMatch" />');
fs.writeFileSync('index.html', indexHtml);

// 3. Update metadata.json if it exists
if (fs.existsSync('metadata.json')) {
  let metadata = JSON.parse(fs.readFileSync('metadata.json', 'utf8'));
  metadata.name = 'GrantMatch Homebuyer';
  metadata.description = 'Find local down payment grants, calculate your mortgage, and get pre-approved for your first home.';
  fs.writeFileSync('metadata.json', JSON.stringify(metadata, null, 2));
}

