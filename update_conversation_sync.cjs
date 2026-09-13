const fs = require('fs');
let code = fs.readFileSync('src/components/LeadPropertyConversationSync.tsx', 'utf8');

const importStr = `import { PropertyLinkedAds } from "./ai/PropertyLinkedAds";\n`;
if (!code.includes("PropertyLinkedAds")) {
  code = importStr + code;
  
  const insertMarker = `{/* Quick LO 1-Tap Responses */}`;
  if (code.includes(insertMarker)) {
    const linkedAdsComponent = `
          {/* VANTAGE AI ADS ENGINE: LINKED ADS */}
          <PropertyLinkedAds propertyId={propertyId} propertyAddress={propertyAddress} leadId={leadId} loanOfficerId={currentLo?.id} />
    `;
    code = code.replace(insertMarker, linkedAdsComponent + '\n          ' + insertMarker);
    fs.writeFileSync('src/components/LeadPropertyConversationSync.tsx', code, 'utf8');
    console.log("Successfully injected PropertyLinkedAds into LeadPropertyConversationSync");
  } else {
    console.log("Could not find insert marker.");
  }
}
