const fs = require('fs');

// Patch initialData.ts
let initialData = fs.readFileSync('src/data/initialData.ts', 'utf8');
initialData = initialData.replace(
  'company: "Cornerstone First Mortgage",',
  'company: "Cornerstone First Mortgage, LLC NMLS#173855",'
);
fs.writeFileSync('src/data/initialData.ts', initialData);

// Patch guideMatching.ts
let guideMatching = fs.readFileSync('src/utils/guideMatching.ts', 'utf8');
guideMatching = guideMatching.replace(
  'company: lo.company || matchedDefault?.company || "CrossCountry Mortgage",',
  'company: (lo.company && lo.company !== "CrossCountry Mortgage") ? lo.company : (matchedDefault?.company || "CrossCountry Mortgage, LLC"),'
);
fs.writeFileSync('src/utils/guideMatching.ts', guideMatching);
