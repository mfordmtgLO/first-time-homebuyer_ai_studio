const fs = require('fs');
let content = fs.readFileSync('src/components/PropertyMapOverlay.tsx', 'utf8');

content = content.replace(
  'style={{ width: "100%", height: "100%", minHeight: "560px" }}\n                >',
  'style={{ width: "100%", height: "100%", minHeight: "560px" }}\n                >\n                  <GeosphereHeatmap properties={filteredProperties} amenities={mockAmenities} visible={showHeatmap} />'
);

fs.writeFileSync('src/components/PropertyMapOverlay.tsx', content);
