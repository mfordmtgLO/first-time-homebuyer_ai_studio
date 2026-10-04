import React, { useState, useMemo } from "react";
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  BookmarkPlus, 
  Mail, 
  MessageSquare, 
  UserCheck, 
  Sparkles, 
  Check, 
  Copy, 
  ArrowRight, 
  Layers, 
  Clock, 
  Building, 
  ShieldCheck, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  Send,
  FileText,
  User,
  History,
  AlertCircle,
  Printer
} from "lucide-react";
import { 
  CapturedLead, 
  FinancialProfile, 
  SavedScenario, 
  LoanOfficerProfile, 
  RealEstateAgentProfile 
} from "../types";
import { launchLocalOutlookDraft, appendWorkEmailSignature } from "../utils/outlookEmailService";
import { 
  calculateMortgageBreakdown, 
  calculateMonthlyPI, 
  calculateAmortizationCurve,
  calculateClosingCosts,
  calculateRentVsBuy,
  formatUSD 
} from "../utils/mortgageMath";
import { buildSavedScenario, generateScenarioDrafts } from "../utils/scenarioOutreachGenerator";
import { LeadScenarioSearch } from "./LeadScenarioSearch";
import { InstantAffordabilityCalculator } from "./InstantAffordabilityCalculator";
import { MortgageLab } from "./MortgageLab";
import { ScenarioOutreachModal } from "./ScenarioOutreachModal";
import { DTIUnderwritingMeter } from "./DTIUnderwritingMeter";

interface LoanOfficerScenarioWorkbenchProps {
  leads: CapturedLead[];
  loanOfficer: LoanOfficerProfile;
  agentRoster?: RealEstateAgentProfile[];
  onUpdateLead: (updatedLead: CapturedLead) => void;
  onOpenEmailOutreach?: (leadId: string, subject?: string, body?: string) => void;
  onOpenSmsMessaging?: (lead: CapturedLead, initialText?: string) => void;
  onTriggerToast?: (msg: string) => void;
  initialLeadId?: string;
}

