const fs = require('fs');
const file = 'src/components/GeoSphereSyncHub.tsx';
let content = fs.readFileSync(file, 'utf8');

const agentSection = `                    </div>

                    {/* Agent Info Box (Dashboard Only) */}
                    {(listing.listingAgent || listing.listingOffice) && (
                      <div className="mt-2 p-2 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0] space-y-1.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#606C5D] uppercase tracking-wider flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Agent Info
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const textToCopy = [
                                listing.listingAgent?.name && \`Name: \${listing.listingAgent.name}\`,
                                listing.listingAgent?.phone && \`Phone: \${listing.listingAgent.phone}\`,
                                listing.listingAgent?.email && \`Email: \${listing.listingAgent.email}\`,
                                listing.listingOffice?.name && \`Brokerage: \${listing.listingOffice.name}\`,
                                listing.listingAgent?.website && \`Website: \${listing.listingAgent.website}\`
                              ].filter(Boolean).join('\\n');
                              if (textToCopy) {
                                navigator.clipboard.writeText(textToCopy);
                                onTriggerToast("Agent details copied to clipboard!");
                              }
                            }}
                            className="text-[9px] font-bold text-[#4A5D4E] hover:bg-[#4A5D4E]/10 px-1.5 py-0.5 rounded transition-colors"
                          >
                            Copy
                          </button>
                        </div>
                        {listing.listingAgent?.name && (
                          <div className="text-[11px] font-medium text-[#2D362E] truncate">
                            {listing.listingAgent.name}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-x-2 gap-y-1 text-[10px]">
                          {listing.listingAgent?.phone && (
                            <a href={\`tel:\${listing.listingAgent.phone}\`} className="text-blue-600 hover:underline">{listing.listingAgent.phone}</a>
                          )}
                          {listing.listingAgent?.email && (
                            <a href={\`mailto:\${listing.listingAgent.email}\`} className="text-blue-600 hover:underline max-w-[120px] truncate">{listing.listingAgent.email}</a>
                          )}
                        </div>
                        {listing.listingOffice?.name && (
                          <div className="text-[9px] text-[#606C5D] truncate">
                            {listing.listingOffice.name}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Card Footer: View Details & Publish Toggle */}`;

content = content.replace(
  /                    <\/div>\s+\{\/\* Card Footer: View Details & Publish Toggle \*\/\}/,
  agentSection
);

fs.writeFileSync(file, content);
