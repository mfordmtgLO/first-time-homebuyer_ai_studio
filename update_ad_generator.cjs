const fs = require('fs');
let code = fs.readFileSync('src/components/ai/AICommercialAdGenerator.tsx', 'utf8');

// Add import
const importStr = `import { SyncedAdsManager } from "./SyncedAdsManager";\n`;
if (!code.includes("SyncedAdsManager")) {
  code = importStr + code;
}

// Find where to inject the component. Let's place it at the very top of the generator.
// Let's look for `<div className="space-y-6">` inside the return statement.
const insertMarker = `<div className="space-y-6">`;
if (code.includes(insertMarker)) {
  code = code.replace(insertMarker, insertMarker + `\n      <SyncedAdsManager />`);
  fs.writeFileSync('src/components/ai/AICommercialAdGenerator.tsx', code, 'utf8');
  console.log("Successfully injected SyncedAdsManager.");
} else {
  console.log("Could not find insert marker.");
}
