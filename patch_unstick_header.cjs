const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `<div ref={headerRef} className="sticky top-0 z-40 bg-[#F9F8F4]/98 backdrop-blur-md border-b border-[#EAE7E0]/80 shadow-md">`;
const replace = `<div ref={headerRef} className="relative lg:sticky top-0 z-40 bg-[#F9F8F4]/98 backdrop-blur-md border-b border-[#EAE7E0]/80 shadow-md">`;

if (content.includes(target)) {
  content = content.replace(target, replace);
}

fs.writeFileSync('src/App.tsx', content);
