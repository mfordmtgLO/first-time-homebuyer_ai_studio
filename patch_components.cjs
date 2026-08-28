const fs = require('fs');

// CuratedHomesSection
let content1 = fs.readFileSync('src/components/CuratedHomesSection.tsx', 'utf8');
content1 = content1.replace(
    /\{\s*id: "all",\s*label: `All Homes \(\\\$\\{publishedHomes\.length\\}\)`, short: "All" \},/g,
    \`{ id: "all", label: \\\`All Homes (\\\${publishedHomes.length})\\\`, short: "All" },
            { id: "lakeviewNational", label: \\\`Lakeview National (\\\${counts.lakeviewNational})\\\`, short: "Lakeview" },\`
);
fs.writeFileSync('src/components/CuratedHomesSection.tsx', content1);

// PropertyTracker
let content2 = fs.readFileSync('src/components/PropertyTracker.tsx', 'utf8');
content2 = content2.replace(
    /\{\s*id: "all",\s*label: `All Homes \(\\\$\\{properties\.length\\}\)` \},/g,
    \`{ id: "all", label: \\\`All Homes (\\\${properties.length})\\\` },
            { id: "lakeviewNational", label: \\\`Lakeview National (\\\${overlayCounts.lakeviewNational})\\\` },\`
);
fs.writeFileSync('src/components/PropertyTracker.tsx', content2);

// GeoSphereSyncHub
let content3 = fs.readFileSync('src/components/GeoSphereSyncHub.tsx', 'utf8');
content3 = content3.replace(
    /\{\s*id: "all",\s*label: `All Synced \(\\\$\\{syncedListings\.length\\}\)` \},/g,
    \`{ id: "all", label: \\\`All Synced (\\\${syncedListings.length})\\\` },
              { id: "lakeviewNational", label: \\\`Lakeview National (\\\${overlayCounts.lakeviewNational})\\\` },\`
);
fs.writeFileSync('src/components/GeoSphereSyncHub.tsx', content3);
