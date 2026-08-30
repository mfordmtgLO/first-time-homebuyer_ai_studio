import React, { useState } from "react";
import { 
  Sparkles, 
  Search, 
  Send, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  ExternalLink, 
  Layers, 
  Zap, 
  Building, 
  DollarSign, 
  ShieldCheck, 
  MapPin, 
  ArrowRight,
  TrendingUp,
  Percent,
  X,
  Compass,
  FileText,
  Hourglass,
  Award,
  PhoneCall,
  UserCheck
} from "lucide-react";
import { FinancialProfile } from "../types";
import { formatUSD } from "../utils/mortgageMath";

interface SearchGroundedSidebarBotProps {
  profile: FinancialProfile;
  setProfile?: React.Dispatch<React.SetStateAction<FinancialProfile>>;
  onNavigate?: (tab: string, mode?: "website" | "dashboard") => void;
  onTriggerToast?: (msg: string) => void;
  loanOfficerName?: string;
  className?: string;
}

interface GroundedCitation {
  title: string;
  url: string;
}

interface DetectedParameters {
  conformingLoanLimit?: number | null;
  fhaLoanLimit?: number | null;
  propertyTaxRate?: number | null;
  homeInsuranceAnnual?: number | null;
  dpaGrantAmount?: number | null;
  isLmiEligible?: boolean | null;
  isUsdaEligible?: boolean | null;
  amiPercentage?: number | null;
  suggestedTargetPrice?: number | null;
  recommendedLoanType?: "30yr" | "fha" | "usda" | "va" | null;
  summaryHeadline?: string | null;
}

interface GroundedResponseData {
  query: string;
  answer: string;
  detectedParameters: DetectedParameters;
  sources: GroundedCitation[];
  webSearchQueries: string[];
  timestamp: string;
}

const SUGGESTED_PROMPTS = [
  {
    category: "Winning Offers & 2-1 Buydowns",
    icon: Award,
    prompts: [
      "How does a 2-1 temporary rate buydown work and how much does it save?",
      "What winning strategies help first-time buyers win in competitive offer situations?",
      "How can I use seller concessions to cover closing costs or buy down my rate?"
    ]
  },
  {
    category: "Cost of Waiting & Market Trends",
    icon: Hourglass,
    prompts: [
      "What is the Cost of Waiting analysis if I delay buying for 1 or 2 years?",
      "What is the average age of a first-time homebuyer and average home price in Oregon?",
      "What is the latest housing market news and mortgage industry outlook?"
    ]
  },
  {
    category: "Mortgage Terms & Underwriting",
    icon: FileText,
    prompts: [
      "Explain DTI ratios (front-end vs back-end) and how underwriters calculate income",
      "What is the difference between Conventional, FHA, USDA, and VA loans?",
      "What is PITI and what itemized closing costs should I budget for?"
    ]
  },
  {
    category: "DPA Grants & Loan Limits",
    icon: DollarSign,
    prompts: [
      "How do Down Payment Assistance (DPA) programs work and what are the qualifications?",
      "What are the 2026 FHFA conforming and FHA loan limits for Oregon?",
      "What are USDA 100% 0-down rural boundary and LMI tract eligibility rules?"
    ]
  }
];

