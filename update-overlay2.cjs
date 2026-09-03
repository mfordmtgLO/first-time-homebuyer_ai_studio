const fs = require('fs');
let code = fs.readFileSync('src/utils/overlayClassification.ts', 'utf8');

code = code.replace(
  /export function hasAuthenticPropertyPhoto\(listing\?: PropertyListing \| null\): boolean \{\s*if \(\!listing \|\| \!listing\.imageUrl\) return false;\s*const url = String\(listing\.imageUrl\)\.trim\(\)\.toLowerCase\(\);\s*if \(\!url\) return false;\s*if \(url\.includes\("unsplash\.com"\) \|\| url\.includes\("placeholder"\) \|\| url\.includes\("images\.unsplash"\)\) \{\s*return false;\s*\}\s*return true;\s*\}/,
  `export function hasAuthenticPropertyPhoto(listing?: PropertyListing | null): boolean {
  if (!listing) return false;
  if (listing.images && listing.images.length > 0) return true;
  if (!listing.imageUrl) return false;
  const url = String(listing.imageUrl).trim().toLowerCase();
  if (!url) return false;
  if (url.includes("unsplash.com") || url.includes("placeholder") || url.includes("images.unsplash") || url.includes("picsum.photos")) {
    return false;
  }
  return true;
}`
);

fs.writeFileSync('src/utils/overlayClassification.ts', code);
