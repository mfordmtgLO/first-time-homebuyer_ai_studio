const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyMapOverlay.tsx', 'utf8');
c = c.replace('import {  MapPin,', 'import {  MapPin,\n  Flame,');
fs.writeFileSync('src/components/PropertyMapOverlay.tsx', c);
