const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyTracker.tsx', 'utf8');

// Update hasAuthenticPropertyPhoto to check images array
code = code.replace(
  /const hasAuthenticPropertyPhoto = \(property: PropertyListing\) => \{/g,
  `const hasAuthenticPropertyPhoto = (property: PropertyListing) => {\n  if (property.images && property.images.length > 0) return true;`
);

// We should replace the img rendering to render the first image from the array if available
// Or wait, imageUrl is populated from the first image anyway!
// So property.imageUrl will still work as the main cover photo!
// But wait, the user asked to support 'images' array. We can update PropertyTracker.tsx to show a mini gallery if multiple images are provided, or at least use the images array.

code = code.replace(
  /<img\s+src=\{property\.imageUrl\}\s+alt=\{property\.title\}\s+className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"\s+\/>/g,
  `<img\s+src={property.images?.length ? property.images[0] : property.imageUrl}\s+alt={property.title}\s+className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"\s+/>`
);

fs.writeFileSync('src/components/PropertyTracker.tsx', code);
