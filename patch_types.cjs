const fs = require('fs');
let c = fs.readFileSync('src/types.ts', 'utf8');

const target = `  price: number;
  beds: number;`;
const injection = `  price: number;
  originalPrice?: number;
  priceDropAmount?: number;
  priceDropDate?: string;
  beds: number;`;

c = c.replace(target, injection);
fs.writeFileSync('src/types.ts', c);
