const fs = require('fs');
let c = fs.readFileSync('src/components/GeoSphereSyncHub.tsx', 'utf8');

if (!c.includes('const [viewMode,')) {
    c = c.replace(
        'const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>("all");',
        'const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>("all");\n  const [viewMode, setViewMode] = useState<"cards" | "map">("cards");'
    );
}

// Ensure PropertyMapOverlay is imported
if (!c.includes('PropertyMapOverlay')) {
    c = c.replace('import { getListingOverlayBadges } from "../utils/overlayClassification";', 'import { getListingOverlayBadges } from "../utils/overlayClassification";\nimport { PropertyMapOverlay } from "./PropertyMapOverlay";');
}
if (!c.includes('PropertyMapOverlay')) { // Fallback if the previous didn't work
    c = c.replace('import React', 'import { PropertyMapOverlay } from "./PropertyMapOverlay";\nimport React');
}


const toggleInjection = `<div className="flex items-center gap-1.5 p-1 bg-[#F9F8F4] rounded-xl border border-[#EAE7E0] overflow-x-auto hide-scrollbar self-start sm:self-auto mb-3 sm:mb-0">
            <button
              onClick={() => setViewMode("map")}
              className={\`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap \${
                viewMode === "map"
                  ? "bg-[#4A5D4E] text-white shadow-2xs font-bold"
                  : "text-[#606C5D] hover:text-[#2D362E]"
              }\`}
            >
              <Globe className="w-4 h-4 text-emerald-300" />
              <span>Interactive Map View</span>
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={\`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap \${
                viewMode === "cards"
                  ? "bg-[#4A5D4E] text-white shadow-2xs font-bold"
                  : "text-[#606C5D] hover:text-[#2D362E]"
              }\`}
            >
              <Building className="w-4 h-4" />
              <span>Curated List</span>
            </button>
          </div>`;

c = c.replace(
    '{/* Batch Action Bar */}',
    `{/* Map / Cards Toggle */}\n        ${toggleInjection}\n\n        {/* Batch Action Bar */}`
);

const mapInjection = `        {viewMode === "map" ? (
          <div className="mb-6">
            <PropertyMapOverlay
              properties={filteredListings}
              onCloseMap={() => setViewMode("cards")}
            />
          </div>
        ) : filteredListings.length === 0 ? (`;

c = c.replace('        {filteredListings.length === 0 ? (', mapInjection);

fs.writeFileSync('src/components/GeoSphereSyncHub.tsx', c);
