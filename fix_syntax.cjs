const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyCard.tsx', 'utf8');

c = c.replace('Navigation,\\n  Flame,', 'Navigation,\n  Flame,');

fs.writeFileSync('src/components/PropertyCard.tsx', c);

let c2 = fs.readFileSync('src/components/PropertyTracker.tsx', 'utf8');
c2 = c2.replace('MapPin,\\n  Flame,\\n  BellRing,', 'MapPin,\n  Flame,\n  BellRing,');
fs.writeFileSync('src/components/PropertyTracker.tsx', c2);

