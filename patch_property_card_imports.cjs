const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyCard.tsx', 'utf8');

// The first patch script might have had issues if it didn't find TrendingDown or there were multiple imports
if (!code.includes('TrendingDown') && code.includes('lucide-react')) {
  // Find the lucide-react import
  const lucideRegex = /import\s+{([^}]*)}\s+from\s+["']lucide-react["'];/;
  const match = code.match(lucideRegex);
  if (match) {
    const imports = match[1];
    if (!imports.includes('TrendingDown')) {
      const newImports = imports + ', TrendingDown';
      code = code.replace(imports, newImports);
      fs.writeFileSync('src/components/PropertyCard.tsx', code);
      console.log("Added TrendingDown to lucide-react imports");
    }
  }
}
