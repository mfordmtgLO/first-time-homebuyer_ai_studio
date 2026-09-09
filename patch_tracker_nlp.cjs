const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyTracker.tsx', 'utf8');

const importTarget = `import { getPropertyOhcsPriceLimit, OREGON_COUNTY_PRICE_LIMITS } from "../utils/ohcsPurchaseLimits";`;
const importReplacement = `import { getPropertyOhcsPriceLimit, OREGON_COUNTY_PRICE_LIMITS } from "../utils/ohcsPurchaseLimits";
import { getNearbyAmenities, getListingSchoolDistrict } from "../utils/propertyMapUtils";`;

if (!code.includes('getNearbyAmenities')) {
  code = code.replace(importTarget, importReplacement);
}

const filterTarget = `      const sqftMatch = q.includes("sqft") && p.sqft >= parseInt(q.match(/(\\d+)\\s*sqft/i)?.[1] || "0");
      const domMatch = (q.includes("days") || q.includes("dom")) && (p.daysOnMarket || 0) <= parseInt(q.match(/(\\d+)\\s*(?:days|dom)/i)?.[1] || "999");
      
      if (!textMatch && !bedMatch && !bathMatch && !sqftMatch && !domMatch) return false;`;
      
const filterReplacement = `      const sqftMatch = q.includes("sqft") && p.sqft >= parseInt(q.match(/(\\d+)\\s*sqft/i)?.[1] || "0");
      const domMatch = (q.includes("days") || q.includes("dom")) && (p.daysOnMarket || 0) <= parseInt(q.match(/(\\d+)\\s*(?:days|dom)/i)?.[1] || "999");
      
      // Proximity & Amenity NLP Matchers
      const wantsSchools = q.includes("school");
      const schoolMatch = wantsSchools && getListingSchoolDistrict(p).averageRating >= 7;
      
      const wantsGrocery = q.includes("grocery") || q.includes("groceries") || q.includes("whole foods") || q.includes("trader");
      const groceryMatch = wantsGrocery && getNearbyAmenities(p).some(a => a.category === 'grocery' && a.distanceMiles <= 1.5);
      
      const wantsTransit = q.includes("transit") || q.includes("max") || q.includes("train");
      const transitMatch = wantsTransit && getNearbyAmenities(p).some(a => a.category === 'transit' && a.distanceMiles <= 1.5);

      if (!textMatch && !bedMatch && !bathMatch && !sqftMatch && !domMatch && !(wantsSchools && schoolMatch) && !(wantsGrocery && groceryMatch) && !(wantsTransit && transitMatch)) {
         // If they typed something that triggered a proximity intent but it failed the match, return false
         if (wantsSchools || wantsGrocery || wantsTransit) return false;
         // Otherwise if it's just text and no text match, return false
         if (!textMatch && !bedMatch && !bathMatch && !sqftMatch && !domMatch) return false;
      }`;
code = code.replace(filterTarget, filterReplacement);

fs.writeFileSync('src/components/PropertyTracker.tsx', code);
