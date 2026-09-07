const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyMapOverlay.tsx', 'utf8');

if (!c.includes('MarkerClusterer')) {
  // Add imports
  c = c.replace('import React, { useState, useMemo, useEffect } from "react";', 'import React, { useState, useMemo, useEffect, useCallback } from "react";\nimport { MarkerClusterer, type Marker } from "@googlemaps/markerclusterer";');
  
  // Add ClusteredPropertyMarkers component definition before the main component
  const clusteredComponent = `
export const ClusteredPropertyMarkers = ({
  properties,
  selectedPropertyId,
  hoveredPropertyId,
  setSelectedPropertyId,
  setHoveredPropertyId,
}: any) => {
  const [markers, setMarkers] = useState<{ [key: string]: Marker }>({});
  const map = useMap();

  const clusterer = useMemo(() => {
    if (!map) return null;
    return new MarkerClusterer({ map });
  }, [map]);

  const setMarkerRef = useCallback((marker: Marker | null, key: string) => {
    setMarkers((currentMarkers) => {
      if ((marker && currentMarkers[key]) || (!marker && !currentMarkers[key])) return currentMarkers;
      if (marker) {
        return { ...currentMarkers, [key]: marker };
      } else {
        const { [key]: _, ...newMarkers } = currentMarkers;
        return newMarkers;
      }
    });
  }, []);

  useEffect(() => {
    if (!clusterer) return;
    clusterer.clearMarkers();
    clusterer.addMarkers(Object.values(markers));
  }, [clusterer, markers]);

  return (
    <>
      {properties.map((property: any) => {
        const isSelected = selectedPropertyId === property.id;
        const isHovered = hoveredPropertyId === property.id;

        const pinBg =
          property.readiness.tier === "High"
            ? "#15803d" // emerald-700
            : property.readiness.tier === "Moderate"
              ? "#b45309" // amber-700
              : "#475569"; // slate-600

        return (
          <AdvancedMarker
            key={property.id}
            position={{ lat: property.lat, lng: property.lng }}
            onClick={() => setSelectedPropertyId(property.id)}
            zIndex={isSelected ? 100 : isHovered ? 90 : 50}
            ref={(marker) => setMarkerRef(marker, property.id)}
          >
            <div
              onMouseEnter={() => setHoveredPropertyId(property.id)}
              onMouseLeave={() => setHoveredPropertyId(null)}
              className={\`flex flex-col items-center cursor-pointer transition-all transform \${
                isSelected ? "scale-115" : isHovered ? "scale-110" : "scale-100"
              }\`}
            >
              {/* Price Tag Chip */}
              <div
                style={{ backgroundColor: pinBg }}
                className={\`px-2 py-0.5 rounded-full text-white text-[10px] font-bold shadow-md border-2 border-white flex items-center gap-1 whitespace-nowrap\`}
              >
                <ShieldCheck className="w-2.5 h-2.5" />
                <span>\${Math.round(property.price / 1000)}k</span>
              </div>
              {/* Indicator triangle */}
              <div
                style={{ backgroundColor: pinBg }}
                className="w-2 h-2 rotate-45 -mt-1 border-r border-b border-white"
              ></div>
            </div>
          </AdvancedMarker>
        );
      })}
    </>
  );
};
`;

  // Insert before PropertyMapOverlay
  c = c.replace('export const PropertyMapOverlay: React.FC<PropertyMapOverlayProps> = ({', clusteredComponent + '\nexport const PropertyMapOverlay: React.FC<PropertyMapOverlayProps> = ({');
}

fs.writeFileSync('src/components/PropertyMapOverlay.tsx', c);
