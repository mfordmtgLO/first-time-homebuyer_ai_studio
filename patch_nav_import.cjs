const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyCard.tsx', 'utf8');

c = c.replace('import {\\n  Star,', 'import {\\n  Navigation,\\n  Star,');
// Let's do it safely just in case it didn't match before
c = c.replace('import {', 'import { Navigation,');

fs.writeFileSync('src/components/PropertyCard.tsx', c);
