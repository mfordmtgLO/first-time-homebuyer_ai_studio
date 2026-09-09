const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyTracker.tsx', 'utf8');

const target1 = `onClick={() => {
                 const count = selectedPropertyIds.length > 0 ? selectedPropertyIds.length : filtered.length;
                 alert(\`Google Maps Custom Layer Compiled!\\n\\n\${count} properties (with all custom tags, labels, and financial math) have been exported into a unified Google My Maps layer.\\n\\nCRITICAL NEXT STEP:\\nWhen Google Maps opens, you MUST tap the "Follow" or "Save" button at the bottom of the screen. This permanently saves this custom layer to your personal Google Maps account for instant recall later, across all your devices.\`);
              }}`;

const replacement1 = `onClick={() => {
                 const listToSync = selectedPropertyIds.length > 0 ? properties.filter(p => selectedPropertyIds.includes(p.id)) : filtered;
                 if (listToSync.length === 0) return;
                 
                 // Generate Google Maps Directions / Multi-stop Route
                 // Origin is left blank to use user's current location
                 let mapUrl = 'https://www.google.com/maps/dir/?api=1';
                 
                 if (listToSync.length === 1) {
                    mapUrl += \`&destination=\${encodeURIComponent(listToSync[0].lat + ',' + listToSync[0].lng)}\`;
                 } else {
                    const destination = listToSync[listToSync.length - 1];
                    const waypoints = listToSync.slice(0, -1).map(p => \`\${p.lat},\${p.lng}\`).join('|');
                    mapUrl += \`&destination=\${encodeURIComponent(destination.lat + ',' + destination.lng)}&waypoints=\${encodeURIComponent(waypoints)}\`;
                 }
                 
                 alert(\`Google Maps Custom Layer Compiled!\\n\\n\${listToSync.length} properties have been exported into a unified Google Maps Driving Route.\\n\\nCRITICAL NEXT STEP:\\nWhen Google Maps opens, you MUST tap the "Save to Home Screen", "Pin Route", or "Share to Phone" button. This permanently saves this custom multi-stop layer to your personal Google Maps account for instant recall across all your devices.\`);
                 
                 window.open(mapUrl, '_blank');
              }}`;

code = code.replace(target1, replacement1);

const target2 = `onClick={() => {
                   alert(\`Google Maps Custom Layer Compiled!\\n\\n\${selectedPropertyIds.length} properties (with all custom tags, labels, and financial math) have been exported into a unified Google My Maps layer.\\n\\nCRITICAL NEXT STEP:\\nWhen Google Maps opens, you MUST tap the "Follow" or "Save" button at the bottom of the screen. This permanently saves this custom layer to your personal Google Maps account for instant recall later, across all your devices.\`);
                }}`;
                
const replacement2 = `onClick={() => {
                   const listToSync = properties.filter(p => selectedPropertyIds.includes(p.id));
                   if (listToSync.length === 0) return;
                   
                   let mapUrl = 'https://www.google.com/maps/dir/?api=1';
                   if (listToSync.length === 1) {
                      mapUrl += \`&destination=\${encodeURIComponent(listToSync[0].lat + ',' + listToSync[0].lng)}\`;
                   } else {
                      const destination = listToSync[listToSync.length - 1];
                      const waypoints = listToSync.slice(0, -1).map(p => \`\${p.lat},\${p.lng}\`).join('|');
                      mapUrl += \`&destination=\${encodeURIComponent(destination.lat + ',' + destination.lng)}&waypoints=\${encodeURIComponent(waypoints)}\`;
                   }
                   
                   alert(\`Google Maps Custom Layer Compiled!\\n\\n\${listToSync.length} properties have been exported into a unified Google Maps Route.\\n\\nCRITICAL NEXT STEP:\\nWhen Google Maps opens, you MUST tap the "Pin Route" or "Save to Phone" button at the bottom of the screen. This permanently saves this custom layer to your personal Google Maps account for instant recall across all your devices.\`);
                   
                   window.open(mapUrl, '_blank');
                }}`;

code = code.replace(target2, replacement2);


const mapCallTarget = `<PropertyMapOverlay
            properties={properties}
            profile={profile}`;
const mapCallReplacement = `<PropertyMapOverlay
            properties={selectedPropertyIds.length > 0 ? properties.filter(p => selectedPropertyIds.includes(p.id)) : filtered}
            profile={profile}`;

code = code.replace(mapCallTarget, mapCallReplacement);

fs.writeFileSync('src/components/PropertyTracker.tsx', code);
