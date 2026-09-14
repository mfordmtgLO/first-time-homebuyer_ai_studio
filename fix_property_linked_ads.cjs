const fs = require('fs');
let code = fs.readFileSync('src/components/ai/PropertyLinkedAds.tsx', 'utf8');

code = code.replace('\\`/api/ads/property/\\${encodeURIComponent(propertyId)}?loId=\\${loanOfficerId}\\`', '`/api/ads/property/${encodeURIComponent(propertyId)}?loId=${loanOfficerId}`');

code = code.replace('\\`Hey! I saw you looking at \\${propertyAddress}. Did you know this exact home qualifies for 0% down USDA financing? I made a quick video breakdown for you, check it out!\\`', '`Hey! I saw you looking at ${propertyAddress}. Did you know this exact home qualifies for 0% down USDA financing? I made a quick video breakdown for you, check it out!`');

code = code.replace('\\`\\${ad.adCopy}\\\\n\\\\n[Attached Video: \\${ad.title}]\\`', '`${ad.adCopy}\\n\\n[Attached Video: ${ad.title}]`');

fs.writeFileSync('src/components/ai/PropertyLinkedAds.tsx', code, 'utf8');
console.log("Fixed PropertyLinkedAds.tsx syntax");
