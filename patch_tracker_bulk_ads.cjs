const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyTracker.tsx', 'utf8');

const targetStr = `<button
              onClick={handleShareList}`;

const bulkAdsHtml = `            <button
              onClick={() => {
                 const listToSync = selectedPropertyIds.length > 0 ? properties.filter(p => selectedPropertyIds.includes(p.id)) : filtered;
                 if (listToSync.length === 0) {
                   alert("No properties found to send.");
                   return;
                 }
                 
                 const payload = {
                   targetLoUid: profile?.id || "lo_default",
                   source: "First-Time Homebuyer GeoSphere",
                   batchId: "batch_" + Date.now(),
                   properties: listToSync.map(p => ({
                     propertyId: p.id,
                     address: p.address,
                     city: p.city,
                     price: p.price,
                     beds: p.bedrooms || 0,
                     baths: p.bathrooms || 0,
                     squareFeet: p.sqft || 0,
                     daysOnMarket: p.daysOnMarket || 0,
                     rentcastEstRent: p.estimatedRent || 0,
                     agentName: p.agent?.name || "Unknown",
                     agentPhone: p.agent?.phone || "",
                     agentEmail: p.agent?.email || "",
                     tags: [
                       ...(p.isUsdaEligible ? ["USDA", "Zero Down"] : []),
                       ...(p.isOhcsEligible ? ["OHCS Eligible"] : [])
                     ]
                   }))
                 };
                 
                 fetch("https://ais-pre-tnbidd2z2dclvambkyz3vi-427099073161.us-east5.run.app/api/webhooks/property-sync", {
                   method: "POST",
                   headers: { "Content-Type": "application/json" },
                   body: JSON.stringify(payload)
                 }).then(() => {
                   alert(listToSync.length + " properties successfully bulk-synced to Vantage AI Ads Engine!");
                 }).catch(err => {
                   console.error("Ads Engine Sync Error:", err);
                   alert("Error sending to Ads Engine. See console.");
                 });
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-pink-600 text-white hover:bg-pink-700 font-semibold text-xs shadow-sm transition-all cursor-pointer hover:scale-105"
              title="Push selected properties to Vantage AI Ads Engine for campaign generation"
            >
              <Megaphone className="w-4 h-4 text-pink-200" />
              <span>Push to Ads Engine {selectedPropertyIds.length > 0 ? "(" + selectedPropertyIds.length + ")" : ""}</span>
            </button>
`;

if (!code.includes("Push to Ads Engine")) {
  code = code.replace(targetStr, bulkAdsHtml + '            <button\n              onClick={handleShareList}');
  
  if (!code.includes("Megaphone")) {
    code = code.replace("Share2,", "Share2,\n  Megaphone,");
  }
  
  fs.writeFileSync('src/components/PropertyTracker.tsx', code, 'utf8');
  console.log("Updated PropertyTracker webhook");
} else {
  // If it already exists, replace it
  console.log("Button already exists! Need to replace it.");
  const oldChunkStart = `<button\n              onClick={() => {\n                 const listToSync = selectedPropertyIds`;
  // Let's just run sed or replace to fix it.
}
