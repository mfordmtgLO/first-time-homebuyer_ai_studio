const fs = require('fs');
let code = fs.readFileSync('src/components/MobileBottomNav.tsx', 'utf8');

if (!code.includes('PWAInstallButton')) {
  // Add import
  const importTarget = `import { Home, Compass, Sparkles, Search, LayoutDashboard } from 'lucide-react';`;
  const importReplacement = `import { Home, Compass, Sparkles, Search, LayoutDashboard } from 'lucide-react';\nimport { PWAInstallButton } from './PWAInstallButton';`;
  code = code.replace(importTarget, importReplacement);
  
  // Replace the last item with the PWA install wrapper or inject it before the end
  const target = `    </div>
  );`;
  const replacement = `      <div className="hidden"><PWAInstallButton /></div>
    </div>
  );`;

  code = code.replace(target, replacement);
  fs.writeFileSync('src/components/MobileBottomNav.tsx', code);
  console.log("MobileBottomNav patched");
}
