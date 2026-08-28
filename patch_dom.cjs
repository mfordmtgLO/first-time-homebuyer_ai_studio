const fs = require('fs');
const file = 'src/components/PropertyTracker.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldGrid = `                  {/* Specs Pill Grid */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#EAE7E0] text-xs text-center">
                    <div>
                      <span className="text-[#9A9488] block text-[10px]">Bedrooms</span>
                      <span className="font-bold text-[#2D362E]">{property.beds} Beds</span>
                    </div>
                    <div>
                      <span className="text-[#9A9488] block text-[10px]">Bathrooms</span>
                      <span className="font-bold text-[#2D362E]">{property.baths} Baths</span>
                    </div>
                    <div>
                      <span className="text-[#9A9488] block text-[10px]">Living Area</span>
                      <span className="font-bold text-[#2D362E]">{property.sqft} sqft</span>
                    </div>
                  </div>`;

const newGrid = `                  {/* Specs Pill Grid */}
                  <div className="grid grid-cols-4 gap-2 py-2 border-y border-[#EAE7E0] text-xs text-center">
                    <div>
                      <span className="text-[#9A9488] block text-[10px]">Bedrooms</span>
                      <span className="font-bold text-[#2D362E]">{property.beds}</span>
                    </div>
                    <div>
                      <span className="text-[#9A9488] block text-[10px]">Bathrooms</span>
                      <span className="font-bold text-[#2D362E]">{property.baths}</span>
                    </div>
                    <div>
                      <span className="text-[#9A9488] block text-[10px]">Living Area</span>
                      <span className="font-bold text-[#2D362E]">{property.sqft} sqft</span>
                    </div>
                    <div className="relative group cursor-help">
                      <span className="text-[#9A9488] block text-[10px] flex items-center justify-center gap-0.5">DOM <AlertCircle className="w-2.5 h-2.5" title="Days on Market (snapshot at time of import, may not reflect live listing data)" /></span>
                      <span className="font-bold text-[#2D362E]">{property.daysOnMarket !== undefined ? property.daysOnMarket : "N/A"}</span>
                    </div>
                  </div>`;

content = content.replace(oldGrid, newGrid);
fs.writeFileSync(file, content);
