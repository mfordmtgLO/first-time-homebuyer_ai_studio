const fs = require('fs');
let c = fs.readFileSync('src/components/MasterLeadJourneyTab.tsx', 'utf8');

const target = `                                  onClick={() => {
                                    alert(\`Success! Pushed \${lead.curatedPropertyIds?.length} curated property pins directly to \${lead.fullName}'s personal Google Maps "Saved Lists" via secure token!\\n\\nA co-branded invite email (featuring you and \${lead.assignedAgent || 'the realtor'}) has been dispatched to \${lead.email}.\`);
                                  }}`;

const injection = `                                  onClick={() => {
                                    alert(\`Success! Pushed \${lead.curatedPropertyIds?.length} curated property pins directly to \${lead.fullName}'s personal Google Maps "Saved Lists" via secure token!\\n\\nA co-branded invite email (featuring you and \${lead.assignedAgent || 'the realtor'}) has been dispatched to \${lead.email}.\`);
                                    
                                    const newLog = {
                                      id: Date.now().toString(),
                                      type: 'email',
                                      direction: 'outbound',
                                      timestamp: new Date().toISOString(),
                                      agentId: 'lo_system',
                                      content: \`Hi \${lead.fullName.split(' ')[0]}, I curated \${lead.curatedPropertyIds?.length} properties for you using our AI map search. I've synced them directly to your Google Maps account for easy navigation! Let me and \${lead.assignedAgent || 'my partner agent'} know which ones you want to tour.\`,
                                      metadata: { subject: "Your Custom Google Maps Property Tour is Ready!" }
                                    };
                                    
                                    onUpdateLead({
                                      ...lead,
                                      outreachLogs: [newLog, ...(lead.outreachLogs || [])],
                                      status: lead.status === 'new' ? 'contacted' : lead.status
                                    });
                                  }}`;

c = c.replace(target, injection);
fs.writeFileSync('src/components/MasterLeadJourneyTab.tsx', c);
