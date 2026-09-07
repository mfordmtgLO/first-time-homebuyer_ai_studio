const fs = require('fs');
let c = fs.readFileSync('src/components/MasterLeadJourneyTab.tsx', 'utf8');

if (!c.includes('BellRing,')) {
    c = c.replace('import {\\n  CheckCircle2,', 'import {\\n  BellRing,\\n  CheckCircle2,');
}

const target = `<MapPin className="w-3.5 h-3.5" /> Sync to Lead's Google Maps
                                </button>
                            )}`;

const injection = `<MapPin className="w-3.5 h-3.5" /> Sync to Lead's Google Maps
                                </button>
                            )}

                            {/* Price Drop Simulation */}
                            <button
                                onClick={() => {
                                    alert(\`Firebase Cloud Function Triggered: A $15,000 price drop was detected on a saved property via Rentcast API.\\n\\nAn automated Google Maps Mobile Push Notification and Email have been dispatched to \${lead.fullName.split(' ')[0]}. The LO dashboard and Property Tracker are now updated.\`);

                                    if (properties && setProperties && properties.length > 0) {
                                        const pToUpdate = properties[0];
                                        if (!pToUpdate.priceDropAmount) {
                                            const updatedP = {
                                                ...pToUpdate,
                                                priceDropAmount: 15000,
                                                originalPrice: pToUpdate.price + 15000,
                                                priceDropDate: new Date().toISOString()
                                            };
                                            const newProps = [updatedP, ...properties.slice(1)];
                                            setProperties(newProps);
                                        }
                                    }
                                    
                                    const newLog = {
                                        id: Date.now().toString(),
                                        type: 'system',
                                        direction: 'inbound',
                                        timestamp: new Date().toISOString(),
                                        agentId: 'lo_system',
                                        content: \`Firebase Cloud Function: $15,000 price drop detected on saved property. Automated Google Maps Push Notification & Email dispatched to \${lead.fullName.split(' ')[0]}.\`,
                                        metadata: { subject: "Automated Price Drop Alert" }
                                    };
                                    
                                    onUpdateLead({
                                        ...lead,
                                        outreachLogs: [newLog, ...(lead.outreachLogs || [])],
                                    });
                                }}
                                className="w-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 py-1.5 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 shadow-sm mt-1.5"
                            >
                                <BellRing className="w-3.5 h-3.5" /> Trigger Cloud Function: Price Drop
                            </button>`;

c = c.replace(target, injection);

fs.writeFileSync('src/components/MasterLeadJourneyTab.tsx', c);
