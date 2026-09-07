import fs from 'fs';

const usdaRaw = fs.readFileSync('data/geosphere/oregon-usda-tracts.json', 'utf8');
const usdaObj = JSON.parse(usdaRaw);
console.log("USDA features:", usdaObj.features.length);

const lmiRaw = fs.readFileSync('data/geosphere/oregon-lmi-tracts.js', 'utf8');
const lmiJsonStr = lmiRaw.replace('const oregonTractGeoJSON = ', '').replace(/;\s*$/, '');
const lmiObj = JSON.parse(lmiJsonStr);
console.log("LMI features:", lmiObj.features.length);
