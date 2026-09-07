const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyCard.tsx', 'utf8');
c = c.replace('  Navigation,', '  Navigation,\\n  Flame,');
fs.writeFileSync('src/components/PropertyCard.tsx', c);

c = fs.readFileSync('src/components/PropertyTracker.tsx', 'utf8');
if (!c.includes('Flame,')) {
    c = c.replace('import {\\n  MapPin,', 'import {\\n  MapPin,\\n  Flame,\\n  BellRing,');
}
fs.writeFileSync('src/components/PropertyTracker.tsx', c);
