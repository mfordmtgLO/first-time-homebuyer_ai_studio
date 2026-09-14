const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyCard.tsx', 'utf8');

if (!code.includes('import { PropertyLinkedAds }')) {
  code = code.replace(
    'import { PropertyNotesThread } from "./PropertyNotesThread";',
    'import { PropertyNotesThread } from "./PropertyNotesThread";\\nimport { PropertyLinkedAds } from "./ai/PropertyLinkedAds";'
  );
}

const linkedAdsBlock = `          {/* Injected Vantage Ads Engine Asset Viewer */}
          <PropertyLinkedAds 
            propertyId={property.id} 
            propertyAddress={property.address} 
            loanOfficerId={loanOfficer?.id}
          />`;

if (!code.includes('<PropertyLinkedAds')) {
  code = code.replace(
    '{/* Bidirectional Property Notes Thread, Gamified Q&A & Co-Branded Schema */}',
    linkedAdsBlock + '\\n          {/* Bidirectional Property Notes Thread, Gamified Q&A & Co-Branded Schema */}'
  );
  fs.writeFileSync('src/components/PropertyCard.tsx', code, 'utf8');
  console.log("Updated PropertyCard with PropertyLinkedAds");
} else {
  console.log("Already updated");
}
