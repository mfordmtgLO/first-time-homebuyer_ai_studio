const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyMapOverlay.tsx', 'utf8');

// Add Lucide Icons if missing
if (!code.includes('Bed,')) {
    code = code.replace(
        '  Flame,\n} from "lucide-react";',
        '  Flame,\n  Bed,\n  Bath,\n  Maximize,\n  Clock,\n} from "lucide-react";'
    );
}

// Insert the stats row
const target = `<p className="text-[10px] text-[#606C5D]">
                            {activeSelectedProperty.address}, {activeSelectedProperty.city}
                          </p>
                        </div>`;
const replacement = `<p className="text-[10px] text-[#606C5D]">
                            {activeSelectedProperty.address}, {activeSelectedProperty.city}
                          </p>
                        </div>

                        {/* Beds, Baths, Sqft, DOM */}
                        <div className="flex items-center gap-3 text-[10px] text-[#5C6F60] font-medium py-0.5">
                          <div className="flex items-center gap-1" title="Bedrooms">
                            <Bed className="w-3 h-3 text-[#8C9A8E]" />
                            <span>{activeSelectedProperty.beds}</span>
                          </div>
                          <div className="flex items-center gap-1" title="Bathrooms">
                            <Bath className="w-3 h-3 text-[#8C9A8E]" />
                            <span>{activeSelectedProperty.baths}</span>
                          </div>
                          <div className="flex items-center gap-1" title="Square Feet">
                            <Maximize className="w-3 h-3 text-[#8C9A8E]" />
                            <span>{activeSelectedProperty.sqft.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1 ml-auto" title="Days on Market">
                            <Clock className="w-3 h-3 text-[#8C9A8E]" />
                            <span>{activeSelectedProperty.daysOnMarket || 1} DOM</span>
                          </div>
                        </div>`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/PropertyMapOverlay.tsx', code);
