const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const sidebarTarget = `          <aside 
            className="hidden lg:block w-72 shrink-0 py-8 pr-8"
            style={{ 
              position: 'sticky', 
              top: \`\${headerHeight}px\`, 
              height: \`calc(100vh - \${headerHeight}px)\` 
            }}
          >`;

const sidebarReplace = `          <aside 
            className="hidden lg:block w-72 shrink-0 py-8 pr-8"
            style={{ 
              position: 'sticky', 
              top: '0px', 
              height: '100%',
              maxHeight: '100%' 
            }}
          >`;

if (content.includes(sidebarTarget)) {
  content = content.replace(sidebarTarget, sidebarReplace);
}

fs.writeFileSync('src/App.tsx', content);
