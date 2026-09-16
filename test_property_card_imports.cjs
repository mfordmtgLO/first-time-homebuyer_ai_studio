const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyCard.tsx', 'utf8');

if (!code.includes('import {') || !code.includes('TrendingDown')) {
  console.log("TrendingDown is not imported properly!");
  if (!code.includes('TrendingDown') && code.includes('lucide-react')) {
     const lucideRegex = /import\s+{[^}]*}\s+from\s+["']lucide-react["'];/g;
     const matches = code.match(lucideRegex);
     if (matches) {
       for (const match of matches) {
         if (!match.includes('TrendingDown')) {
           const newImport = match.replace('}', ', TrendingDown }');
           code = code.replace(match, newImport);
           fs.writeFileSync('src/components/PropertyCard.tsx', code);
           console.log("Patched lucide-react import to include TrendingDown");
           break;
         }
       }
     }
  }
} else {
  console.log("TrendingDown is imported.");
}
