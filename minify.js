const fs = require('fs');
let u = JSON.parse(fs.readFileSync('data/geosphere/oregon-usda-tracts.json'));
fs.writeFileSync('data/geosphere/oregon-usda-tracts.json', JSON.stringify(u));
let l = JSON.parse(fs.readFileSync('data/geosphere/oregon-lmi-tracts.js').toString().replace('const oregonTractGeoJSON = ', '').replace(/;\s*$/, ''));
fs.writeFileSync('data/geosphere/oregon-lmi-tracts.json', JSON.stringify(l));
