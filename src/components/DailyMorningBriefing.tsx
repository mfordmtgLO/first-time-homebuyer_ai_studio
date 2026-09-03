import React, { useState, useEffect } from "react";
import { 
  Sun, 
  Sparkles, 
  RefreshCw, 
  Flame, 
  AlertTriangle, 
  Building, 
  CheckSquare, 
  ArrowRight, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  MapPin, 
  DollarSign, 
  Clock, 
  Zap, 
  UserCheck, 
  Compass, 
  ChevronDown, 
  ChevronUp,
  Share2
} from "lucide-react";
import { JourneyPhaseLabel } from "./JourneyPhaseLabel";

import { CapturedLead, PropertyListing, LoanOfficerProfile } from "../types";

interface DailyMorningBriefingProps {
  loanOfficer: LoanOfficerProfile;
  leads: CapturedLead[];
  properties: PropertyListing[];
  onUpdateLead?: (updatedLead: CapturedLead) => void;
  onOpenSmsMessaging?: (lead: CapturedLead) => void;
  onOpenTranscript?: (lead: CapturedLead) => void;
  onTriggerToast?: (msg: string) => void;
}

export const DailyMorningBriefing: React.FC<DailyMorningBriefingProps> = ({
  loanOfficer,
  leads = [],
  properties = [],
  onUpdateLead,
  onOpenSmsMessaging,
  onOpenTranscript,
  onTriggerToast
}) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());

  // Date formatting
  const todayDateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  // Calculate Urgent Leads
  const urgentLeads = leads.filter(l => {
    const isHotNew = l.intentScore === "hot" && (l.status === "new" || l.status === "nurturing");
    const isHighBudget = (l.targetPriceRange && parseInt(l.targetPriceRange.replace(/[^0-9]/g, "")) >= 500000);
    const missingConsent = !l.smsConsentAuthorized && l.intentScore === "hot";
    return isHotNew || isHighBudget || missingConsent;
  }).slice(0, 4);

  // Property Matching Algorithm: Match properties to lead preferences
  const propertyMatches = properties.map(p => {
    const matchingLeads = leads.filter(l => {
      const cityMatch = l.taggedCityArea?.toLowerCase().includes(p.city.toLowerCase()) || 
                        l.preferredLocations?.toLowerCase().includes(p.city.toLowerCase());
      const maxPrice = l.targetPriceRange ? parseInt(l.targetPriceRange.replace(/[^0-9]/g, "")) || 400000 : 400000;
      const priceMatch = p.price <= (maxPrice * 1.15); // within 15% budget
      const dpaMatch = l.grantInterest && (p.overlayEligibility?.usdaEligible || p.overlayEligibility?.lmiEligible);
      return cityMatch || (priceMatch && dpaMatch);
    });

    return {
      property: p,
      matchedLeads: matchingLeads
    };
  }).filter(m => m.matchedLeads.length > 0).slice(0, 3);

  // Dynamic Daily Action Items
  const dailyTasks = [
    {
      id: "task-1",
      title: `Follow up with ${urgentLeads[0]?.fullName || "High-Intent Lead"} on Pre-Approval Readiness`,
      subtitle: `Target budget ${urgentLeads[0]?.targetPriceRange || "$350,000"} in ${urgentLeads[0]?.taggedCityArea || "Albany"}`,
      priority: "High",
      category: "Outreach",
      leadId: urgentLeads[0]?.id
    },
    {
      id: "task-2",
      title: "Audit Pending TCPA SMS Compliance Consent Logs",
      subtitle: `${leads.filter(l => !l.smsConsentAuthorized).length} leads require explicit 1-to-1 SMS authorization`,
      priority: "Medium",
      category: "Compliance"
    },
    {
      id: "task-3",
      title: `Share ${propertyMatches[0]?.property.title || "New Property"} with ${propertyMatches[0]?.matchedLeads[0]?.fullName || "Matching Buyer"}`,
      subtitle: `$${(propertyMatches[0]?.property.price || 385000).toLocaleString()} listing in ${propertyMatches[0]?.property.city || "Corvallis"} matches buyer criteria`,
      priority: "High",
      category: "Match"
    },
    {
      id: "task-4",
      title: "Review Oregon 3.5% DPA Grant Calculations for Pipeline",
      subtitle: "Verify updated 2026 AMI income caps for Mid-Willamette Valley Census Tracts",
      priority: "Normal",
      category: "Underwriting"
    }
  ];

  // AI Narrative Synthesis
  const [briefingNarrative, setBriefingNarrative] = useState<string>(() => {
    const hotCount = urgentLeads.length;
    const matchCount = propertyMatches.length;
    return `Good morning, ${loanOfficer.name.split(" ")[0]}! Here is your AI executive briefing for ${todayDateStr}. You have ${hotCount} high-intent buyer leads requiring immediate response, ${matchCount} new property listings matching active buyer criteria in your region, and ${dailyTasks.length} key compliance & outreach tasks queued. Let's maximize pipeline velocity today!`;
  });

  const handleRegenerateBriefing = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const hotCount = urgentLeads.length;
      const totalLeads = leads.length;
      const matchCount = propertyMatches.length;
      const topLead = urgentLeads[0]?.fullName || "Sarah Jenkins";
      const topProperty = propertyMatches[0]?.property.address || "1420 NW Hilltop Dr";

      const newNarrative = `Updated Briefing: Your pipeline currently holds ${totalLeads} total leads with ${hotCount} hot-intent prospects on deck. Priority 1 is reaching ${topLead} regarding DPA grant eligibility before noon. Additionally, ${matchCount} properties (including ${topProperty}) match immediate buyer criteria for co-branded Realtor outreach!`;

      setBriefingNarrative(newNarrative);
      setIsGenerating(false);
      if (onTriggerToast) onTriggerToast("✨ Daily AI Morning Briefing regenerated with latest pipeline data!");
    }, 900);
  };

  const handleToggleAudio = () => {
    if ("speechSynthesis" in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(briefingNarrative);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
        setIsPlayingAudio(true);
      }
    } else {
      if (onTriggerToast) onTriggerToast("Text-to-speech audio playback is not supported in this browser.");
    }
  };

  const toggleTaskCompleted = (taskId: string) => {
    setCompletedTaskIds(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  return (
    <div className="bg-gradient-to-br from-[#2D362E] via-[#38463B] to-[#252F26] text-white rounded-3xl p-6 shadow-xl border border-white/10 space-y-6 relative overflow-hidden">
      {/* Subtle Background Graphic Accent */}
      <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
        <Sun className="w-96 h-96 text-amber-200" />
      </div>

      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Executive Daily Briefing</span>
            </span>
            <span className="text-xs text-emerald-300 font-medium">
              {todayDateStr}
            </span>
          </div>
          <h2 className="text-2xl font-bold font-serif text-white tracking-tight flex items-center gap-2">
            <span>Good Morning, {loanOfficer.name}</span>
            <span className="text-xs font-normal text-emerald-200/80 bg-white/10 px-2.5 py-0.5 rounded-md border border-white/10">
              NMLS #{loanOfficer.nmlsId}
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleToggleAudio}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isPlayingAudio
                ? "bg-amber-400 text-amber-950 shadow-md animate-pulse"
                : "bg-white/10 hover:bg-white/20 text-white border border-white/15"
            }`}
            title="Listen to executive AI briefing summary"
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Pause Briefing</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-amber-300" />
                <span>Listen Audio</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleRegenerateBriefing}
            disabled={isGenerating}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
            title="Re-synthesize briefing with real-time CRM state"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-200 ${isGenerating ? "animate-spin" : ""}`} />
            <span>{isGenerating ? "Generating..." : "Refresh AI Synthesis"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title={isCollapsed ? "Expand briefing" : "Collapse briefing"}
          >
            {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Narrative Synthesis Banner */}
      <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-4.5 space-y-2 relative z-10">
        <div className="flex items-center gap-2 text-xs text-amber-300 font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Executive Pipeline Intelligence Summary</span>
        </div>
        <p className="text-sm text-emerald-50 leading-relaxed font-sans">
          {briefingNarrative}
        </p>
      </div>

      {!isCollapsed && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          {/* Column 1: Leads Requiring Immediate Attention */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-3.5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-sm text-white font-serif">
                    Leads Requiring Immediate Attention
                  </h3>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {urgentLeads.length} Urgent
                </span>
              </div>

              {urgentLeads.length === 0 ? (
                <p className="text-xs text-emerald-200/70 py-4 text-center italic">
                  No urgent leads pending immediate response. Pipeline is up to date!
                </p>
              ) : (
                <div className="space-y-2.5">
                  {urgentLeads.map(lead => (
                    <div
                      key={lead.id}
                      className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl p-3 space-y-2 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-xs text-white flex items-center gap-1.5 flex-wrap">
                            <span>{lead.fullName}</span>
                            <JourneyPhaseLabel status={lead.status} />
                            {lead.intentScore === "hot" && (
                              <span className="text-[9px] bg-amber-500 text-amber-950 px-1.5 py-0.2 rounded font-extrabold uppercase">
                                HOT
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-emerald-200/80 flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-emerald-300" />
                              {lead.taggedCityArea || lead.preferredLocations || "Oregon"}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3 text-emerald-300" />
                              {lead.targetPriceRange || "$350,000"}
                            </span>
                          </div>
                        </div>

                        {!lead.smsConsentAuthorized && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                            No TCPA Auth
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                        <span className="text-[10px] text-emerald-200/60 truncate">
                          Source: {lead.leadPathTag || lead.leadSource || "AI Intake"}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {onOpenSmsMessaging && (
                            <button
                              type="button"
                              onClick={() => onOpenSmsMessaging(lead)}
                              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                              title="Send 2-Way SMS Text"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onOpenTranscript && (
                            <button
                              type="button"
                              onClick={() => onOpenTranscript(lead)}
                              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-200 transition-colors"
                              title="View AI Chat Transcript & Blueprint"
                            >
                              <Compass className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <span className="text-[11px] text-emerald-200/70 italic">
                Auto-prioritized by AI Intent & Compliance rules
              </span>
            </div>
          </div>

          {/* Column 2: New Property Listings Matching Active Leads */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-3.5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-sm text-white font-serif">
                    Property Matches for Active Leads
                  </h3>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  {propertyMatches.length} Listing Matches
                </span>
              </div>

              {propertyMatches.length === 0 ? (
                <p className="text-xs text-emerald-200/70 py-4 text-center italic">
                  No active property matches calculated for current leads.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {propertyMatches.map((match, idx) => (
                    <div
                      key={idx}
                      className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl p-3 space-y-2 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-xs text-white truncate max-w-[200px]">
                            {match.property.title || match.property.address}
                          </h4>
                          <p className="text-[11px] text-emerald-200/80">
                            ${match.property.price.toLocaleString()} • {match.property.city}, {match.property.state}
                          </p>
                        </div>
                        {match.property.overlayEligibility?.usdaEligible && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-emerald-950 shrink-0">
                            $0 USDA DOWN
                          </span>
                        )}
                      </div>

                      <div className="bg-black/20 rounded-lg p-2 text-[11px] space-y-1 border border-white/5">
                        <span className="text-amber-300 font-bold block text-[10px]">
                          Matched Buyer Leads ({match.matchedLeads.length}):
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {match.matchedLeads.map(l => (
                            <span key={l.id} className="bg-white/15 text-white px-2 py-0.5 rounded text-[10px] font-medium">
                              {l.fullName}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <span className="text-[11px] text-emerald-200/70 italic">
                Matched via location, price range & DPA zero-down rules
              </span>
            </div>
          </div>

          {/* Column 3: Key Priority Daily Tasks */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-3.5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-amber-300" />
                  <h3 className="font-bold text-sm text-white font-serif">
                    Key Actionable Daily Tasks
                  </h3>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/15">
                  {completedTaskIds.size}/{dailyTasks.length} Done
                </span>
              </div>

              <div className="space-y-2">
                {dailyTasks.map(task => {
                  const isDone = completedTaskIds.has(task.id);
                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleTaskCompleted(task.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                        isDone
                          ? "bg-white/5 border-white/10 opacity-60 line-through"
                          : "bg-white/10 hover:bg-white/15 border-white/10"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => {}} // handled by parent div click
                        className="mt-0.5 rounded border-white/30 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div className="space-y-0.5 text-xs">
                        <span className={`font-bold block text-white ${isDone ? "line-through text-emerald-200/50" : ""}`}>
                          {task.title}
                        </span>
                        <p className="text-[11px] text-emerald-200/70 leading-snug">
                          {task.subtitle}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] text-emerald-200/70">
              <span>Updated dynamically from CRM state</span>
              <span className="font-bold text-amber-300">
                {dailyTasks.length - completedTaskIds.size} Tasks Remaining
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
