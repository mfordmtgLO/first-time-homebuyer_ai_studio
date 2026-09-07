const fs = require('fs');
let c = fs.readFileSync('src/components/MasterLeadJourneyTab.tsx', 'utf8');

const oldOnClick = `onClick={() => {
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
                                }}`;

const newOnClick = `onClick={async () => {
                                    try {
                                        const pToUpdate = properties && properties.length > 0 ? properties[0] : null;
                                        const propId = pToUpdate ? pToUpdate.id : "mock_prop_123";
                                        
                                        const res = await fetch("/api/functions/trigger-price-drop", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                leadEmail: lead.email,
                                                leadName: lead.fullName.split(' ')[0],
                                                propertyId: propId,
                                                dropAmount: 15000
                                            })
                                        });
                                        const data = await res.json();
                                        
                                        alert(\`🔥 FIREBASE CLOUD FUNCTION EXECUTED:\\n\\nLogs:\\n- \${data.logs.join('\\n- ')}\\n\\nEmail Dispatched To: \${data.dispatchedEmail.to}\\nPush Token: \${data.dispatchedPush.token}\`);
                                        
                                        if (properties && setProperties && properties.length > 0) {
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
                                    } catch (err) {
                                        console.error(err);
                                        alert("Failed to execute Cloud Function.");
                                    }
                                }}`;

c = c.replace(oldOnClick, newOnClick);
fs.writeFileSync('src/components/MasterLeadJourneyTab.tsx', c);
