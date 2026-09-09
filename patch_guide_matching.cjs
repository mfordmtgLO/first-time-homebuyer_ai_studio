const fs = require('fs');

let guideMatching = fs.readFileSync('src/utils/guideMatching.ts', 'utf8');
guideMatching = guideMatching.replace(
  'company: lo.company || matchedDefault?.company || "Cornerstone First Mortgage",',
  'company: "Cornerstone First Mortgage, LLC NMLS#173855", // Enforce compliance name'
);
fs.writeFileSync('src/utils/guideMatching.ts', guideMatching);
