const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyTracker.tsx', 'utf8');

// Update hasAuthenticPropertyPhoto to check images array
code = code.replace(
  /const hasAuthenticPropertyPhoto = \(property: PropertyListing\) => \{/g,
  `const hasAuthenticPropertyPhoto = (property: PropertyListing) => {\n  if (property.images && property.images.length > 0) return true;`
);

code = code.replace(
  /<img\s*src=\{property\.imageUrl\}\s*alt=\{property\.title\}\s*className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"\s*\/>/g,
  `<img src={property.images?.length ? property.images[0] : property.imageUrl} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />`
);

fs.writeFileSync('src/components/PropertyTracker.tsx', code);
