const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyMapOverlay.tsx', 'utf8');
c = c.replace('Circle  useMap', 'Circle,\n  useMap');
fs.writeFileSync('src/components/PropertyMapOverlay.tsx', c);