export const SearchGroundedSidebarBot: React.FC<SearchGroundedSidebarBotProps> = ({
  profile,
  setProfile,
  onNavigate,
  onTriggerToast,
  loanOfficerName = "Mike Ford (NMLS #288455)",
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [showPromptPicker, setShowPromptPicker] = useState<boolean>(false);
  const [inputQuery, setInputQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<GroundedResponseData | null>(null);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number>(0);

  const handleRunQuery = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed || loading) return;

    setInputQuery(trimmed);
    setShowPromptPicker(false);
    setLoading(true);
    setAppliedNotice(null);

    try {
      const res = await fetch("/api/ai/search-grounded-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: trimmed,
          userContext: {
            state: profile.state || "Oregon (OR)",
            annualIncome: profile.annualIncome,
            monthlyDebt: profile.monthlyDebt,
            downPayment: profile.downPaymentSavings,
            targetPrice: profile.targetPrice,
            creditScore: profile.creditScore
          }
        })
      });

      const data = await res.json();
      if (data.success && data.answer) {
        setResponse(data);
      } else {
        setResponse({
          query: trimmed,
          answer: data.error || "Unable to fetch search-grounded result at this time. Please try a different query.",
          detectedParameters: {},
          sources: [],
          webSearchQueries: [],
          timestamp: new Date().toISOString()
        });
      }
    } catch (err: any) {
      console.error("Search Grounding client error:", err);
      setResponse({
        query: trimmed,
        answer: "A network error occurred while querying mortgage educational grounding. Please verify your connection.",
        detectedParameters: {},
        sources: [],
        webSearchQueries: [],
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToAffordability = () => {
    if (!response?.detectedParameters || !setProfile) return;

    const params = response.detectedParameters;
    let appliedCount = 0;
    const notes: string[] = [];

    setProfile(prev => {
      const updated = { ...prev };

      if (params.dpaGrantAmount && typeof params.dpaGrantAmount === "number" && params.dpaGrantAmount > 0) {
        updated.downPaymentSavings = (prev.downPaymentSavings || 0) + params.dpaGrantAmount;
        appliedCount++;
        notes.push(`DPA Grant: +${formatUSD(params.dpaGrantAmount)}`);
      }

      if (params.propertyTaxRate && typeof params.propertyTaxRate === "number") {
        updated.propertyTaxRate = params.propertyTaxRate;
        appliedCount++;
        notes.push(`Tax Rate: ${params.propertyTaxRate}%`);
      }

      if (params.suggestedTargetPrice && typeof params.suggestedTargetPrice === "number") {
        updated.targetPrice = params.suggestedTargetPrice;
        appliedCount++;
        notes.push(`Target Price: ${formatUSD(params.suggestedTargetPrice)}`);
      }

      if (params.recommendedLoanType) {
        if (params.recommendedLoanType === "fha") {
          updated.pmiRate = 0.55;
          appliedCount++;
          notes.push(`FHA Program (0.55% MIP)`);
        } else if (params.recommendedLoanType === "usda") {
          updated.pmiRate = 0.35;
          appliedCount++;
          notes.push(`USDA RD Program (0.35% Fee)`);
        } else if (params.recommendedLoanType === "va") {
          updated.pmiRate = 0;
          appliedCount++;
          notes.push(`VA 0% Down Financing`);
        }
      }

      return updated;
    });

    const msg = appliedCount > 0 
      ? `Applied ${appliedCount} parameters (${notes.join(", ")}) to scenario calculator!`
      : "Scenario recalculated with search-grounded parameters.";

    setAppliedNotice(msg);
    if (onTriggerToast) {
      onTriggerToast(msg);
    }
  };

  const hasActionableParams = response?.detectedParameters && (
    response.detectedParameters.dpaGrantAmount ||
    response.detectedParameters.conformingLoanLimit ||
    response.detectedParameters.fhaLoanLimit ||
    response.detectedParameters.propertyTaxRate ||
    response.detectedParameters.suggestedTargetPrice ||
    response.detectedParameters.isLmiEligible !== undefined ||
    response.detectedParameters.isUsdaEligible !== undefined
  );

  // Keyword checks for deep tool navigation
  const answerLower = (response?.answer || "").toLowerCase();
  const queryLower = (response?.query || "").toLowerCase();
  const isBuydownRelated = answerLower.includes("buydown") || queryLower.includes("buydown");
  const isCostOfWaitingRelated = answerLower.includes("cost of waiting") || answerLower.includes("waiting") || queryLower.includes("wait");
  const isDpaRelated = answerLower.includes("dpa") || answerLower.includes("grant") || answerLower.includes("down payment assistance");
  const isAffordabilityRelated = answerLower.includes("piti") || answerLower.includes("dti") || answerLower.includes("purchasing power");

  return (
    <div 
      id="search-grounded-sidebar-container" 
      className={`bg-white rounded-2xl border border-[#DEDAD2] shadow-sm overflow-hidden flex flex-col transition-all ${className}`}
    >
      {/* Header Bar */}
      <div className="bg-[#FAF9F5] px-3.5 py-2.5 border-b border-[#EAE7E0] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#4A5D4E] flex items-center justify-center text-white shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#E6C280]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-[#2D362E]">Mortgage Education AI</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-[#EBF3ED] text-[#2F5738] font-bold text-[9px] border border-[#C2DEC8]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Live Grounded</span>
              </span>
            </div>
            <p className="text-[10px] text-[#606C5D] leading-none mt-0.5">
              Strategies, Scenario Rules & Market Intelligence
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-md text-[#9A9488] hover:text-[#2D362E] hover:bg-[#F1EFE9] transition-colors cursor-pointer"
          title={isExpanded ? "Collapse Education AI Assistant" : "Expand Education AI Assistant"}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-3 space-y-3 flex-1 flex flex-col text-xs">
          
          {/* Quick Suggested Prompt Dropdown / Expand Button */}
          <div>
            <button
              type="button"
              onClick={() => setShowPromptPicker(!showPromptPicker)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-[#F9F8F4] hover:bg-[#F1EFE9] border border-[#EAE7E0] text-[11px] font-bold text-[#4A5D4E] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-[#C18C5D]" />
                <span>Curated Educational Prompts</span>
              </div>
              <span className="text-[10px] font-semibold text-[#9A9488]">
                {showPromptPicker ? "Hide ▲" : "Browse Topics ▼"}
              </span>
            </button>

            {/* Expandable Suggested Prompts Box */}
            {showPromptPicker && (
              <div className="mt-2 p-2 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0] space-y-2 animate-in fade-in zoom-in-95 duration-150">
                {/* Category Pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 dashboard-scrollbar">
                  {SUGGESTED_PROMPTS.map((cat, idx) => {
                    const isSelected = selectedCategoryIndex === idx;
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.category}
                        type="button"
                        onClick={() => setSelectedCategoryIndex(idx)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#4A5D4E] text-white shadow-2xs"
                            : "bg-white text-[#606C5D] hover:bg-[#EAE7E0] border border-[#EAE7E0]"
                        }`}
                      >
                        <Icon className="w-2.5 h-2.5" />
                        <span>{cat.category}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Prompt List within selected category */}
                <div className="space-y-1">
                  {SUGGESTED_PROMPTS[selectedCategoryIndex].prompts.map((p, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => handleRunQuery(p)}
                      className="w-full text-left p-1.5 rounded-lg bg-white hover:bg-[#EBF3ED] hover:border-[#C2DEC8] border border-[#EAE7E0] text-[11px] text-[#2D362E] hover:text-[#183922] transition-colors leading-snug flex items-start gap-1.5 group cursor-pointer"
                    >
                      <span className="text-[#C18C5D] font-bold text-[10px] mt-0.5 shrink-0">▸</span>
                      <span className="flex-1 group-hover:underline">{p}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Input & Action Row */}
          <div className="space-y-1.5">
            <div className="relative flex items-center">
              <input
                id="search-grounded-input"
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleRunQuery(inputQuery);
                  }
                }}
                placeholder="Ask buydowns, cost of waiting, DTI, DPA..."
                className="w-full pl-2.5 pr-8 py-1.5 bg-white rounded-xl border border-[#DEDAD2] focus:border-[#4A5D4E] focus:outline-none text-[11px] text-[#2D362E] placeholder-[#9A9488] shadow-2xs"
                disabled={loading}
              />
              {inputQuery && !loading && (
                <button
                  type="button"
                  onClick={() => setInputQuery("")}
                  className="absolute right-7 p-1 text-[#9A9488] hover:text-[#2D362E]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              <button
                id="search-grounded-submit-btn"
                type="button"
                onClick={() => handleRunQuery(inputQuery)}
                disabled={!inputQuery.trim() || loading}
                className="absolute right-1 p-1 rounded-lg bg-[#4A5D4E] hover:bg-[#38463B] text-white disabled:opacity-40 transition-all cursor-pointer"
                title="Run mortgage educational query"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0] flex flex-col items-center justify-center text-center space-y-1.5">
              <RefreshCw className="w-5 h-5 text-[#4A5D4E] animate-spin" />
              <p className="text-[11px] font-bold text-[#2D362E]">Synthesizing Mortgage Intelligence...</p>
              <p className="text-[10px] text-[#606C5D]">Retrieving verified guidelines, buydown concepts & market data</p>
            </div>
          )}

          {/* Results Display */}
          {response && !loading && (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1 dashboard-scrollbar">
              
              {/* Response Header Pill */}
              <div className="flex items-center justify-between text-[10px] text-[#606C5D] pb-1 border-b border-[#EAE7E0]">
                <span className="font-semibold truncate max-w-[170px]" title={response.query}>
                  Q: "{response.query}"
                </span>
                <span className="text-[9px] text-[#9A9488]">Curated Mortgage Guidance</span>
              </div>

              {/* Synthesized Answer Text */}
              <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0] text-[11px] text-[#2D362E] leading-relaxed whitespace-pre-line">
                {response.answer}
              </div>

              {/* Contextual Deep-Link Action Cards */}
              <div className="space-y-1.5">
                {isBuydownRelated && (
                  <button
                    type="button"
                    onClick={() => onNavigate?.("mortgagelab", "dashboard")}
                    className="w-full p-2 rounded-xl bg-[#EBF3ED] hover:bg-[#DDEEE1] border border-[#C2DEC8] flex items-center justify-between text-[11px] font-bold text-[#2F5738] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-[#C18C5D]" />
                      <span>Open 2-1 Buydown Scenario Calculator</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {isCostOfWaitingRelated && (
                  <button
                    type="button"
                    onClick={() => onNavigate?.("mortgagelab", "dashboard")}
                    className="w-full p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 flex items-center justify-between text-[11px] font-bold text-amber-900 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <Hourglass className="w-3.5 h-3.5 text-amber-700" />
                      <span>Open Cost of Waiting Scenario Tool</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {isDpaRelated && (
                  <button
                    type="button"
                    onClick={() => onNavigate?.("grants", "website")}
                    className="w-full p-2 rounded-xl bg-[#FAF9F5] hover:bg-[#F1EFE9] border border-[#EAE7E0] flex items-center justify-between text-[11px] font-bold text-[#4A5D4E] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-[#C18C5D]" />
                      <span>Explore DPA Grants & Boundary Finder</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Local Mortgage Guide Dedicated Contact Box */}
              <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0] space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#2D362E]">
                  <UserCheck className="w-3.5 h-3.5 text-[#4A5D4E]" />
                  <span>Connect with Your Local Mortgage Guide</span>
                </div>
                <p className="text-[10px] text-[#606C5D] leading-snug">
                  Because rates move daily and DPA/underwriting qualification requires individual verification, connect with <strong className="text-[#2D362E]">{loanOfficerName}</strong> to dial in your customized scenarios and Roadmap to Homeownership.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate?.("advisor", "website")}
                  className="w-full py-1 px-2 rounded-lg bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold text-[10px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <PhoneCall className="w-3 h-3 text-[#D4A373]" />
                  <span>Request Custom Qualification Review</span>
                </button>
              </div>

              {/* Actionable Detected Parameters Card for Affordability Calculator & Spatial Map */}
              {hasActionableParams && (
                <div className="p-2.5 rounded-xl bg-[#EBF3ED] border border-[#C2DEC8] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 font-bold text-[11px] text-[#2F5738]">
                      <Zap className="w-3.5 h-3.5 text-[#C18C5D]" />
                      <span>Calculator & Spatial Impact Detected</span>
                    </div>
                  </div>

                  {/* Badges Grid */}
                  <div className="grid grid-cols-2 gap-1 text-[10px]">
                    {response.detectedParameters.conformingLoanLimit && (
                      <div className="p-1 rounded bg-white/80 border border-[#C2DEC8] flex items-center justify-between">
                        <span className="text-[#606C5D]">Conforming:</span>
                        <span className="font-bold text-[#2F5738]">{formatUSD(response.detectedParameters.conformingLoanLimit)}</span>
                      </div>
                    )}
                    {response.detectedParameters.fhaLoanLimit && (
                      <div className="p-1 rounded bg-white/80 border border-[#C2DEC8] flex items-center justify-between">
                        <span className="text-[#606C5D]">FHA Limit:</span>
                        <span className="font-bold text-[#2F5738]">{formatUSD(response.detectedParameters.fhaLoanLimit)}</span>
                      </div>
                    )}
                    {response.detectedParameters.dpaGrantAmount && (
                      <div className="p-1 rounded bg-white/80 border border-[#C2DEC8] flex items-center justify-between">
                        <span className="text-[#606C5D]">DPA Grant:</span>
                        <span className="font-bold text-[#C18C5D]">+{formatUSD(response.detectedParameters.dpaGrantAmount)}</span>
                      </div>
                    )}
                    {response.detectedParameters.propertyTaxRate && (
                      <div className="p-1 rounded bg-white/80 border border-[#C2DEC8] flex items-center justify-between">
                        <span className="text-[#606C5D]">Property Tax:</span>
                        <span className="font-bold text-[#2F5738]">{response.detectedParameters.propertyTaxRate}%</span>
                      </div>
                    )}
                    {response.detectedParameters.isUsdaEligible !== undefined && (
                      <div className="p-1 rounded bg-white/80 border border-[#C2DEC8] flex items-center justify-between col-span-2">
                        <span className="text-[#606C5D]">USDA RD Zone:</span>
                        <span className="font-bold text-[#2F5738]">
                          {response.detectedParameters.isUsdaEligible ? "✓ 100% 0%-Down Eligible" : "Standard Zone"}
                        </span>
                      </div>
                    )}
                    {response.detectedParameters.isLmiEligible !== undefined && (
                      <div className="p-1 rounded bg-white/80 border border-[#C2DEC8] flex items-center justify-between col-span-2">
                        <span className="text-[#606C5D]">LMI Census Tract:</span>
                        <span className="font-bold text-[#2F5738]">
                          {response.detectedParameters.isLmiEligible ? "✓ CRA / FirstHome Matching" : "Standard Tract"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Apply Button */}
                  <button
                    id="search-grounded-apply-btn"
                    type="button"
                    onClick={handleApplyToAffordability}
                    className="w-full py-1.5 px-2 rounded-lg bg-[#2F5738] hover:bg-[#23432b] text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-[#E6C280]" />
                    <span>Apply Parameters to Affordability Scenario</span>
                  </button>

                  {appliedNotice && (
                    <div className="p-1.5 rounded-md bg-white border border-[#C2DEC8] text-[10px] text-[#2F5738] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{appliedNotice}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Verified Sources / Citations */}
              {response.sources && response.sources.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-[#EAE7E0]">
                  <span className="text-[10px] font-bold text-[#606C5D] uppercase tracking-wider block">
                    Educational References & Sources ({response.sources.length}):
                  </span>
                  <div className="space-y-1">
                    {response.sources.map((s, sIdx) => (
                      <a
                        key={sIdx}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-1.5 rounded-lg bg-white hover:bg-[#FAF9F5] border border-[#EAE7E0] text-[10px] text-[#4A5D4E] hover:text-[#2D362E] transition-colors group"
                      >
                        <span className="truncate max-w-[190px] font-medium">{s.title}</span>
                        <ExternalLink className="w-3 h-3 text-[#9A9488] group-hover:text-[#4A5D4E] shrink-0 ml-1" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Jump to Tools Navigation Quick Links */}
              <div className="flex items-center justify-between pt-1 text-[10px] border-t border-[#EAE7E0]">
                <button
                  type="button"
                  onClick={() => onNavigate?.("calculator", "website")}
                  className="font-bold text-[#4A5D4E] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <DollarSign className="w-3 h-3" />
                  <span>Calculator</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate?.("mortgagelab", "dashboard")}
                  className="font-bold text-[#4A5D4E] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <TrendingUp className="w-3 h-3" />
                  <span>Mortgage Lab</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate?.("grants", "website")}
                  className="font-bold text-[#4A5D4E] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Layers className="w-3 h-3" />
                  <span>DPA Finder</span>
                </button>
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
};
