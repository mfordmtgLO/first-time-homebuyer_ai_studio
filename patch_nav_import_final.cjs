const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyCard.tsx', 'utf8');

if (!c.includes('import { Navigation,')) {
    c = c.replace('import {\\n  Star,', 'import {\\n  Navigation,\\n  Star,');
}

fs.writeFileSync('src/components/PropertyCard.tsx', c);