export const LoanOfficerScenarioWorkbench: React.FC<LoanOfficerScenarioWorkbenchProps> = ({
  leads = [],
  loanOfficer,
  agentRoster = [],
  onUpdateLead,
  onOpenEmailOutreach,
  onOpenSmsMessaging,
  onTriggerToast,
  initialLeadId
}) => {
  // Active Lead Selection
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(() => {
    if (initialLeadId) return initialLeadId;
    return leads.length > 0 ? leads[0].id : null;
  });

  const selectedLead = useMemo(() => {
    return leads.find(l => l.id === selectedLeadId) || null;
  }, [leads, selectedLeadId]);

  // Active Tool Mode: Quick Payment / Buydown vs How Much House Can I Afford
  const [activeEngine, setActiveEngine] = useState<"buydown_payment" | "affordability_dti">("buydown_payment");

  // Local Financial Profile for the Scenario
  const [profile, setProfile] = useState<FinancialProfile>(() => {
    return {
      annualIncome: 110000,
      monthlyDebt: 450,
      downPaymentSavings: 25000,
      targetPrice: 475000,
      targetMaxMonthlyPayment: 3200,
      creditScore: 720,
      state: "OR",
      propertyTaxRate: 1.05,
      annualHomeInsurance: 1200,
      monthlyHOA: 0,
      loanTermYears: 30,
      interestRate: 6.375,
      pmiRate: 0.55
    };
  });

  // Active Outreach Draft Modal
  const [activeOutreachScenario, setActiveOutreachScenario] = useState<SavedScenario | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Sync profile whenever a new lead is selected
  const handleSelectLead = (lead: CapturedLead | null) => {
    if (!lead) {
      setSelectedLeadId(null);
      return;
    }
    setSelectedLeadId(lead.id);

    // Parse lead target parameters
    let newPrice = profile.targetPrice;
    if (lead.targetPriceRange) {
      const match = lead.targetPriceRange.match(/\$?(\d[\d,]*)/);
      if (match) {
        const parsed = parseInt(match[1].replace(/,/g, ""), 10);
        if (!isNaN(parsed) && parsed > 50000) {
          newPrice = parsed;
        }
      }
    }

    let newDown = profile.downPaymentSavings;
    if (lead.downPaymentSavings) {
      const match = lead.downPaymentSavings.match(/\$?(\d[\d,]*)/);
      if (match) {
        const parsed = parseInt(match[1].replace(/,/g, ""), 10);
        if (!isNaN(parsed) && parsed > 0) {
          newDown = parsed;
        }
      }
    }

    let newIncome = profile.annualIncome;
    if (lead.annualIncome) {
      const match = lead.annualIncome.match(/\$?(\d[\d,]*)/);
      if (match) {
        const parsed = parseInt(match[1].replace(/,/g, ""), 10);
        if (!isNaN(parsed) && parsed > 10000) {
          newIncome = parsed;
        }
      }
    }

    let newBudget = profile.targetMaxMonthlyPayment || 3200;
    if (lead.targetMonthlyBudget) {
      const match = lead.targetMonthlyBudget.match(/\$?(\d[\d,]*)/);
      if (match) {
        const parsed = parseInt(match[1].replace(/,/g, ""), 10);
        if (!isNaN(parsed) && parsed > 500) {
          newBudget = parsed;
        }
      }
    }

    setProfile(prev => ({
      ...prev,
      targetPrice: newPrice,
      downPaymentSavings: newDown,
      annualIncome: newIncome,
      targetMaxMonthlyPayment: newBudget
    }));
  };

  // Find assigned Realtor partner
  const assignedAgent = useMemo(() => {
    if (!selectedLead?.assignedAgentId && !selectedLead?.assignedAgent) return undefined;
    return agentRoster.find(a => a.id === selectedLead.assignedAgentId || a.name === selectedLead.assignedAgent);
  }, [agentRoster, selectedLead]);

  // Current Mortgage Math Breakdown
  const breakdown = calculateMortgageBreakdown(profile);

  // 2-1 Rate Buydown Calculation
  const loanAmount = Math.max(0, profile.targetPrice - profile.downPaymentSavings);
  const fullRate = profile.interestRate || 6.375;
  const year1Rate = Math.max(0.1, Number((fullRate - 2.0).toFixed(3)));
  const year2Rate = Math.max(0.1, Number((fullRate - 1.0).toFixed(3)));
  const fullMonthlyPI = calculateMonthlyPI(loanAmount, fullRate, 30);
  const year1MonthlyPI = calculateMonthlyPI(loanAmount, year1Rate, 30);
  const year2MonthlyPI = calculateMonthlyPI(loanAmount, year2Rate, 30);
  const year1MonthlySavings = Math.max(0, fullMonthlyPI - year1MonthlyPI);
  const year2MonthlySavings = Math.max(0, fullMonthlyPI - year2MonthlyPI);
  const totalBuydownSubsidyCost = (year1MonthlySavings * 12) + (year2MonthlySavings * 12);

  // Dynamic Ready-to-Send Drafts for Currently Active Calculation
  const liveDrafts = useMemo(() => {
    if (!selectedLead) return null;
    return generateScenarioDrafts({
      lead: selectedLead,
      profile,
      breakdown,
      loanProgram: activeEngine === "buydown_payment" ? "2-1 Temporary Rate Buydown (Conventional/FHA)" : "30-Year Fixed Conventional",
      sourceTool: activeEngine === "buydown_payment" ? "mortgagelab" : "calculator",
      loanOfficer,
      agent: assignedAgent
    });
  }, [selectedLead, profile, breakdown, activeEngine, loanOfficer, assignedAgent]);

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    if (onTriggerToast) onTriggerToast("✓ Copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Save Scenario to Selected Lead
  const handleSaveScenario = (scenarioTitle?: string) => {
    if (!selectedLead) {
      if (onTriggerToast) onTriggerToast("⚠️ Please select a borrower lead first to save this scenario.");
      return;
    }

    const title = scenarioTitle || (activeEngine === "buydown_payment" 
      ? `2-1 Buydown @ ${formatUSD(profile.targetPrice)} (Saves ${formatUSD(year1MonthlySavings)}/mo Yr 1)`
      : `Affordability Breakdown @ ${formatUSD(profile.targetPrice)} (${formatUSD(breakdown.totalMonthly)}/mo)`);

    const newScenario = buildSavedScenario({
      lead: selectedLead,
      profile,
      breakdown,
      loanProgram: activeEngine === "buydown_payment" ? "2-1 Temporary Buydown (30-Yr Fixed)" : "30-Yr Conventional",
      sourceTool: activeEngine === "buydown_payment" ? "mortgagelab" : "calculator",
      loanOfficer,
      agent: assignedAgent,
      scenarioName: title
    });

    const currentScenarios = selectedLead.savedScenarios || [];
    const updatedScenarios = [newScenario, ...currentScenarios];

    // Also append an activity note into CRM
    const timestamp = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    const crmLog = `[${timestamp}] Loan Scenario Modeled & Saved: ${title} — Target: ${formatUSD(profile.targetPrice)}, PITI: ${formatUSD(breakdown.totalMonthly)}/mo, Down: ${formatUSD(profile.downPaymentSavings)} (${breakdown.downPaymentPercent}%).`;
    const existingNotes = selectedLead.notes ? `${selectedLead.notes}\n\n${crmLog}` : crmLog;

    const updatedLead: CapturedLead = {
      ...selectedLead,
      savedScenarios: updatedScenarios,
      notes: existingNotes
    };

    onUpdateLead(updatedLead);
    setActiveOutreachScenario(newScenario);
    setSaveSuccessMsg(`✓ Saved "${title}" to ${selectedLead.fullName}'s profile & CRM timeline!`);
    if (onTriggerToast) onTriggerToast(`✓ Scenario saved to ${selectedLead.fullName}'s profile!`);
    setTimeout(() => setSaveSuccessMsg(null), 5000);
  };

  // Delete a saved scenario from lead
  const handleDeleteScenario = (scenarioId: string) => {
    if (!selectedLead) return;
    const filtered = (selectedLead.savedScenarios || []).filter(s => s.id !== scenarioId);
    const updatedLead: CapturedLead = {
      ...selectedLead,
      savedScenarios: filtered
    };
    onUpdateLead(updatedLead);
    if (onTriggerToast) onTriggerToast("Scenario removed from lead profile.");
  };

  // Load a historical scenario into active workbench
  const handleLoadScenario = (scen: SavedScenario) => {
    setProfile(prev => ({
      ...prev,
      targetPrice: scen.targetPrice,
      downPaymentSavings: scen.downPayment,
      interestRate: scen.interestRate,
      loanTermYears: scen.loanTermYears,
      annualIncome: scen.annualIncome || prev.annualIncome,
      monthlyDebt: scen.monthlyDebt || prev.monthlyDebt
    }));
    setActiveOutreachScenario(scen);
    if (onTriggerToast) onTriggerToast(`Loaded scenario: ${scen.scenarioName}`);
  };

  return (
    <div className="space-y-6">
      {/* Lead Search & Auto-Sync Bar */}
      <LeadScenarioSearch
        leads={leads}
        selectedLead={selectedLead}
        onSelectLead={handleSelectLead}
        toolName="Loan Officer Scenario & Payment Workbench"
      />

      {/* Quick Lead Selector Chips */}
      {leads.length > 0 && (
        <div className="bg-white p-3.5 rounded-2xl border border-[#EAE7E0] shadow-2xs flex items-center gap-2.5 overflow-x-auto">
          <span className="text-[11px] font-bold text-[#606C5D] uppercase tracking-wider shrink-0 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-[#4A5D4E]" />
            Pipeline Leads:
          </span>
          <div className="flex items-center gap-1.5 min-w-0">
            {leads.slice(0, 8).map(lead => {
              const isSelected = selectedLead?.id === lead.id;
              const hasScenarios = (lead.savedScenarios?.length || 0) > 0;
              return (
                <button
                  key={lead.id}
                  onClick={() => handleSelectLead(lead)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-[#4A5D4E] text-white shadow-xs"
                      : "bg-[#FAF9F5] text-[#2D362E] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
                  }`}
                >
                  <span className="truncate max-w-[120px]">{lead.fullName}</span>
                  {hasScenarios && (
                    <span className={`text-[10px] px-1 py-0.2 rounded-full font-bold ${
                      isSelected ? "bg-white/20 text-white" : "bg-[#C18C5D]/15 text-[#C18C5D]"
                    }`}>
                      {lead.savedScenarios!.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Success Notification Banner */}
      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950 animate-fadeIn shadow-2xs">
          <div className="flex items-center gap-2.5 font-bold">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Check className="w-4 h-4" />
            </div>
            <span>{saveSuccessMsg}</span>
          </div>
          {activeOutreachScenario && (
            <button
              onClick={() => setActiveOutreachScenario(activeOutreachScenario)}
              className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 self-start sm:self-center transition-all cursor-pointer"
            >
              View Ready-Made Drafts →
            </button>
          )}
        </div>
      )}

      {/* Workbench Header & Engine Navigation */}
      <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1EFE9] text-[#4A5D4E] text-xs font-semibold border border-[#EAE7E0]">
              <Sparkles className="w-3.5 h-3.5 text-[#C18C5D]" />
              <span>Secured Loan Officer Scenario & Outreach Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D362E]">
              Client Payment & Affordability Workbench
            </h2>
            <p className="text-xs sm:text-sm text-[#606C5D] max-w-2xl">
              Model 2-1 rate buydowns, PITI payments, and DTI thresholds for any borrower in your CRM. Automatically persists calculations and generates ready-made multi-channel outreach drafts.
            </p>
          </div>

          {/* Save Scenario to Lead Button & Export */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => window.print()}
              className="px-5 py-3 bg-[#2D362E] hover:bg-[#1E241F] text-white font-bold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              title="Print to PDF"
            >
              <Printer className="w-4 h-4 text-[#E7C19D]" />
              <span>Export PDF</span>
            </button>
            <button
              type="button"
              onClick={() => handleSaveScenario()}
              disabled={!selectedLead}
              className={`px-5 py-3 rounded-2xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                selectedLead
                  ? "bg-[#4A5D4E] hover:bg-[#38463B] text-white hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              title={selectedLead ? `Save scenario to ${selectedLead.fullName}` : "Select a lead first"}
            >
              <BookmarkPlus className="w-4 h-4 text-[#D4A373]" />
              <span>
                {selectedLead ? `Save Scenario to ${(selectedLead.fullName || "Client").split(" ")[0]}` : "Select Lead to Save"}
              </span>
            </button>
          </div>
        </div>

        {/* Engine Mode Tabs */}
        <div className="flex items-center gap-2 border-b border-[#EAE7E0] pb-3">
          <button
            onClick={() => setActiveEngine("buydown_payment")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeEngine === "buydown_payment"
                ? "bg-[#2D362E] text-white shadow-xs"
                : "bg-[#FAF9F5] text-[#606C5D] hover:text-[#2D362E] border border-[#EAE7E0]"
            }`}
          >
            <TrendingUp className="w-4 h-4 text-[#D4A373]" />
            <span>1. Quick Payment & 2-1 Buydown Engine</span>
          </button>

          <button
            onClick={() => setActiveEngine("affordability_dti")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeEngine === "affordability_dti"
                ? "bg-[#2D362E] text-white shadow-xs"
                : "bg-[#FAF9F5] text-[#606C5D] hover:text-[#2D362E] border border-[#EAE7E0]"
            }`}
          >
            <Calculator className="w-4 h-4 text-[#4A5D4E]" />
            <span>2. How Much House Can I Afford & DTI Engine</span>
          </button>
        </div>

        {/* Live Real-Time DTI Underwriting Risk Meter */}
        <DTIUnderwritingMeter
          frontEndDTI={breakdown.frontEndDTI}
          backEndDTI={breakdown.backEndDTI}
          grossMonthlyIncome={Math.max(1, profile.annualIncome / 12)}
          totalHousingPayment={breakdown.totalMonthly}
          monthlyDebts={profile.monthlyDebt}
          isLoanOfficerMode={true}
          showCalculations={true}
        />
      </div>

      {/* ONE-CLICK PRE-FILLED OUTREACH ACTION BAR (DIRECT QUICK ACTIONS) */}
      {selectedLead && liveDrafts && (
        <div className="bg-gradient-to-r from-[#2D362E] to-[#38463B] text-white rounded-3xl p-5 sm:p-6 shadow-md border border-[#4A5D4E]/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#4A5D4E] flex items-center justify-center font-bold text-white border border-white/20 shrink-0">
                <Sparkles className="w-4 h-4 text-[#D4A373]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">
                    One-Click Outreach Drafts for {selectedLead.fullName}
                  </h4>
                  <span className="text-[10px] bg-[#C18C5D] text-white font-bold px-2 py-0.5 rounded-full">
                    Live Synced
                  </span>
                </div>
                <p className="text-xs text-white/75">
                  Calculated numbers ({formatUSD(profile.targetPrice)} @ {formatUSD(breakdown.totalMonthly)}/mo) are instantly pre-formatted into complete ready-to-send communications.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                const draftScen = buildSavedScenario({
                  lead: selectedLead,
                  profile,
                  breakdown,
                  loanProgram: activeEngine === "buydown_payment" ? "2-1 Temporary Rate Buydown" : "30-Year Fixed Conventional",
                  sourceTool: activeEngine === "buydown_payment" ? "mortgagelab" : "calculator",
                  loanOfficer,
                  agent: assignedAgent
                });
                setActiveOutreachScenario(draftScen);
              }}
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 flex items-center gap-1.5 transition-all self-start sm:self-center cursor-pointer"
            >
              <span>Full Outreach Suite Modal</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#D4A373]" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* 1. Draft Lead Email Card */}
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/15 space-y-2.5 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#D4A373]" />
                    <span>1. Draft Lead Email</span>
                  </span>
                  <span className="text-[10px] text-white/60 font-mono">Borrower</span>
                </div>
                <p className="text-[11px] text-white/80 line-clamp-2 leading-relaxed">
                  {liveDrafts.draftBorrowerEmailSubject}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    launchLocalOutlookDraft({
                      to: selectedLead.email,
                      subject: liveDrafts.draftBorrowerEmailSubject,
                      body: liveDrafts.draftBorrowerEmailBody,
                      loanOfficer,
                      lead: selectedLead,
                      agent: assignedAgent,
                      templateName: "Scenario Lead Outreach",
                      onTriggerToast
                    });
                  }}
                  className="flex-1 py-1.5 bg-[#0078D4] hover:bg-[#005A9E] text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Draft in local installed Outlook with your work email signature"
                >
                  <Mail className="w-3 h-3 text-white" />
                  <span>Draft in Outlook</span>
                </button>
                {onOpenEmailOutreach && (
                  <button
                    type="button"
                    onClick={() => onOpenEmailOutreach(selectedLead.id, liveDrafts.draftBorrowerEmailSubject, liveDrafts.draftBorrowerEmailBody)}
                    title="Open Email Template Builder"
                    className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-300" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleCopy(liveDrafts.draftBorrowerEmailBody, "borrower-email")}
                  title="Copy email body to clipboard"
                  className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors"
                >
                  {copiedKey === "borrower-email" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* 2. Draft Lead SMS Card */}
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/15 space-y-2.5 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>2. Draft Lead SMS</span>
                  </span>
                  <span className="text-[10px] text-white/60 font-mono">Ready-to-Text</span>
                </div>
                <p className="text-[11px] text-white/80 line-clamp-2 leading-relaxed">
                  "{liveDrafts.draftBorrowerSmsText}"
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenSmsMessaging) {
                      onOpenSmsMessaging(selectedLead, liveDrafts.draftBorrowerSmsText);
                    } else {
                      handleCopy(liveDrafts.draftBorrowerSmsText, "borrower-sms");
                    }
                  }}
                  className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <MessageSquare className="w-3 h-3 text-white" />
                  <span>Launch SMS Hub</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(liveDrafts.draftBorrowerSmsText, "borrower-sms")}
                  title="Copy SMS text to clipboard"
                  className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors"
                >
                  {copiedKey === "borrower-sms" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* 3. Send to Realtor Partner Card */}
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/15 space-y-2.5 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>3. Send to Realtor Partner</span>
                  </span>
                  <span className="text-[10px] text-white/60 font-mono">
                    {assignedAgent?.name || selectedLead.assignedAgent || "Buyer Agent"}
                  </span>
                </div>
                <p className="text-[11px] text-white/80 line-clamp-2 leading-relaxed">
                  {liveDrafts.draftRealtorEmailSubject}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    const agentEmail = assignedAgent?.email || "sarah.jenkins@cascadevalleyre.com";
                    launchLocalOutlookDraft({
                      to: agentEmail,
                      subject: liveDrafts.draftRealtorEmailSubject,
                      body: liveDrafts.draftRealtorEmailBody,
                      loanOfficer,
                      lead: selectedLead,
                      agent: assignedAgent,
                      templateName: "Realtor Scenario Update",
                      onTriggerToast
                    });
                  }}
                  className="flex-1 py-1.5 bg-[#0078D4] hover:bg-[#005A9E] text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Draft in local installed Outlook with your work email signature"
                >
                  <Mail className="w-3 h-3 text-white" />
                  <span>Draft in Outlook</span>
                </button>
                {onOpenEmailOutreach && (
                  <button
                    type="button"
                    onClick={() => onOpenEmailOutreach(selectedLead.id, liveDrafts.draftRealtorEmailSubject, liveDrafts.draftRealtorEmailBody)}
                    title="Open Email Template Builder"
                    className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-300" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleCopy(liveDrafts.draftRealtorEmailBody, "realtor-email")}
                  title="Copy realtor update to clipboard"
                  className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors"
                >
                  {copiedKey === "realtor-email" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENDER ACTIVE SCENARIO CALCULATION ENGINE */}
      <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-8 shadow-sm">
        {activeEngine === "buydown_payment" ? (
          <MortgageLab
            profile={profile}
            leads={leads}
            onUpdateLead={onUpdateLead}
            loanOfficer={loanOfficer}
            activeAgent={assignedAgent}
            onOpenEmailOutreach={onOpenEmailOutreach}
            onOpenSmsOutreach={(leadId, text) => {
              if (selectedLead && onOpenSmsMessaging) {
                onOpenSmsMessaging(selectedLead, text);
              }
            }}
            isLoanOfficerMode={true}
          />
        ) : (
          <InstantAffordabilityCalculator
            profile={profile}
            setProfile={setProfile}
            leads={leads}
            onUpdateLead={onUpdateLead}
            loanOfficer={loanOfficer}
            activeAgent={assignedAgent}
            onOpenEmailOutreach={onOpenEmailOutreach}
            onOpenSmsOutreach={(leadId, text) => {
              if (selectedLead && onOpenSmsMessaging) {
                onOpenSmsMessaging(selectedLead, text);
              }
            }}
            isLoanOfficerMode={true}
          />
        )}
      </div>

      {/* SAVED SCENARIOS TIMELINE FOR SELECTED LEAD */}
      {selectedLead && (
        <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#4A5D4E]" />
              <h3 className="font-serif font-bold text-lg text-[#2D362E]">
                Saved Scenarios History for {selectedLead.fullName} ({selectedLead.savedScenarios?.length || 0})
              </h3>
            </div>
            {selectedLead.savedScenarios && selectedLead.savedScenarios.length > 0 && (
              <span className="text-xs text-[#606C5D]">
                Persisted in Lead Record & Synchronized Across CRM
              </span>
            )}
          </div>

          {selectedLead.savedScenarios && selectedLead.savedScenarios.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedLead.savedScenarios.map((scen) => (
                <div 
                  key={scen.id}
                  className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-4.5 space-y-3 hover:border-[#4A5D4E]/40 transition-all shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono text-[#9A9488] block">
                        Saved: {new Date(scen.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <h4 className="font-bold text-sm text-[#2D362E] mt-0.5">
                        {scen.scenarioName}
                      </h4>
                    </div>
                    <button
                      onClick={() => handleDeleteScenario(scen.id)}
                      title="Delete this scenario"
                      className="p-1 text-[#9A9488] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-white p-2.5 rounded-xl border border-[#EAE7E0] text-center text-xs">
                    <div>
                      <span className="text-[10px] text-[#9A9488] block uppercase">Target Price</span>
                      <strong className="text-[#2D362E]">{formatUSD(scen.targetPrice)}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#9A9488] block uppercase">Monthly PITI</span>
                      <strong className="text-[#4A5D4E]">{formatUSD(scen.totalMonthlyPayment)}/mo</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#9A9488] block uppercase">Down Payment</span>
                      <strong className="text-[#2D362E]">{formatUSD(scen.downPayment)} ({scen.downPaymentPercent}%)</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => handleLoadScenario(scen)}
                      className="px-3 py-1.5 bg-[#F1EFE9] hover:bg-[#EAE7E0] text-[#2D362E] font-bold text-xs rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Load into Sliders</span>
                      <ArrowRight className="w-3 h-3 text-[#4A5D4E]" />
                    </button>

                    <button
                      onClick={() => setActiveOutreachScenario(scen)}
                      className="px-3.5 py-1.5 bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-[#D4A373]" />
                      <span>View & Send Drafts</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#FAF9F5] rounded-2xl border border-dashed border-[#DEDAD2] p-8 text-center space-y-2">
              <BookmarkPlus className="w-8 h-8 text-[#9A9488] mx-auto opacity-70" />
              <div className="text-xs font-bold text-[#2D362E]">No Saved Scenarios for {selectedLead?.fullName || "Client"} Yet</div>
              <p className="text-[11px] text-[#606C5D] max-w-md mx-auto">
                Adjust the sliders above to model a mortgage payment or 2-1 buydown, then click &quot;Save Scenario to {(selectedLead?.fullName || "Client").split(" ")[0]}&quot; to persist calculations and generate ready-made outreach drafts.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Outreach Suite Modal */}
      {selectedLead && activeOutreachScenario && (
        <ScenarioOutreachModal
          isOpen={!!activeOutreachScenario}
          onClose={() => setActiveOutreachScenario(null)}
          lead={selectedLead}
          scenario={activeOutreachScenario}
          loanOfficer={loanOfficer}
          agent={assignedAgent}
          onOpenEmailOutreach={onOpenEmailOutreach}
          onOpenSmsOutreach={(leadId, text) => {
            if (selectedLead && onOpenSmsMessaging) {
              onOpenSmsMessaging(selectedLead, text);
            }
          }}
        />
      )}
    </div>
  );
};
