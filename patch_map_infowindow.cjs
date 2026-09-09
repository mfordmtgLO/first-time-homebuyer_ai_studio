const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyMapOverlay.tsx', 'utf8');

const importTarget = `import { PropertyListing, FinancialProfile } from "../types";`;
const importReplacement = `import { PropertyListing, FinancialProfile, PropertyConversation } from "../types";
import { subscribeToPropertyConversation } from "../services/propertyConversationService";`;
code = code.replace(importTarget, importReplacement);

// State for conversation inside InfoWindow requires a custom component or tracking.
// Since InfoWindow renders conditionally, let's just create a quick wrapper component inside the file or manage it in the main component.

// Actually, let's just add state to PropertyMapOverlay
const stateTarget = `  const [activeSelectedProperty, setActiveSelectedProperty] = useState<`;
const stateReplacement = `  const [propertyConversation, setPropertyConversation] = useState<PropertyConversation | null>(null);
  
  // Effect to subscribe to the active selected property's conversation
  useEffect(() => {
    if (!selectedPropertyId || !profile?.id) {
      setPropertyConversation(null);
      return;
    }
    const unsub = subscribeToPropertyConversation(selectedPropertyId, profile.id, setPropertyConversation);
    return () => unsub();
  }, [selectedPropertyId, profile?.id]);

  const [activeSelectedProperty, setActiveSelectedProperty] = useState<`;
code = code.replace(stateTarget, stateReplacement);

const infoWindowTarget = `{/* Readiness & School District Snippet */}`;
const infoWindowReplacement = `
                        {/* LO & Cobrand Agent Contacts */}
                        <div className="bg-sky-50 p-1.5 rounded-lg border border-sky-100 flex items-center justify-between text-[9px] font-medium text-sky-800">
                           <div className="flex items-center gap-1">
                             <div className="w-4 h-4 rounded-full bg-sky-200 flex items-center justify-center font-bold">LO</div>
                             <span>Mike Ford (Mortgage)</span>
                           </div>
                           <div className="flex items-center gap-1">
                             <div className="w-4 h-4 rounded-full bg-sky-200 flex items-center justify-center font-bold">RE</div>
                             <span>Kanndice M. (Agent)</span>
                           </div>
                        </div>

                        {/* GeoSphere Sync & Loan Flags */}
                        <div className="flex flex-wrap gap-1">
                           <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[8px] font-bold border border-emerald-200">
                             GEO-SYNC: RENTCAST
                           </span>
                           <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded text-[8px] font-bold border border-purple-200">
                             $0 DPA ELIGIBLE
                           </span>
                           <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[8px] font-bold border border-amber-200">
                             SELLER CREDIT 2-1
                           </span>
                        </div>

                        {/* Dynamic Q&A Notes */}
                        <div className="bg-[#FAF9F5] p-2 rounded-xl border border-[#EAE7E0] text-[10px] space-y-1">
                          <div className="font-bold text-[#4A5D4E] flex items-center justify-between">
                            <span>Live Property Q&A</span>
                            {propertyConversation?.hasPendingActionItem && (
                              <span className="text-[8px] bg-red-100 text-red-600 px-1 rounded animate-pulse">Pending LO</span>
                            )}
                          </div>
                          <p className="text-[9px] text-[#606C5D] italic line-clamp-2">
                            {propertyConversation?.notes 
                              ? \`"\${propertyConversation.notes}"\` 
                              : "No questions asked yet. Ask Mike about this property!"}
                          </p>
                        </div>

                        {/* Readiness & School District Snippet */}`;

code = code.replace(infoWindowTarget, infoWindowReplacement);

fs.writeFileSync('src/components/PropertyMapOverlay.tsx', code);
