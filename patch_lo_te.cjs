const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

// Imports
code = code.replace(
  'import { SalesforceSettingsModal } from "./SalesforceSettingsModal";',
  'import { SalesforceSettingsModal } from "./SalesforceSettingsModal";\\nimport { TotalExpertSettingsModal } from "./TotalExpertSettingsModal";'
);

// State
code = code.replace(
  'const [showSalesforceSettings, setShowSalesforceSettings] = useState<boolean>(false);',
  'const [showSalesforceSettings, setShowSalesforceSettings] = useState<boolean>(false);\\n  const [showTotalExpertSettings, setShowTotalExpertSettings] = useState<boolean>(false);'
);

// Header Buttons
const sfBtnStr = '            {/* Salesforce CRM Integration Button */}\\n            <button\\n              onClick={() => setShowSalesforceSettings(true)}\\n              title="Configure Salesforce Enterprise CRM Handoff"\\n              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"\\n            >\\n              <Cloud className="w-3.5 h-3.5 text-blue-300" />\\n              <span className="hidden sm:inline">Salesforce Sync</span>\\n            </button>';

const teBtnStr = sfBtnStr + '\\n\\n            {/* Total Expert CRM Integration Button */}\\n            <button\\n              onClick={() => setShowTotalExpertSettings(true)}\\n              title="Configure Total Expert CRM Handoff"\\n              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-800 hover:bg-indigo-900 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"\\n            >\\n              <Users className="w-3.5 h-3.5 text-indigo-300" />\\n              <span className="hidden sm:inline">Total Expert</span>\\n            </button>';

code = code.replace(sfBtnStr, teBtnStr);

// Modal
const sfModalStr = '      {/* Salesforce Settings Modal */}\\n      <SalesforceSettingsModal\\n        isOpen={showSalesforceSettings}\\n        onClose={() => setShowSalesforceSettings(false)}\\n      />';

const teModalStr = sfModalStr + '\\n\\n      {/* Total Expert Settings Modal */}\\n      <TotalExpertSettingsModal\\n        isOpen={showTotalExpertSettings}\\n        onClose={() => setShowTotalExpertSettings(false)}\\n      />';

code = code.replace(sfModalStr, teModalStr);

// Handle Sync Function
const handleStr = '  const handleToggleLeadNurture = (leadId: string) => {';
const handleTeStr = '  const handleTotalExpertSync = async (lead: CapturedLead) => {\\n    try {\\n      const user = auth.currentUser;\\n      if (!user) throw new Error("Must be logged in");\\n      \\n      const idToken = await user.getIdToken();\\n      const docSnap = await getDoc(doc(db, "user_integrations", user.uid));\\n      if (!docSnap.exists() || !docSnap.data().totalExpertVault) {\\n        triggerToast("No Total Expert vault found. Please configure settings first.");\\n        setShowTotalExpertSettings(true);\\n        return;\\n      }\\n\\n      triggerToast("Syncing to Total Expert...");\\n      const res = await fetch("/api/totalexpert/sync-lead", {\\n        method: "POST",\\n        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` },\\n        body: JSON.stringify({\\n          teVault: docSnap.data().totalExpertVault,\\n          lead\\n        })\\n      });\\n      const data = await res.json();\\n      if (res.ok) {\\n        triggerToast(`Successfully synced to Total Expert! ID: ${data.teId}`);\\n        const currentLeads = guidesState.leads || [];\\n        const updated = currentLeads.map(l => l.id === lead.id ? { ...l, totalExpertId: data.teId, totalExpertSyncedAt: new Date().toISOString() } : l);\\n        onUpdateGuidesState({ ...guidesState, leads: updated });\\n      } else {\\n        triggerToast(`Sync failed: ${data.error}`);\\n      }\\n    } catch (e: any) {\\n      console.error(e);\\n      triggerToast(`Sync error: ${e.message}`);\\n    }\\n  };\\n\\n' + handleStr;

code = code.replace(handleStr, handleTeStr);

// Badge
const sfBadgeStr = '{lead.salesforceId && (\\n                                            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-800 border border-blue-200" title="Synced to Salesforce">\\n                                              <Cloud className="w-2.5 h-2.5 text-blue-600" />\\n                                              {lead.salesforceId}\\n                                            </span>\\n                                          )}';

const teBadgeStr = sfBadgeStr + '\\n                                          {lead.totalExpertId && (\\n                                            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200" title="Synced to Total Expert">\\n                                              <Users className="w-2.5 h-2.5 text-indigo-600" />\\n                                              {lead.totalExpertId}\\n                                            </span>\\n                                          )}';

code = code.replace(sfBadgeStr, teBadgeStr);

// Sync Button
const sfSyncBtnStr = '                                        <button\\n                                          onClick={() => handleSalesforceSync(lead)}\\n                                          className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] rounded-lg flex items-center gap-1 transition-all shadow-2xs border border-blue-200"\\n                                          title="Sync to Salesforce Enterprise"\\n                                        >\\n                                          <Cloud className="w-3 h-3" />\\n                                          <span>SF Sync</span>\\n                                        </button>';

const teSyncBtnStr = sfSyncBtnStr + '\\n\\n                                        <button\\n                                          onClick={() => handleTotalExpertSync(lead)}\\n                                          className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-[11px] rounded-lg flex items-center gap-1 transition-all shadow-2xs border border-indigo-200"\\n                                          title="Sync to Total Expert"\\n                                        >\\n                                          <Users className="w-3 h-3" />\\n                                          <span>TE Sync</span>\\n                                        </button>';

code = code.replace(sfSyncBtnStr, teSyncBtnStr);


fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code);
