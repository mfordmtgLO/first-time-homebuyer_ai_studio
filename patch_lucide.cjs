const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyCard.tsx', 'utf8');

c = c.replace('import { \n  Star,', 'import { \n  Navigation,\n  Star,');
c = c.replace('import {\n  Star,', 'import {\n  Navigation,\n  Star,');
c = c.replace('import {   Star,', 'import { Navigation,  Star,');

fs.writeFileSync('src/components/PropertyCard.tsx', c);
