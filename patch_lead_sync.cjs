const fs = require('fs');
let c = fs.readFileSync('src/components/MasterLeadJourneyTab.tsx', 'utf8');

const target = `</button>
                        </div>

                        <div className="space-y-1">`;

const injection = `</button>
                        </div>
                        
                        {/* Ask GeoSphere Google Maps Sync Section */}
                        <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 space-y-2 mt-3 mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> GeoSphere Maps Sync
                            </h5>
                            {lead.hasOptedInToGoogleMapsSync ? (
                                <span className="text-[9px] font-bold bg-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                  <CheckCircle2 className="w-2.5 h-2.5" /> Opted-In
                                </span>
                            ) : (
                                <span className="text-[9px] font-bold bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full">
                                  Pending Opt-In
                                </span>
                            )}
                          </div>
                          
                          <div className="text-[10px] text-indigo-900/80 mb-2 leading-relaxed">
                            Use <strong>Ask GeoSphere</strong> to curate a custom property list based on LMI grants and their budget. Sync pins directly to {lead.fullName.split(' ')[0]}'s personal Google Maps app for high retention.
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <button 
                              onClick={() => {
                                const q = prompt(\`Enter a natural language search for \${lead.fullName.split(' ')[0]} (e.g. "homes under $450k near St. Johns with 0% down grant"):\`);
                                if (q) {
                                  alert(\`Ask GeoSphere parsed: "\${q}"\\n\\nCross-referencing Rentcast API and Census Tract LMI boundaries...\\n\\nFound 6 matches.\`);
                                  onUpdateLead({ 
                                    ...lead, 
                                    lastAskMapsQuery: q,
                                    curatedPropertyIds: ['prop1', 'prop2', 'prop3'],
                                    hasOptedInToGoogleMapsSync: true 
                                  });
                                }
                              }}
                              className="w-full bg-white border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 text-indigo-800 py-1.5 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 shadow-sm"
                            >
                              <Search className="w-3.5 h-3.5" /> Ask AI to Curate List
                            </button>

                            {(lead.curatedPropertyIds?.length || 0) > 0 && (
                                <button 
                                  onClick={() => {
                                    alert(\`Success! Pushed \${lead.curatedPropertyIds?.length} curated property pins directly to \${lead.fullName}'s personal Google Maps "Saved Lists" via secure token!\\n\\nA co-branded invite email (featuring you and \${lead.assignedAgent || 'the realtor'}) has been dispatched to \${lead.email}.\`);
                                  }}
                                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 shadow-sm"
                                >
                                  <MapPin className="w-3.5 h-3.5" /> Sync to Lead's Google Maps
                                </button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1">`;

c = c.replace(target, injection);
fs.writeFileSync('src/components/MasterLeadJourneyTab.tsx', c);
