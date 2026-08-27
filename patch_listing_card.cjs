const fs = require('fs');
const file = 'src/components/GeoSphereSyncHub.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Make the container clickable
content = content.replace(
  /                <div\s+key=\{listing\.id\}\s+className=\{\`rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between bg-white \$\{\s+isSelected \? "border-\\[#4A5D4E\\] ring-2 ring-\\[#4A5D4E\\]\/20" : "border-\\[#EAE7E0\\] hover:border-stone-400"\s+\}\`\}\s+>/,
  \`                <div
                  key={listing.id}
                  onClick={() => setInspectingListing(listing)}
                  className={\\\`rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between bg-white cursor-pointer hover:shadow-md \${
                    isSelected ? "border-[#4A5D4E] ring-2 ring-[#4A5D4E]/20" : "border-[#EAE7E0] hover:border-[#4A5D4E]/50"
                  }\\\`}
                >\`
);

// 2. Add stopPropagation to Checkbox Selector (photo header)
content = content.replace(
  /onClick=\{.*?handleToggleSelectListing.*?listing\.id.*?\}\s+className="absolute top-2.5 left-2.5 z-10 w-6 h-6/,
  \`onClick={(e) => { e.stopPropagation(); handleToggleSelectListing(listing.id); }}
                        className="absolute top-2.5 left-2.5 z-10 w-6 h-6\`
);

// 3. Add stopPropagation to Checkbox Selector (clean header)
content = content.replace(
  /onClick=\{.*?handleToggleSelectListing.*?listing\.id.*?\}\s+className="w-5 h-5 rounded-md bg-white border border-\\[#EAE7E0\\]/,
  \`onClick={(e) => { e.stopPropagation(); handleToggleSelectListing(listing.id); }}
                            className="w-5 h-5 rounded-md bg-white border border-[#EAE7E0]\`
);

// 4. Add stopPropagation to Zillow link
content = content.replace(
  /href=\{getZillowUrl\(listing\)\}\s+target="_blank"\s+rel="noopener noreferrer"/,
  \`onClick={(e) => e.stopPropagation()}
                          href={getZillowUrl(listing)}
                          target="_blank"
                          rel="noopener noreferrer"\`
);

// 5. Add stopPropagation to Publish to Site button
content = content.replace(
  /onClick=\{.*?handleToggleSinglePublish.*?listing\.id.*?\}\s+className=\{\`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer \$\{/,
  \`onClick={(e) => { e.stopPropagation(); handleToggleSinglePublish(listing.id); }}
                        className={\\\`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer \${\`
);

// 6. Remove inner click handler on the image
content = content.replace(
  /className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"\s+onClick=\{.*?setInspectingListing\(listing\).*?\}/,
  \`className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"\`
);

// 7. Remove inner click handler on the title div
content = content.replace(
  /<div className="cursor-pointer" onClick=\{.*?setInspectingListing\(listing\).*?\}>/,
  \`<div>\`
);

fs.writeFileSync(file, content);
