const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyCard.tsx', 'utf8');

c = c.replace('import {\\n  Navigation,\\n  Star,', 'import {\\n  Navigation,\\n  Flame,\\n  Star,');

fs.writeFileSync('src/components/PropertyCard.tsx', c);
