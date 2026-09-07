const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyMapOverlay.tsx', 'utf8');

const target = `                          {getZillowUrl(activeSelectedProperty) && (
                            <a
                              href={getZillowUrl(activeSelectedProperty)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded border border-[#EAE7E0] hover:bg-stone-100 text-[#606C5D]"
                              title="View on Zillow"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>`;

const injection = `                          {getZillowUrl(activeSelectedProperty) && (
                            <a
                              href={getZillowUrl(activeSelectedProperty)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded border border-[#EAE7E0] hover:bg-stone-100 text-[#606C5D]"
                              title="View on Zillow"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <a
                            href={\`https://www.google.com/maps/search/?api=1&query=\${activeSelectedProperty.lat},\${activeSelectedProperty.lng}\`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded border border-[#EAE7E0] hover:bg-stone-100 text-blue-600 ml-auto flex items-center gap-1 px-1.5"
                            title="Save to My Google Maps"
                            onClick={() => {
                              // Optional: Fire telemetry event to track that visitor saved this to their personal maps
                              console.log('Visitor saved property to their personal Google Maps', activeSelectedProperty.id);
                            }}
                          >
                            <MapPin className="w-3 h-3" /> <span className="text-[9px] font-bold">Save</span>
                          </a>
                        </div>`;

c = c.replace(target, injection);
fs.writeFileSync('src/components/PropertyMapOverlay.tsx', c);
