const fs = require('fs');
let code = fs.readFileSync('src/utils/overlayClassification.ts', 'utf8');

code = code.replace(
  /export function hasAuthenticPropertyPhoto\(listing\?: PropertyListing \| null\): boolean \{\s*if \(\!listing \|\| \!listing\.imageUrl\) return false;\s*return \!listing\.imageUrl\.includes\("unsplash"\) \&\& \!listing\.imageUrl\.includes\("placeholder"\);\s*\}/g,
  `export function hasAuthenticPropertyPhoto(listing?: PropertyListing | null): boolean {
  if (!listing) return false;
  
  // Check if there are uploaded images (data URLs from file upload are considered authentic)
  if (listing.images && listing.images.length > 0) return true;
  
  if (!listing.imageUrl) return false;
  return !listing.imageUrl.includes("unsplash") && !listing.imageUrl.includes("placeholder") && !listing.imageUrl.includes("picsum.photos");
}`
);

fs.writeFileSync('src/utils/overlayClassification.ts', code);
