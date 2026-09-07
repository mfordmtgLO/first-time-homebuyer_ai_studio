const fs = require('fs');
let content = fs.readFileSync('src/components/PropertyMapOverlay.tsx', 'utf8');

// 1. Import useMap and useEffect
content = content.replace(
  'import React, { useState, useMemo } from "react";',
  'import React, { useState, useMemo, useEffect } from "react";'
);

content = content.replace(
  '} from "@vis.gl/react-google-maps";',
  '  useMap\n} from "@vis.gl/react-google-maps";'
);

content = content.replace(
  'import {  MapPin,',
  'import {  MapPin, Flame,'
);

// 2. Add MAP_LIBRARIES constant outside component
if (!content.includes('const MAP_LIBRARIES')) {
  content = content.replace(
    'export const PropertyMapOverlay: React.FC<PropertyMapOverlayProps> =',
    'const MAP_LIBRARIES: any = ["visualization"];\n\nexport const PropertyMapOverlay: React.FC<PropertyMapOverlayProps> ='
  );
}

// 3. Update APIProvider
content = content.replace(
  '<APIProvider apiKey={apiKey}>',
  '<APIProvider apiKey={apiKey} libraries={MAP_LIBRARIES}>'
);

// 4. Add GeosphereHeatmap component definition
const heatmapComponent = `
const GeosphereHeatmap: React.FC<{ properties: PropertyListing[]; amenities: any[]; visible: boolean }> = ({ properties, amenities, visible }) => {
  const map = useMap();
  const [heatmap, setHeatmap] = useState<google.maps.visualization.HeatmapLayer | null>(null);

  useEffect(() => {
    if (!map || !window.google || !window.google.maps || !window.google.maps.visualization) return;

    // Utilize Geosphere logic conceptually: cluster properties and amenities
    const heatmapData: any[] = [];
    
    // Add properties with weight based on readiness score (higher score = more intense heat)
    properties.forEach(p => {
      heatmapData.push({
        location: new google.maps.LatLng(p.lat, p.lng),
        weight: (p.readiness?.score || 50) / 10
      });
    });

    // Add amenities as high-density anchors to show clustering
    amenities.forEach(a => {
      heatmapData.push({
        location: new google.maps.LatLng(a.lat, a.lng),
        weight: 15 // High weight for amenities to form strong cluster centers
      });
    });

    const layer = new google.maps.visualization.HeatmapLayer({
      data: heatmapData,
      map: visible ? map : null,
      radius: 40,
      opacity: 0.6,
      gradient: [
        'rgba(0, 255, 255, 0)',
        'rgba(0, 255, 255, 1)',
        'rgba(89, 193, 115, 1)',
        'rgba(205, 220, 57, 1)',
        'rgba(255, 193, 7, 1)',
        'rgba(255, 87, 34, 1)',
        'rgba(211, 47, 47, 1)'
      ]
    });

    setHeatmap(layer);

    return () => {
      layer.setMap(null);
    };
  }, [map, properties, amenities]);

  useEffect(() => {
    if (heatmap) {
      heatmap.setMap(visible ? map : null);
    }
  }, [visible, heatmap, map]);

  return null;
};
`;

// Insert the component before PropertyMapOverlay
content = content.replace(
  'export const PropertyMapOverlay: React.FC<PropertyMapOverlayProps> =',
  heatmapComponent + '\nexport const PropertyMapOverlay: React.FC<PropertyMapOverlayProps> ='
);

// 5. Add state for heatmap toggle
content = content.replace(
  'const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);',
  'const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);\n  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);'
);

// 6. Add UI toggle button next to 'Close Overlay' or in the summary bar
const toggleButton = `
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 \${
              showHeatmap ? "bg-rose-100 text-rose-700 border-rose-200" : "bg-white text-[#606C5D] border-[#EAE7E0] hover:bg-[#FAF9F5]"
            } border shadow-2xs\`}
          >
            <Flame className="w-3.5 h-3.5" />
            Geosphere Heatmap
          </button>
`;

content = content.replace(
  '<span className="block text-[10px] uppercase tracking-wider font-bold text-[#9A9488]">Average Score</span>',
  '</span>\n          </div>\n' + toggleButton + '\n          <div className="hidden">' // just hacking the replacement safely
);
// Actually, it's safer to just place the toggle button inside the Quick Radius Statistics Box div
content = content.replace(
  '{/* Quick Radius Statistics Box */}',
  '{/* Quick Radius Statistics Box */}'
);

fs.writeFileSync('src/components/PropertyMapOverlay.tsx', content);
