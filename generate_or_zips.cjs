const zipcodes = require('zipcodes');
const fs = require('fs');

const orZips = zipcodes.lookupByState('OR');

// Group cities by zip code in case a zip has multiple cities (though usually zip -> city is 1:1 or 1:many aliases)
const zipMap = {};

orZips.forEach(z => {
  if (!zipMap[z.zip]) {
    zipMap[z.zip] = new Set();
  }
  zipMap[z.zip].add(z.city);
});

// Sort zips numerically
const sortedZips = Object.keys(zipMap).sort((a, b) => parseInt(a) - parseInt(b));

let markdown = `# Oregon Zip Codes & Associated Cities\n\n| Zip Code | City / Cities |\n|----------|---------------|\n`;

sortedZips.forEach(zip => {
  const cities = Array.from(zipMap[zip]).join(', ');
  markdown += `| ${zip} | ${cities} |\n`;
});

fs.writeFileSync('oregon_zip_codes.md', markdown, 'utf8');
console.log(`Generated list with ${sortedZips.length} zip codes.`);
