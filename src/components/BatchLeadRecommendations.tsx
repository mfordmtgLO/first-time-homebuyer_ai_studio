import React, { useState } from "react";
import { 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  ShieldCheck, 
  Send, 
  UserCheck, 
  ArrowRight, 
  Mail, 
  Building, 
  Clock, 
  Layers, 
  Users, 
  Flame,
  CheckSquare,
  RefreshCw,
  X
} from "lucide-react";
import { CapturedLead, LoanOfficerProfile, RealEstateAgentProfile } from "../types";

interface BatchLeadRecommendationsProps {
  leads: CapturedLead[];
  loanOfficer: LoanOfficerProfile;
  agents: RealEstateAgentProfile[];
  onUpdateAllLeads: (updatedLeads: CapturedLead[]) => void;
  onTriggerToast: (msg: string) => void;
  onOpenBulkSmsModal?: (leadIds: string[]) => void;
}

export interface RecommendationCard {
  id: string;
  title: string;
  description: string;
  category: "hot_outreach" | "sms_compliance" | "dpa_digest" | "agent_assignment";
  matchingLeadIds: string[];
  actionLabel: string;
  badgeText: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

export const BatchLeadRecommendations: React.FC<BatchLeadRecommendationsProps> = ({
  leads,
  loanOfficer,
  agents,
  onUpdateAllLeads,
  onTriggerToast,
  onOpenBulkSmsModal
}) => {
  const [executingRecId, setExecutingRecId] = useState<string | null>(null);

  // Analyze leads and build smart recommendations
  const hotUncontacted = leads.filter(l => l.intentScore === "hot" && l.status === "new");
  const pendingSmsConsent = leads.filter(l => !l.smsConsentAuthorized && l.status !== "archived");
  const dpaInterested = leads.filter(l => l.grantInterest || l.leadPathTag?.includes("Blueprint") || l.leadPathTag?.includes("Zero-Down"));
  const unassignedAlbanyCorvallis = leads.filter(l => 
    (l.taggedCityArea?.includes("Albany") || l.taggedCityArea?.includes("Corvallis") || l.preferredLocations?.includes("Albany"))
  );

  const recommendations: RecommendationCard[] = [];

  // Recommendation 1: Hot Uncontacted
  if (hotUncontacted.length > 0) {
    recommendations.push({
      id: "rec_hot_outreach",
      title: `Batch Follow-Up: ${hotUncontacted.length} High-Intent Uncontacted Leads`,
      description: `Target ${hotUncontacted.map(l => l.fullName).join(", ")} with immediate pre-approval readiness & DPA grant eligibility email outreach.`,
      category: "hot_outreach",
      matchingLeadIds: hotUncontacted.map(l => l.id),
      actionLabel: `Batch Send Pre-Approval Email (${hotUncontacted.length})`,
      badgeText: "High Conversion ROI",
      icon: Flame,
      colorClass: "text-[#C18C5D]",
      bgClass: "bg-amber-50/80",
      borderClass: "border-amber-200"
    });
  }

  // Recommendation 2: SMS Compliance
  if (pendingSmsConsent.length > 0) {
    recommendations.push({
      id: "rec_sms_compliance",
      title: `SMS Compliance: Request Opt-in for ${pendingSmsConsent.length} Leads`,
      description: `Dispatch TCPA-compliant 1-to-1 SMS authorization invitations to enable text notifications for home listing updates.`,
      category: "sms_compliance",
      matchingLeadIds: pendingSmsConsent.map(l => l.id),
      actionLabel: `Bulk Request SMS Auth (${pendingSmsConsent.length})`,
      badgeText: "TCPA Compliance Priority",
      icon: ShieldCheck,
      colorClass: "text-emerald-700",
      bgClass: "bg-emerald-50/80",
      borderClass: "border-emerald-200"
    });
  }

  // Recommendation 3: DPA & Zero-Down Digest
  if (dpaInterested.length > 0) {
    recommendations.push({
      id: "rec_dpa_digest",
      title: `DPA Digest: Dispatch Oregon 3.5% DPA Guide to ${dpaInterested.length} Buyers`,
      description: `Send automated Oregon DPA grant breakdown & USDA 100% Zero-Down property list digest to active grant-seeking leads.`,
      category: "dpa_digest",
      matchingLeadIds: dpaInterested.map(l => l.id),
      actionLabel: `Batch Dispatch DPA Digest (${dpaInterested.length})`,
      badgeText: "DPA Grant Match",
      icon: Mail,
      colorClass: "text-[#4A5D4E]",
      bgClass: "bg-[#FAF9F5]",
      borderClass: "border-[#EAE7E0]"
    });
  }

  // Recommendation 4: Agent Assignment
  if (unassignedAlbanyCorvallis.length > 0) {
    const defaultAgent = agents[0] || { name: "Sarah Jenkins", email: "sarah@oregonhomegroup.com" };
    recommendations.push({
      id: "rec_agent_assign",
      title: `Partner Co-Marketing: Assign ${unassignedAlbanyCorvallis.length} Albany & Corvallis Leads`,
      description: `Co-assign regional Mid-Willamette Valley leads to Realtor partner ${defaultAgent.name} for joint property tours.`,
      category: "agent_assignment",
      matchingLeadIds: unassignedAlbanyCorvallis.map(l => l.id),
      actionLabel: `Batch Assign to ${defaultAgent.name} (${unassignedAlbanyCorvallis.length})`,
      badgeText: "Co-Brand Partner Sync",
      icon: Users,
      colorClass: "text-purple-700",
      bgClass: "bg-purple-50/80",
      borderClass: "border-purple-200"
    });
  }

  // Handle Recommendation Action Execution
  const handleExecuteRecommendation = (rec: RecommendationCard) => {
    if (rec.category === "sms_compliance" && onOpenBulkSmsModal) {
      onOpenBulkSmsModal(rec.matchingLeadIds);
      return;
    }

    setExecutingRecId(rec.id);
    setTimeout(() => {
      const nowIso = new Date().toISOString();
      const targetAgent = agents[0] || { name: "Sarah Jenkins", email: "sarah@oregonhomegroup.com" };

      const updated = leads.map(l => {
        if (!rec.matchingLeadIds.includes(l.id)) return l;

        if (rec.category === "hot_outreach") {
          return {
            ...l,
            status: "contacted" as const,
            lastEmailSentAt: nowIso,
            lastEmailTemplateName: "Batch Pre-Approval Readiness & DPA Grant Audit",
            nurtureSequenceLogs: [
              ...(l.nurtureSequenceLogs || []),
              {
                id: `log-rec-hot-${Date.now()}-${l.id}`,
                stageName: "Smart Recommendation: Hot Lead Pre-Approval Follow-Up",
                templateName: "Pre-Approval & DPA Grant Audit",
                emailSubject: `Pre-Approval & Oregon DPA Grant Readiness for ${l.fullName}`,
                sentAt: nowIso,
                status: "sent" as const
              }
            ]
          };
        }

        if (rec.category === "dpa_digest") {
          return {
            ...l,
            lastEmailSentAt: nowIso,
            lastEmailTemplateName: "Oregon 3.5% DPA Grant & Zero-Down Property Digest",
            nurtureSequenceLogs: [
              ...(l.nurtureSequenceLogs || []),
              {
                id: `log-rec-dpa-${Date.now()}-${l.id}`,
                stageName: "Smart Recommendation: DPA Grant & Listing Digest",
                templateName: "Oregon 3.5% DPA Grant Guide",
                emailSubject: `Your Oregon Down Payment Assistance & Zero-Down Home Digest`,
                sentAt: nowIso,
                status: "sent" as const
              }
            ]
          };
        }

        if (rec.category === "agent_assignment") {
          return {
            ...l,
            assignedAgentId: targetAgent.id,
            notes: (l.notes ? `${l.notes}\n` : "") + `[Co-Assigned to Realtor ${targetAgent.name} via Batch Smart Recommendation on ${new Date().toLocaleDateString()}]`
          };
        }

        return l;
      });

      onUpdateAllLeads(updated);
      setExecutingRecId(null);
      onTriggerToast(`Successfully executed batch action for ${rec.matchingLeadIds.length} leads!`);
    }, 800);
  };

  if (recommendations.length === 0) return null;

  return (
    <div className="bg-white border border-[#EAE7E0] p-6 rounded-3xl shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE7E0] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#4A5D4E]/10 flex items-center justify-center text-[#4A5D4E]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-[#2D362E] text-base font-serif flex items-center gap-2">
              <span>AI & Rules Batch Lead Action Recommendations</span>
            </h3>
            <p className="text-xs text-[#606C5D]">
              Intelligent lead pipeline cluster recommendations for rapid 1-click execution
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold text-[#4A5D4E] bg-[#4A5D4E]/10 px-3 py-1 rounded-full border border-[#4A5D4E]/20 self-start sm:self-auto">
          {recommendations.length} Recommended Batch Clusters
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map(rec => {
          const Icon = rec.icon;
          const isRunning = executingRecId === rec.id;

          return (
            <div
              key={rec.id}
              className={`p-4 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${rec.bgClass} ${rec.borderClass}`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[#2D362E]">
                    <Icon className={`w-4 h-4 ${rec.colorClass}`} />
                    <span className="font-serif text-sm">{rec.title}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#EAE7E0] text-[#606C5D] shrink-0">
                    {rec.badgeText}
                  </span>
                </div>
                <p className="text-xs text-[#606C5D] leading-relaxed">
                  {rec.description}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3 border-t border-black/5">
                <div className="flex -space-x-1.5 overflow-hidden">
                  {rec.matchingLeadIds.slice(0, 3).map((id, idx) => {
                    const l = leads.find(item => item.id === id);
                    return (
                      <div
                        key={id}
                        className="w-6 h-6 rounded-full bg-[#4A5D4E] text-white text-[10px] font-bold flex items-center justify-center border border-white"
                        title={l?.fullName}
                      >
                        {l?.fullName?.substring(0, 1) || "B"}
                      </div>
                    );
                  })}
                  {rec.matchingLeadIds.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-[#606C5D] text-white text-[9px] font-bold flex items-center justify-center border border-white">
                      +{rec.matchingLeadIds.length - 3}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleExecuteRecommendation(rec)}
                  disabled={isRunning}
                  className="px-3.5 py-1.5 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isRunning ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Executing...</span>
                    </>
                  ) : (
                    <>
                      <span>{rec.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#E7C19D]" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
