import React, { useState } from "react";
import {
  Sparkles,
  Send,
  Copy,
  Check,
  Mail,
  MessageSquare,
  Home,
  TrendingUp,
  Users,
  CheckCircle2,
  RefreshCw,
  Download,
  DollarSign,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Filter,
  Share2,
} from "lucide-react";
import { LoanOfficerProfile, RealEstateAgentProfile, PropertyListing } from "../types";

interface AIPartnerCampaignProps {
  loanOfficer: LoanOfficerProfile;
  agentRoster: RealEstateAgentProfile[];
  properties: PropertyListing[];
  pairingUrl: string;
  onOpenEmailOutreachModal?: () => void;
  triggerToast?: (msg: string) => void;
}

export const AIPartnerCampaign: React.FC<AIPartnerCampaignProps> = ({
  loanOfficer,
  agentRoster,
  properties,
  pairingUrl,
  onOpenEmailOutreachModal,
  triggerToast,
}) => {
  // Target Agent Selection State
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>(() => {
    // Default to buyer agents in roster
    const buyerAgents = agentRoster.filter((a) => a.agentType === "buyer_agent").map((a) => a.id);
    return buyerAgents.length > 0 ? buyerAgents : agentRoster.slice(0, 2).map((a) => a.id);
  });
  const [customAgentInput, setCustomAgentInput] = useState("");

  // Target Property Selection State
  const [propertyFilter, setPropertyFilter] = useState<"all" | "usda" | "flex_dpa">("all");
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>(() => {
    const usdaProps = properties.filter((p) => p.overlayEligibility?.usda).map((p) => p.id);
    return usdaProps.length > 0 ? usdaProps.slice(0, 3) : properties.slice(0, 3).map((p) => p.id);
  });

  // Strategy & Campaign Settings
  const [campaignFocus, setCampaignFocus] = useState<
    "usda_zero_down" | "flex_dpa_grants" | "stop_renting_math" | "open_house_kit"
  >("usda_zero_down");
  const [tone, setTone] = useState<"high_converting" | "consultative" | "data_driven">(
    "high_converting"
  );
  const [customInstructions, setCustomInstructions] = useState("");

  // Generation Results State
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [campaignResult, setCampaignResult] = useState<{
    subject: string;
    body: string;
    smsScript?: string;
    openHouseTalkingPoints?: string[];
    rentVsBuyComparison?: {
      avgLocalRent: string;
      estMortgagePayment: string;
      downPaymentRequired: string;
      monthlySavings: string;
    };
  } | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    if (triggerToast) triggerToast("Copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const toggleAgentSelection = (agentId: string) => {
    setSelectedAgentIds((prev) =>
      prev.includes(agentId) ? prev.filter((id) => id !== agentId) : [...prev, agentId]
    );
  };

  const togglePropertySelection = (propId: string) => {
    setSelectedPropertyIds((prev) =>
      prev.includes(propId) ? prev.filter((id) => id !== propId) : [...prev, propId]
    );
  };

  const filteredProperties = properties.filter((p) => {
    if (propertyFilter === "usda") return Boolean(p.overlayEligibility?.usda);
    if (propertyFilter === "flex_dpa")
      return Boolean(p.overlayEligibility?.lmi || p.overlayEligibility?.firstHomeEligible);
    return true;
  });

  const handleGenerateCampaign = async () => {
    setIsGenerating(true);

    const selectedAgents = agentRoster.filter((a) => selectedAgentIds.includes(a.id));
    const agentNames = selectedAgents.map((a) => a.name);
    if (customAgentInput.trim()) {
      agentNames.push(customAgentInput.trim());
    }

    const selectedProps = properties.filter((p) => selectedPropertyIds.includes(p.id));

    let focusTitle = "Attract Buyer Agents - Stop Renting Zero-Down Push";
    if (campaignFocus === "usda_zero_down")
      focusTitle = "100% USDA Zero Down Rural Development Listings Pitch";
    else if (campaignFocus === "flex_dpa_grants")
      focusTitle = "OHCS Flex DPA 3.5%-5% Grants + Seller Concession Buydowns";
    else if (campaignFocus === "stop_renting_math")
      focusTitle = "Stop Renting vs. Owning Monthly Payment Math Breakdown";
    else if (campaignFocus === "open_house_kit")
      focusTitle = "Co-Branded Open House Renter Conversion Kit";

    try {
      const res = await fetch("/api/gemini/buyer-agent-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentNames,
          properties: selectedProps,
          loanOfficer: loanOfficer,
          campaignType: focusTitle,
          tone,
          customNotes: customInstructions,
        }),
      });

      const data = await res.json();
      if (data.email) {
        setCampaignResult(data.email);
        if (triggerToast) triggerToast("✨ AI Partner Campaign Generated Successfully!");
      }
    } catch (e) {
      console.error(e);
      // Fallback
      setCampaignResult({
        subject: `Convert Your Open House Renters into Buyers with 0% Down USDA Financing`,
        body: `Hi [AgentName],\n\nI hope your week is off to a great start! I was reviewing recent listings in our area and noticed your active focus on buyer clients.\n\nDid you know that many prospective buyers browsing your listings assume they need $40,000+ in cash for a down payment—when in reality, properties like ${selectedProps[0]?.address || "qualifying local listings"} qualify for 100% USDA Zero-Down Financing or 3.5% Flex DPA Grants?\n\nI'd love to partner with you to provide co-branded open house flyers and an interactive pre-approval calculator link for your buyers. With average local rents at $2,200/mo, owning this home costs less than renting.\n\nLet's connect for 5 minutes this week to discuss how we can convert your buyer leads into closed transactions.\n\nBest regards,\n${loanOfficer.name}\n${loanOfficer.title} | NMLS #${loanOfficer.nmlsId}\n${loanOfficer.phone}`,
        smsScript: `Hi [AgentName], sent over a quick idea on how to help your renters buy with $0 down via USDA RD. Check your email when you get a chance!`,
        openHouseTalkingPoints: [
          "Highlight that buyers can purchase with $0 down payment using 100% USDA RD financing.",
          "Show how $2,200/mo average rent compares to $2,140/mo mortgage payments with seller credits.",
          "Provide a co-branded QR code link on flyers for instant 60-second pre-qualifications.",
        ],
        rentVsBuyComparison: {
          avgLocalRent: "$2,250/mo",
          estMortgagePayment: "$2,180/mo",
          downPaymentRequired: "$0 (USDA RD 100% Financing)",
          monthlySavings: "$70/mo + Home Equity Growth",
        },
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportCampaignTxt = () => {
    if (!campaignResult) return;

    const content = `=====================================================
AI PARTNER CAMPAIGN BRIEF
Loan Officer: ${loanOfficer.name} (NMLS #${loanOfficer.nmlsId})
Co-Branded Portal: ${pairingUrl}
Generated: ${new Date().toLocaleDateString()}
=====================================================

--- EMAIL OUTREACH DRAFT ---
SUBJECT: ${campaignResult.subject}

${campaignResult.body}

--- SMS FOLLOW-UP SCRIPT ---
${campaignResult.smsScript || "N/A"}

--- STOP RENTING VS OWNING COMPARISON ---
Average Local Rent: ${campaignResult.rentVsBuyComparison?.avgLocalRent || "$2,250/mo"}
Estimated Mortgage Payment: ${campaignResult.rentVsBuyComparison?.estMortgagePayment || "$2,180/mo"}
Down Payment Required: ${campaignResult.rentVsBuyComparison?.downPaymentRequired || "$0"}
Monthly Advantage: ${campaignResult.rentVsBuyComparison?.monthlySavings || "$70/mo + equity"}

--- OPEN HOUSE TALKING POINTS ---
${(campaignResult.openHouseTalkingPoints || []).map((tp, i) => `${i + 1}. ${tp}`).join("\n")}
`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AI-Partner-Campaign-${loanOfficer.name.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    if (triggerToast) triggerToast("Downloaded Campaign Brief .txt");
  };

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI Copilot • Buyer Agent Growth Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D362E]">
              AI Partner Campaign Generator
            </h2>
            <p className="text-xs sm:text-sm text-[#606C5D] max-w-3xl">
              Attract top Buyer&apos;s Agents by crafting specialized outreach campaigns that pair
              their qualifying listings with low/no down payment programs (USDA RD $0 down, Flex DPA
              Grants) to help renters stop paying rent and buy their first home.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenEmailOutreachModal && (
              <button
                onClick={onOpenEmailOutreachModal}
                className="px-4 py-2.5 bg-[#2D362E] hover:bg-[#1f2520] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all"
              >
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>Launch Email Outreach Studio</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Campaign Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Config Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Step 1: Select Strategy Focus */}
          <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-[#EAE7E0]">
              <span className="w-6 h-6 rounded-full bg-[#4A5D4E] text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="font-serif font-bold text-base text-[#2D362E]">
                Select Campaign Strategy
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {[
                {
                  id: "usda_zero_down",
                  title: "🌾 USDA RD 100% Zero-Down Focus",
                  desc: "Highlight 100% financing for eligible rural/suburban listings so renters buy with $0 out of pocket.",
                },
                {
                  id: "flex_dpa_grants",
                  title: "💳 Flex DPA Grants + Seller Concession",
                  desc: "Combine 3.5%-5% down payment assistance grants with 3% seller credits for rate buydowns.",
                },
                {
                  id: "stop_renting_math",
                  title: "📈 Stop Renting vs. Owning Comparison",
                  desc: "Show buyer agents direct payment math comparing local average rents vs owning their listing.",
                },
                {
                  id: "open_house_kit",
                  title: "🎪 Co-Branded Open House Lead Engine",
                  desc: "Provide flyers & 1-click pre-qual QR codes to convert open house visitors into buyers.",
                },
              ].map((strat) => (
                <button
                  key={strat.id}
                  onClick={() => setCampaignFocus(strat.id as any)}
                  className={`text-left p-3.5 rounded-2xl border transition-all ${
                    campaignFocus === strat.id
                      ? "bg-[#FAF9F5] border-[#4A5D4E] ring-2 ring-[#4A5D4E]/15 shadow-2xs"
                      : "bg-white border-[#EAE7E0] hover:border-[#9A9488]"
                  }`}
                >
                  <div className="font-bold text-xs text-[#2D362E]">{strat.title}</div>
                  <div className="text-[11px] text-[#606C5D] mt-0.5 leading-relaxed">
                    {strat.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Target Buyer Agents Picker */}
          <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE7E0]">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#4A5D4E] text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h3 className="font-serif font-bold text-base text-[#2D362E]">
                  Target Buyer Agents
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {selectedAgentIds.length} Selected
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {agentRoster.map((agent) => {
                const isSelected = selectedAgentIds.includes(agent.id);
                const isBuyerAgent = agent.agentType === "buyer_agent";

                return (
                  <div
                    key={agent.id}
                    onClick={() => toggleAgentSelection(agent.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? "bg-emerald-50/70 border-emerald-300 shadow-2xs"
                        : "bg-[#FAF9F5] border-[#EAE7E0] hover:bg-[#F1EFE9]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-emerald-700 border-emerald-700 text-white"
                            : "border-[#9A9488] bg-white"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-[#2D362E] truncate flex items-center gap-1.5">
                          <span>{agent.name}</span>
                          {isBuyerAgent ? (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                              🟢 Buyer Agent
                            </span>
                          ) : (
                            <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-semibold">
                              Listing Agent
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#9A9488] truncate">
                          {agent.brokerage} • {agent.email}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#606C5D] mb-1">
                Custom Agent Name / Office (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Sarah Jenkins, Premier Buyer Realty"
                value={customAgentInput}
                onChange={(e) => setCustomAgentInput(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl focus:outline-none focus:border-[#4A5D4E]"
              />
            </div>
          </div>

          {/* Step 3: Select Qualifying Property Listings */}
          <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE7E0]">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#4A5D4E] text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h3 className="font-serif font-bold text-base text-[#2D362E]">
                  Feature Qualifying Listings
                </h3>
              </div>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                {selectedPropertyIds.length} Properties
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPropertyFilter("all")}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg ${
                  propertyFilter === "all"
                    ? "bg-[#2D362E] text-white"
                    : "bg-[#FAF9F5] text-[#606C5D] border border-[#EAE7E0]"
                }`}
              >
                All ({properties.length})
              </button>
              <button
                onClick={() => setPropertyFilter("usda")}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg ${
                  propertyFilter === "usda"
                    ? "bg-emerald-700 text-white"
                    : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                }`}
              >
                🌾 USDA 0% Down ({properties.filter((p) => p.overlayEligibility?.usda).length})
              </button>
              <button
                onClick={() => setPropertyFilter("flex_dpa")}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg ${
                  propertyFilter === "flex_dpa"
                    ? "bg-amber-700 text-white"
                    : "bg-amber-50 text-amber-800 border border-amber-200"
                }`}
              >
                💳 Flex DPA Grants
              </button>
            </div>

            {/* Listings Checklist */}
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {filteredProperties.slice(0, 8).map((prop) => {
                const isSelected = selectedPropertyIds.includes(prop.id);
                const isUsda = prop.overlayEligibility?.usda;

                return (
                  <div
                    key={prop.id}
                    onClick={() => togglePropertySelection(prop.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? "bg-amber-50/70 border-amber-300 shadow-2xs"
                        : "bg-[#FAF9F5] border-[#EAE7E0] hover:bg-[#F1EFE9]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-amber-600 border-amber-600 text-white"
                            : "border-[#9A9488] bg-white"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-[#2D362E] truncate">
                          {prop.address}, {prop.city}
                        </div>
                        <div className="text-[10px] text-[#606C5D] flex items-center gap-2">
                          <span className="font-semibold text-[#4A5D4E]">
                            ${prop.price.toLocaleString()}
                          </span>
                          {isUsda ? (
                            <span className="text-emerald-700 font-bold">
                              🌾 100% USDA Zero Down
                            </span>
                          ) : (
                            <span className="text-amber-700 font-semibold">💳 Flex DPA Grant</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tone & Custom Instructions */}
          <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-[#EAE7E0]">
              <span className="w-6 h-6 rounded-full bg-[#4A5D4E] text-white text-xs font-bold flex items-center justify-center">
                4
              </span>
              <h3 className="font-serif font-bold text-base text-[#2D362E]">
                Tone & Custom Directives
              </h3>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#606C5D] mb-1">
                Campaign Tone Strategy
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl focus:outline-none focus:border-[#4A5D4E] font-medium"
              >
                <option value="high_converting">
                  ⚡ High-Converting & Growth-Oriented (Action-Focused)
                </option>
                <option value="consultative">
                  🤝 Consultative & Educational (Relationship Building)
                </option>
                <option value="data_driven">
                  📊 Concise & Data-Driven (Rent vs Buy Math Focus)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#606C5D] mb-1">
                Additional Instructions or Value-Add
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Mention our 10-day fast closing guarantee or $1,000 appraisal credit for first-time buyers..."
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                className="w-full p-2.5 text-xs bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl focus:outline-none focus:border-[#4A5D4E]"
              />
            </div>

            <button
              onClick={handleGenerateCampaign}
              disabled={isGenerating}
              className="w-full py-3 bg-gradient-to-r from-[#4A5D4E] to-[#2D362E] hover:opacity-95 text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Generating AI Partner Campaign Package...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate AI Partner Campaign Package</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Output Campaign Package Studio (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {campaignResult ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Primary Email Draft Card */}
              <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-8 space-y-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EAE7E0]">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Generated Email Outreach Draft
                    </span>
                    <h3 className="font-serif font-bold text-xl text-[#2D362E] mt-1">
                      Targeted Buyer Agent Outreach
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleCopy(`${campaignResult.subject}\n\n${campaignResult.body}`, "email")
                      }
                      className="px-3 py-1.5 bg-[#FAF9F5] hover:bg-[#F1EFE9] border border-[#EAE7E0] rounded-xl text-xs font-bold text-[#4A5D4E] flex items-center gap-1.5 transition-colors"
                    >
                      {copiedKey === "email" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Copy Draft</span>
                    </button>

                    {onOpenEmailOutreachModal && (
                      <button
                        onClick={onOpenEmailOutreachModal}
                        className="px-3.5 py-1.5 bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5 text-amber-300" />
                        <span>Send via Email Studio</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Email Subject Box */}
                <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#EAE7E0] space-y-1">
                  <span className="text-[10px] font-bold text-[#9A9488] uppercase tracking-wider">
                    Subject Line:
                  </span>
                  <div className="font-bold text-sm text-[#2D362E]">{campaignResult.subject}</div>
                </div>

                {/* Email Body Box */}
                <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#EAE7E0] space-y-3 font-sans text-xs sm:text-sm text-[#2D362E] leading-relaxed whitespace-pre-line">
                  {campaignResult.body}
                </div>
              </div>

              {/* Stop Renting vs. Owning Comparison Matrix */}
              {campaignResult.rentVsBuyComparison && (
                <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-[#EAE7E0]">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-700" />
                      <h4 className="font-serif font-bold text-base text-[#2D362E]">
                        Stop Renting vs. Owning Value Proposition
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Renter Conversion Math
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#EAE7E0]">
                      <span className="text-[10px] text-[#9A9488] font-bold uppercase block">
                        Avg. Local Rent
                      </span>
                      <span className="font-bold text-base text-[#2D362E] mt-1 block">
                        {campaignResult.rentVsBuyComparison.avgLocalRent}
                      </span>
                    </div>

                    <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#EAE7E0]">
                      <span className="text-[10px] text-[#9A9488] font-bold uppercase block">
                        Est. Mortgage PITI
                      </span>
                      <span className="font-bold text-base text-[#4A5D4E] mt-1 block">
                        {campaignResult.rentVsBuyComparison.estMortgagePayment}
                      </span>
                    </div>

                    <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#EAE7E0]">
                      <span className="text-[10px] text-[#9A9488] font-bold uppercase block">
                        Down Payment
                      </span>
                      <span className="font-bold text-base text-emerald-700 mt-1 block">
                        {campaignResult.rentVsBuyComparison.downPaymentRequired}
                      </span>
                    </div>

                    <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#EAE7E0]">
                      <span className="text-[10px] text-[#9A9488] font-bold uppercase block">
                        Monthly Advantage
                      </span>
                      <span className="font-bold text-base text-amber-700 mt-1 block">
                        {campaignResult.rentVsBuyComparison.monthlySavings}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* SMS Follow-Up Script & Open House Talking Points Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SMS Follow-Up Script */}
                {campaignResult.smsScript && (
                  <div className="bg-white rounded-3xl border border-[#EAE7E0] p-5 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D362E]">
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                        <span>Follow-Up SMS / Text Script</span>
                      </div>
                      <button
                        onClick={() => handleCopy(campaignResult.smsScript!, "sms")}
                        className="p-1 text-[#606C5D] hover:text-[#2D362E] transition-colors"
                        title="Copy SMS"
                      >
                        {copiedKey === "sms" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#EAE7E0] text-xs text-[#2D362E] leading-relaxed font-mono">
                      {campaignResult.smsScript}
                    </div>
                  </div>
                )}

                {/* Open House Talking Points */}
                {campaignResult.openHouseTalkingPoints &&
                  campaignResult.openHouseTalkingPoints.length > 0 && (
                    <div className="bg-white rounded-3xl border border-[#EAE7E0] p-5 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D362E]">
                          <Home className="w-4 h-4 text-amber-600" />
                          <span>Open House Renter Talking Points</span>
                        </div>
                      </div>

                      <ul className="space-y-1.5 text-xs text-[#606C5D]">
                        {campaignResult.openHouseTalkingPoints.map((pt, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 bg-[#FAF9F5] p-2 rounded-lg border border-[#EAE7E0]"
                          >
                            <span className="font-bold text-[#4A5D4E] shrink-0">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>

              {/* Bottom Action Footer */}
              <div className="bg-[#2D362E] rounded-3xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                <div>
                  <h4 className="font-serif font-bold text-lg">
                    Ready to Launch Your Buyer Agent Campaign?
                  </h4>
                  <p className="text-xs text-gray-300 mt-0.5">
                    Download the complete campaign brief or load into your email outreach portal to
                    start connecting with partner agents.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleExportCampaignTxt}
                    className="px-4 py-2.5 bg-white hover:bg-[#FAF9F5] text-[#2D362E] font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-4 h-4 text-[#C18C5D]" />
                    <span>Download Brief (.txt)</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State Placeholder */
            <div className="bg-white rounded-3xl border border-[#EAE7E0] p-12 text-center space-y-4 shadow-sm h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-3xl bg-[#FAF9F5] border border-[#EAE7E0] text-[#4A5D4E] flex items-center justify-center shadow-xs">
                <Sparkles className="w-8 h-8 text-amber-500" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-[#2D362E]">
                  AI Campaign Package Preview
                </h3>
                <p className="text-xs text-[#606C5D] max-w-md mx-auto mt-1">
                  Configure your strategy focus, select target buyer agents and qualifying listings
                  on the left, then click{" "}
                  <strong>&quot;Generate AI Partner Campaign Package&quot;</strong> to craft
                  personalized outreach email drafts and renter conversion materials.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
