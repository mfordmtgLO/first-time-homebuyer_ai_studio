import React, { useState, useEffect } from "react";
import { ShieldCheck, ShieldAlert, PauseCircle, PlayCircle, CheckSquare } from "lucide-react";
import { AdCampaignDraft } from "../types";

export const AdminAdComplianceSection: React.FC<{ onTriggerToast: (m: string) => void }> = ({ onTriggerToast }) => {
  const [enterpriseCampaigns, setEnterpriseCampaigns] = useState<(AdCampaignDraft & { loName: string })[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewAuditHistoryId, setViewAuditHistoryId] = useState<string | null>(null);

  useEffect(() => {
    // Load from local storage for prototype
    try {
      const stored = localStorage.getItem("loan_officer_guides_state");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.adCampaignDrafts) {
          const comps = parsed.adCampaignDrafts.map((d: any) => ({
            ...d,
            loName: parsed.loanOfficers?.find((lo: any) => lo.id === d.loId)?.name || "Mike Ford"
          }));
          setEnterpriseCampaigns(comps);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleToggleAdminPause = (id: string, currentlyPaused: boolean) => {
    const updated = enterpriseCampaigns.map(c => {
      if (c.id === id) {
        const newLog = {
          id: "log-" + Date.now() + Math.random(),
          timestamp: new Date().toISOString(),
          actor: "Branch Admin (Mike Ford)",
          action: "Compliance Override",
          details: !currentlyPaused ? "Admin Suspended Campaign" : "Admin Lifted Suspension"
        };
        return { 
          ...c, 
          isCompliancePaused: !currentlyPaused,
          auditLog: [...(c.auditLog || []), newLog]
        };
      }
      return c;
    });
    setEnterpriseCampaigns(updated);
    
    persistCampaigns(updated);

    onTriggerToast(currentlyPaused ? "Removed compliance hold. Campaign can resume." : "Campaign paused for compliance review.");
  };

  const handleBulkToggle = (pause: boolean) => {
    const updated = enterpriseCampaigns.map(c => {
      if (selectedIds.has(c.id)) {
        const newLog = {
          id: "log-" + Date.now() + Math.random(),
          timestamp: new Date().toISOString(),
          actor: "Branch Admin (Mike Ford)",
          action: "Compliance Override (Bulk)",
          details: pause ? "Admin Suspended Campaign" : "Admin Lifted Suspension"
        };
        return { 
          ...c, 
          isCompliancePaused: pause,
          auditLog: [...(c.auditLog || []), newLog]
        };
      }
      return c;
    });
    setEnterpriseCampaigns(updated);
    persistCampaigns(updated);
    
    setSelectedIds(new Set());
    onTriggerToast(pause ? `Bulk paused \${selectedIds.size} campaigns.` : `Bulk resumed \${selectedIds.size} campaigns.`);
  };

  const persistCampaigns = (updatedCampaigns: any[]) => {
    // Attempt to persist back to local storage
    try {
      const stored = localStorage.getItem("loan_officer_guides_state");
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Merge updated back into all drafts
        const newDrafts = (parsed.adCampaignDrafts || []).map((d: any) => {
          const matchingUpdated = updatedCampaigns.find(uc => uc.id === d.id);
          return matchingUpdated ? { ...d, isCompliancePaused: matchingUpdated.isCompliancePaused } : d;
        });
        
        parsed.adCampaignDrafts = newDrafts;
        localStorage.setItem("loan_officer_guides_state", JSON.stringify(parsed));
      }
    } catch (e) {}
  };

  const toggleSelection = (id: string) => {
    const newSel = new Set(selectedIds);
    if (newSel.has(id)) newSel.delete(id);
    else newSel.add(id);
    setSelectedIds(newSel);
  };

  const toggleAll = () => {
    if (selectedIds.size === enterpriseCampaigns.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(enterpriseCampaigns.map(c => c.id)));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#F9F8F4] border border-[#EAE7E0] rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="bg-red-100 p-3 rounded-xl shrink-0">
            <ShieldAlert className="w-6 h-6 text-red-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#2D362E]">Enterprise Ad Compliance Matrix</h3>
            <p className="text-xs text-[#606C5D] mt-1 max-w-2xl">
              As Branch Admin, you have global override authority over all active Co-Marketing Ad Campaigns across all Loan Officers. Use this to instantly kill ads if a Realtor falls out of compliance, RESPA flags are raised, or licensing lapses.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#EAE7E0] rounded-3xl overflow-hidden shadow-sm">
        {/* Bulk Actions Header */}
        {selectedIds.size > 0 && (
          <div className="bg-[#F1EFE9] px-4 py-3 border-b border-[#EAE7E0] flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <span className="text-xs font-bold text-[#2D362E]">
              {selectedIds.size} campaign{selectedIds.size > 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkToggle(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-lg text-[10px] font-bold transition-colors"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                Enable Selected
              </button>
              <button
                onClick={() => handleBulkToggle(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-800 hover:bg-red-200 rounded-lg text-[10px] font-bold transition-colors"
              >
                <PauseCircle className="w-3.5 h-3.5" />
                Disable Selected
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9F8F4] border-b border-[#EAE7E0]">
                <th className="py-3 px-4 w-10 text-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-[#C18C5D] text-[#4A5D4E] focus:ring-[#4A5D4E] cursor-pointer"
                    checked={enterpriseCampaigns.length > 0 && selectedIds.size === enterpriseCampaigns.length}
                    onChange={toggleAll}
                  />
                </th>
                <th className="py-3 px-4 text-[10px] uppercase font-bold text-[#9A9488]">Originating LO</th>
                <th className="py-3 px-4 text-[10px] uppercase font-bold text-[#9A9488]">Campaign Name</th>
                <th className="py-3 px-4 text-[10px] uppercase font-bold text-[#9A9488]">Counties</th>
                <th className="py-3 px-4 text-[10px] uppercase font-bold text-[#9A9488]">Status</th>
                <th className="py-3 px-4 text-[10px] uppercase font-bold text-[#9A9488]">Compliance Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE7E0]">
              {enterpriseCampaigns.map((camp) => (
                <tr key={camp.id} className={`transition-colors \${selectedIds.has(camp.id) ? "bg-[#F9F8F4]" : "hover:bg-[#F9F8F4]"}`}>
                  <td className="py-4 px-4 w-10 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-[#C18C5D] text-[#4A5D4E] focus:ring-[#4A5D4E] cursor-pointer"
                      checked={selectedIds.has(camp.id)}
                      onChange={() => toggleSelection(camp.id)}
                    />
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-xs text-[#2D362E]">{camp.loName}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-xs text-[#2D362E]">{camp.campaignName}</div>
                    <div className="text-[10px] text-[#606C5D] mt-0.5">{camp.platform === "meta" ? "Meta/Facebook" : "Google Search"}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-[10px] font-semibold text-[#4A5D4E] max-w-[150px] truncate" title={camp.targetLocations?.join(", ")}>
                      {camp.targetLocations?.join(", ") || "Oregon"}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {camp.isCompliancePaused ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                        Admin Paused
                      </span>
                    ) : camp.status === "active" ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Live & Compliant
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                        Draft / Pending
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleToggleAdminPause(camp.id, !!camp.isCompliancePaused)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors \${
                        camp.isCompliancePaused 
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" 
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                    >
                      {camp.isCompliancePaused ? (
                        <><PlayCircle className="w-3.5 h-3.5" /> Resume Campaign</>
                      ) : (
                        <><PauseCircle className="w-3.5 h-3.5" /> Kill (Compliance)</>
                      )}
                    </button>
                    <button
                        onClick={() => setViewAuditHistoryId(camp.id)}
                        className="ml-2 px-2 py-1.5 rounded-lg text-[#606C5D] hover:bg-[#F9F8F4] transition-colors inline-flex items-center"
                        title="View Change History"
                      >
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      </button>
                  </td>
                </tr>
              ))}
              {enterpriseCampaigns.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#9A9488]">
                    No active co-marketing campaigns found on the enterprise network.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit History Modal */}
      {viewAuditHistoryId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-[#EAE7E0] shadow-2xl animate-in zoom-in-95 duration-150 text-[#2D362E]">
            <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-3">
              <h4 className="font-serif font-bold text-lg text-[#2D362E] flex items-center gap-2">
                <svg className="w-5 h-5 text-[#C18C5D]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Compliance Change History
              </h4>
              <button
                onClick={() => setViewAuditHistoryId(null)}
                className="text-xs text-[#9A9488] hover:text-[#2D362E]"
              >
                ✕ Close
              </button>
            </div>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {(() => {
                const camp = enterpriseCampaigns.find(c => c.id === viewAuditHistoryId);
                const logs = camp?.auditLog || [];
                
                if (logs.length === 0) {
                  return (
                    <div className="text-center text-sm text-[#606C5D] py-8">
                      No change history available for this campaign.
                    </div>
                  );
                }
                
                return logs.slice().reverse().map((log, index) => (
                  <div key={log.id} className="relative pl-6 pb-4 border-l-2 border-[#EAE7E0] last:border-transparent last:pb-0">
                    <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-[#C18C5D]" />
                    <div className="text-[10px] text-[#9A9488] font-mono mb-1">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                    <div className="text-xs font-bold text-[#2D362E] mb-0.5">
                      {log.actor}
                    </div>
                    <div className="text-xs text-[#606C5D]">
                      <span className="font-medium text-[#4A5D4E]">{log.action}</span>
                      {log.details && <span className="ml-1 opacity-75">— {log.details}</span>}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
