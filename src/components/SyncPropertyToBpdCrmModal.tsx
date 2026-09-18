import React, { useState } from "react";
import {
  PropertyListing,
  CapturedLead,
  ProfessionalGuidesState
} from "../types";
import {
  X,
  Zap,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  User,
  MessageSquare,
  AlertCircle,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { formatUSD } from "../utils/mortgageMath";

interface SyncPropertyToBpdCrmModalProps {
  property: PropertyListing | null;
  isOpen: boolean;
  onClose: () => void;
  guidesState: ProfessionalGuidesState;
  onUpdateProperty: (updatedProperty: PropertyListing) => void;
  onTriggerToast: (message: string) => void;
}

export const SyncPropertyToBpdCrmModal: React.FC<SyncPropertyToBpdCrmModalProps> = ({
  property,
  isOpen,
  onClose,
  guidesState,
  onUpdateProperty,
  onTriggerToast,
}) => {
  // Find all available leads from capturedLeads or leads
  const availableLeads: CapturedLead[] = (
    guidesState.capturedLeads && guidesState.capturedLeads.length > 0
      ? guidesState.capturedLeads
      : (guidesState.leads as CapturedLead[]) || []
  );

  const [selectedLeadId, setSelectedLeadId] = useState<string>(() => {
    if (property?.bpdCrmLastLeadId) return property.bpdCrmLastLeadId;
    if (availableLeads.length > 0) return availableLeads[0].id;
    return "";
  });

  const selectedLead = availableLeads.find((l) => l.id === selectedLeadId);

  const [interactionNotes, setInteractionNotes] = useState<string>(() => {
    if (property?.notes) return property.notes;
    if (selectedLead && property) {
      return `Lead ${selectedLead.fullName} viewed & requested financing analysis on ${property.address}. Timeline: ${selectedLead.timeline || "30-60 days"}. Budget: ${selectedLead.targetPriceRange || formatUSD(property.price)}.`;
    }
    return `Curated GeoSphere property listing pushed to Big Purple Dot CRM with matched low/no down payment program tags.`;
  });

  const [apiKeyInput, setApiKeyInput] = useState<string>(
    guidesState.bigPurpleDotCrmConfig?.apiKey || ""
  );
  const [subdomainInput] = useState<string>(
    guidesState.bigPurpleDotCrmConfig?.subdomain || "cornerstone-leads"
  );

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccessResult, setSyncSuccessResult] = useState<{
    recordId: string;
    crmUrl: string;
    syncedAt: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !property) return null;

  // Handle changing lead
  const handleLeadChange = (newLeadId: string) => {
    setSelectedLeadId(newLeadId);
    const lead = availableLeads.find((l) => l.id === newLeadId);
    if (lead) {
      setInteractionNotes(
        `Lead ${lead.fullName} (${lead.phone || "No phone"}, ${lead.email || "No email"}) engaged with listing at ${property.address}. Credit: ${lead.creditScoreTier || "Good"}. Intent: ${lead.intentScore || "High"}.`
      );
    } else {
      setInteractionNotes(`General curated property asset without specific lead attachment.`);
    }
  };

  const handlePushToBpdCrm = async () => {
    setIsSyncing(true);
    setErrorMessage(null);

    try {
      const payload = {
        property,
        lead: selectedLead || null,
        interactionNotes,
        apiKey: apiKeyInput.trim(),
        subdomain: subdomainInput.trim() || "cornerstone-leads",
      };

      const response = await fetch("/api/big-purple-dot/crm/sync-property", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to push property to Big Purple Dot CRM");
      }

      const updatedProp: PropertyListing = {
        ...property,
        bpdCrmSynced: true,
        bpdCrmSyncedAt: data.syncedAt || new Date().toISOString(),
        bpdCrmPropertyRecordId: data.propertyRecordId,
        bpdCrmSyncStatus: "synced",
        bpdCrmLastLeadId: selectedLead?.id,
      };

      onUpdateProperty(updatedProp);

      setSyncSuccessResult({
        recordId: data.propertyRecordId,
        crmUrl: data.crmUrl,
        syncedAt: data.syncedAt,
      });

      onTriggerToast(`✓ Synced ${property.address} to Big Purple Dot CRM (${data.propertyRecordId})`);
    } catch (err: any) {
      console.error("[BPD CRM Sync Error]", err);
      setErrorMessage(err.message || "An unexpected error occurred during BPD CRM synchronization.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-[#EAE7E0] max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold shadow-xs">
              <Zap className="w-6 h-6 text-purple-700 fill-purple-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[#2D362E]">
                  Sync to Big Purple Dot CRM
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                  Live Webhook API
                </span>
              </div>
              <p className="text-xs text-[#606C5D]">
                Push property specs, cross-screened loan programs, and lead interaction history directly into BPD CRM.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Banner if already synced */}
        {syncSuccessResult && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Property &amp; Lead Interaction Successfully Synced!</span>
            </div>
            <p className="text-xs text-emerald-800">
              Record created in Big Purple Dot CRM with ID{" "}
              <strong className="font-mono">{syncSuccessResult.recordId}</strong>.
            </p>
            <div className="pt-1 flex items-center gap-3">
              <a
                href={syncSuccessResult.crmUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-emerald-900 underline flex items-center gap-1"
              >
                <span>Open in BPD CRM</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-[11px] text-emerald-700">
                Synced at: {new Date(syncSuccessResult.syncedAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Property Overview Card */}
        <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7E0] space-y-2.5">
          <div className="flex items-start gap-3">
            {property.imageUrl && (
              <img
                src={property.imageUrl}
                alt={property.address}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-xl object-cover border border-[#EAE7E0] shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <h4 className="font-bold text-sm text-[#2D362E] truncate">
                  {property.address}
                </h4>
                <span className="font-bold text-emerald-800 text-sm whitespace-nowrap">
                  {formatUSD(property.price)}
                </span>
              </div>
              <p className="text-xs text-[#606C5D]">
                {property.city}, {property.state || "OR"} {property.zip} • {property.beds}b / {property.baths}ba • {property.sqft?.toLocaleString()} sqft
              </p>

              {/* Matched Loan Programs */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {property.overlayEligibility?.usdaEligible && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-0.5">
                    🚜 USDA 100% Zero Down
                  </span>
                )}
                {property.overlayEligibility?.ohcsEligible && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-0.5">
                    🏠 OHCS 3.5% DPA Grant
                  </span>
                )}
                {property.overlayEligibility?.lakeviewEligible && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200 flex items-center gap-0.5">
                    🌊 Lakeview ≤140% AMI
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Listing Agent Status */}
          <div className="pt-2 border-t border-[#EAE7E0] flex items-center justify-between text-xs">
            <span className="text-[#606C5D] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              Listing Agent:
            </span>
            <span className="font-semibold text-[#2D362E]">
              {property.listingAgent?.name || "Unassigned"} ({property.listingOffice?.name || "Brokerage"})
              {property.isLoAgentPair && (
                <span className="ml-1 text-[10px] text-pink-700 font-bold bg-pink-50 px-1 py-0.5 rounded border border-pink-200">
                  LO+Agent Pair
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Lead Association Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#606C5D] uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-purple-700" />
            <span>Associated Homebuyer Lead</span>
          </label>
          <select
            value={selectedLeadId}
            onChange={(e) => handleLeadChange(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-[#EAE7E0] bg-white text-[#2D362E] font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
          >
            <option value="">-- No specific lead (General Curated Listing) --</option>
            {availableLeads.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.fullName} • {lead.phone || "No phone"} • Timeline: {lead.timeline || "Active"} ({lead.targetPriceRange || "Pre-Approved"})
              </option>
            ))}
          </select>
          {selectedLead && (
            <div className="p-2 rounded-xl bg-purple-50/70 border border-purple-100 flex items-center justify-between text-[11px] text-purple-900">
              <span>
                <strong>{selectedLead.fullName}</strong> • Status: {selectedLead.preApprovalStatus || selectedLead.status || "Pre-Approved"}
              </span>
              <span className="font-semibold">
                Intent: {selectedLead.intentScore || "High"}
              </span>
            </div>
          )}
        </div>

        {/* Lead Interaction History / Notes to push */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#606C5D] uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-purple-700" />
            <span>Property Listing Card Notes &amp; Lead Interaction History</span>
          </label>
          <textarea
            value={interactionNotes}
            onChange={(e) => setInteractionNotes(e.target.value)}
            rows={3}
            placeholder="Document client tour requests, DPA questions, or property notes..."
            className="w-full px-3 py-2 text-xs rounded-xl border border-[#EAE7E0] bg-white text-[#2D362E] focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed font-sans"
          />
          <p className="text-[10px] text-[#7D8877]">
            This interaction history and qualification tags will be attached to the BPD lead and property timeline.
          </p>
        </div>

        {/* Big Purple Dot CRM Settings (Collapsible / Preview) */}
        <div className="p-3 rounded-2xl bg-purple-50/50 border border-purple-100 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-purple-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-700" />
              BPD CRM Endpoint:
            </span>
            <span className="font-mono text-[11px] text-purple-800">
              {subdomainInput}.bigpurpledot.com
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Enter BPD CRM API Key (Optional BYOK override)"
              className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-purple-200 bg-white font-mono focus:outline-none"
            />
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#606C5D] hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handlePushToBpdCrm}
            disabled={isSyncing}
            className="px-5 py-2.5 rounded-xl bg-purple-800 hover:bg-purple-900 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Syncing to BPD CRM...</span>
              </>
            ) : syncSuccessResult ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-300" />
                <span>Re-Sync to BPD CRM</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-purple-300 text-purple-300" />
                <span>Push Property &amp; Notes to BPD CRM</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
