const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<div className="flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col relative scroll-smooth">/,
  `<div className={\`flex-1 w-full \${showLoPortal ? 'flex flex-col overflow-hidden relative' : 'overflow-y-auto overflow-x-hidden flex flex-col relative scroll-smooth'}\`}>`
);

fs.writeFileSync('src/App.tsx', code);
