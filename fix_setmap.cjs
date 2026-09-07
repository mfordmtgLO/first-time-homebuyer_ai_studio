const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyMapOverlay.tsx', 'utf8');
c = c.replace('layer.setMap(null);', '(layer as any).setMap(null);');
c = c.replace('heatmap.setMap(visible ? map : null);', '(heatmap as any).setMap(visible ? map : null);');
fs.writeFileSync('src/components/PropertyMapOverlay.tsx', c);
