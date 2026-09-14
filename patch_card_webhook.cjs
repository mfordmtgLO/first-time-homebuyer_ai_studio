const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyCard.tsx', 'utf8');

const oldOnClick = `onClick={(e) => {
              e.stopPropagation();
              alert("Data synced to Vantage AI Ads Engine. The Marketing Team has been notified!");
              // In production, this would trigger a webhook to the Ads Engine or open a modal.
            }}`;

const newOnClick = `onClick={(e) => {
              e.stopPropagation();
              const payload = {
                targetLoUid: loanOfficer?.id || "lo_default",
                source: "First-Time Homebuyer GeoSphere",
                batchId: "batch_" + Date.now(),
                properties: [{
                  propertyId: property.id,
                  address: property.address,
                  city: property.city,
                  price: property.price,
                  beds: property.bedrooms || 0,
                  baths: property.bathrooms || 0,
                  squareFeet: property.sqft || 0,
                  daysOnMarket: property.daysOnMarket || 0,
                  rentcastEstRent: property.estimatedRent || 0,
                  agentName: agent?.name || "Unknown",
                  agentPhone: agent?.phone || "",
                  agentEmail: agent?.email || "",
                  tags: [
                    ...(property.isUsdaEligible ? ["USDA", "Zero Down"] : []),
                    ...(property.isOhcsEligible ? ["OHCS Eligible"] : [])
                  ]
                }]
              };
              
              fetch("https://ais-pre-tnbidd2z2dclvambkyz3vi-427099073161.us-east5.run.app/api/webhooks/property-sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
              }).then(() => {
                alert("Property data successfully sent to Vantage AI Ads Engine!");
              }).catch(err => {
                console.error("Ads Engine Sync Error:", err);
                alert("Error sending to Ads Engine. See console.");
              });
            }}`;

code = code.replace(oldOnClick, newOnClick);
fs.writeFileSync('src/components/PropertyCard.tsx', code, 'utf8');
console.log("Updated PropertyCard webhook");
