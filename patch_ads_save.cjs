const fs = require('fs');
let code = fs.readFileSync('src/components/AdsCampaignHub.tsx', 'utf8');

code = code.replace(
  /targetLocations: adSettings\.targetCities \|\| \[\"Portland Metro\"\],/g,
  `targetLocations: (activeAgent.activeAdCounties?.length ? activeAgent.activeAdCounties : activeAgent.marketAreas) || adSettings.targetCities || ["Portland Metro"],`
);

fs.writeFileSync('src/components/AdsCampaignHub.tsx', code);
