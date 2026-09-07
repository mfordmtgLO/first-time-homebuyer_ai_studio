const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyCard.tsx', 'utf8');

const target = `<div className="flex flex-col items-end gap-2">
              <span className="text-xs font-semibold text-white bg-[#4A5D4E]/90 px-2.5 py-0.5 rounded-md shadow-2xs backdrop-blur-xs">
                Est. {formatUSD(estMonthly)}/mo
              </span>`;

const injection = `<div className="flex flex-col items-end gap-2">
              {property.priceDropAmount ? (
                <span className="text-xs font-bold text-white bg-red-600/90 px-2.5 py-0.5 rounded-md shadow-2xs backdrop-blur-xs flex items-center gap-1 animate-pulse">
                  <Flame className="w-3 h-3" />
                  Price Drop: -{formatUSD(property.priceDropAmount)}
                </span>
              ) : (
                <span className="text-xs font-semibold text-white bg-[#4A5D4E]/90 px-2.5 py-0.5 rounded-md shadow-2xs backdrop-blur-xs">
                  Est. {formatUSD(estMonthly)}/mo
                </span>
              )}`;

c = c.replace(target, injection);

if (!c.includes('Flame,')) {
    c = c.replace('import {\\n  Navigation,', 'import {\\n  Navigation,\\n  Flame,');
}

// Add original price strikethrough next to current price
const priceTarget = `<span className="text-xl font-bold text-white tracking-tight drop-shadow-md">
                {formatUSD(property.price)}
              </span>
              <span className="text-[11px] text-white/90 ml-1.5">(\${Math.round(property.price / property.sqft)}/sqft)</span>`;

const priceInjection = `<span className="text-xl font-bold text-white tracking-tight drop-shadow-md">
                {formatUSD(property.price)}
              </span>
              {property.originalPrice && (
                <span className="text-[11px] text-white/70 ml-1.5 line-through decoration-red-400">
                  {formatUSD(property.originalPrice)}
                </span>
              )}
              <span className="text-[11px] text-white/90 ml-1.5">(\${Math.round(property.price / property.sqft)}/sqft)</span>`;

c = c.replace(priceTarget, priceInjection);

fs.writeFileSync('src/components/PropertyCard.tsx', c);
