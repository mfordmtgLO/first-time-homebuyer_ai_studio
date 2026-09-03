const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf8');
code = code.replace(
  /<img\s*src=\{property\.imageUrl\}\s*alt=\{property\.title\}\s*className="w-full sm:w-24 h-20 object-cover rounded-xl shrink-0"\s*\/>/g,
  `<img src={property.images?.length ? property.images[0] : property.imageUrl} alt={property.title} className="w-full sm:w-24 h-20 object-cover rounded-xl shrink-0" />`
);
fs.writeFileSync('src/components/DashboardOverview.tsx', code);

let geoCode = fs.readFileSync('src/components/GeoSphereSyncHub.tsx', 'utf8');
geoCode = geoCode.replace(
  /<img\s*src=\{listing\.imageUrl\}\s*alt=\{listing\.address\}/g,
  `<img src={listing.images?.length ? listing.images[0] : listing.imageUrl} alt={listing.address}`
);
geoCode = geoCode.replace(
  /<img\s*src=\{inspectingListing\.imageUrl\}\s*alt="Property"/g,
  `<img src={inspectingListing.images?.length ? inspectingListing.images[0] : inspectingListing.imageUrl} alt="Property"`
);
fs.writeFileSync('src/components/GeoSphereSyncHub.tsx', geoCode);
