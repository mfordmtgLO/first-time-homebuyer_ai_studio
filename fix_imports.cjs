const fs = require('fs');

function addImport(file, importName) {
  let code = fs.readFileSync(file, 'utf8');
  if (code.includes(importName) && !code.match(new RegExp(`import\\s+{.*\\b${importName}\\b.*}\\s+from\\s+['"]lucide-react['"]`))) {
    // Find the lucide-react import
    code = code.replace(/import\s+{([^}]+)}\s+from\s+['"]lucide-react['"];/, (match, p1) => {
      if (!p1.includes(importName)) {
        return `import { ${p1.trim()}, ${importName} } from "lucide-react";`;
      }
      return match;
    });
    fs.writeFileSync(file, code);
  }
}

addImport('src/components/HeroWebsite.tsx', 'ShieldCheck');
addImport('src/components/MobileHeroWebsite.tsx', 'ShieldCheck');
addImport('src/components/DashboardOverview.tsx', 'ShieldCheck');
