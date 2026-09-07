const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyMapOverlay.tsx', 'utf8');

const targetLoopStart = '{/* Property Markers with Readiness Tier Badges */}';

if (c.includes(targetLoopStart)) {
  const replacement = `
                  {/* Clustered Property Markers */}
                  <ClusteredPropertyMarkers
                    properties={filteredProperties}
                    selectedPropertyId={selectedPropertyId}
                    hoveredPropertyId={hoveredPropertyId}
                    setSelectedPropertyId={setSelectedPropertyId}
                    setHoveredPropertyId={setHoveredPropertyId}
                  />
`;

  // Find where the loop ends (the AdvancedMarker closes)
  const regex = /\{\/\* Property Markers with Readiness Tier Badges \*\/\}[\s\S]*?<\/AdvancedMarker>\s*\);\s*\}\)}\s*/;
  c = c.replace(regex, replacement);
  
  fs.writeFileSync('src/components/PropertyMapOverlay.tsx', c);
}
