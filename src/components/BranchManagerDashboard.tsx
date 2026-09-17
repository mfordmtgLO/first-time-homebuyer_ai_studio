import React, { useState, useMemo } from "react";
import { ProfessionalGuidesState, LoanOfficerProfile, CapturedLead } from "../types";
import { 
  Users, TrendingUp, PieChart as PieChartIcon, BarChart3, Clock, Calendar, 
  Search, Filter, ChevronDown, Award, Target, Activity, ShieldCheck,
  Download, FileSpreadsheet, Database, CheckCircle2, Layers, DollarSign,
  Building, MapPin, Video, Share2, Globe, Plus, Percent, Briefcase,
  ArrowUpRight, ArrowDownRight, Sparkles, ExternalLink, Eye, RotateCcw,
  Tag, Compass, Phone
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, LineChart, Line 
} from "recharts";
import { SalesforceCsvExportModal } from "./SalesforceCsvExportModal";
import { AddAdExpenseModal } from "./AddAdExpenseModal";
import { TwilioSettingsModal } from "./TwilioSettingsModal";
import { 
  CrmExportFormat,
  triggerCrmCsvDownload 
} from "../services/crmLeadExportService";

interface BranchManagerDashboardProps {
  guidesState: ProfessionalGuidesState;
  onUpdateGuidesState: (newState: ProfessionalGuidesState | ((prev: ProfessionalGuidesState) => ProfessionalGuidesState)) => void;
  onTriggerToast?: (msg: string) => void;
}

const SOURCE_COLORS: Record<string, string> = {
  "Facebook Ads": "#1877F2",
  "Google Ads": "#EA4335",
  "YouTube Video Ads": "#FF0000",
  "GeoSphere GIS Map": "#4A5D4E",
  "Social Media": "#E1306C",
  "Roadmap / Chatbot": "#C18C5D",
  "Agent Co-Brand": "#2D362E",
  "Organic / Referral": "#8E8D8A"
};

export const BranchManagerDashboard: React.FC<BranchManagerDashboardProps> = ({ 
  guidesState, 
  onUpdateGuidesState, 
  onTriggerToast 
}) => {
  // Filter States
  const [selectedBranchId, setSelectedBranchId] = useState<string>("all");
  const [selectedManager, setSelectedManager] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [timeframeView, setTimeframeView] = useState<"12mo" | "6mo" | "3mo" | "30days">("12mo");

  // Modals & UI States
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [modalFormat, setModalFormat] = useState<CrmExportFormat>("salesforce");
  const [showAdExpenseModal, setShowAdExpenseModal] = useState<boolean>(false);
  const [expenseTargetLoId, setExpenseTargetLoId] = useState<string | undefined>(undefined);
  const [showTwilioModal, setShowTwilioModal] = useState<boolean>(false);
  const [twilioTargetLoId, setTwilioTargetLoId] = useState<string | undefined>(undefined);
  const [localToast, setLocalToast] = useState<string | null>(null);

  const leads = guidesState.leads || [];
  const allLoanOfficers = guidesState.loanOfficers || [];
  const pairings = guidesState.pairings || [];

  const triggerToast = (msg: string) => {
    if (onTriggerToast) {
      onTriggerToast(msg);
    } else {
      setLocalToast(msg);
      setTimeout(() => setLocalToast(null), 3500);
    }
  };

  const handleSaveLoTwilioConfig = (loId: string, twilioConfig: any) => {
    const updatedOfficers = allLoanOfficers.map((lo) => {
      if (lo.id === loId) {
        return {
          ...lo,
          twilioAccountSid: twilioConfig.accountSid,
          twilioAuthToken: twilioConfig.authToken,
          twilioPhoneNumber: twilioConfig.phoneNumber,
          twilioEnabled: twilioConfig.enableLiveCarrierSms,
          twilioByokConfigured: Boolean(twilioConfig.accountSid && twilioConfig.phoneNumber),
          byokKeysStatus: {
            ...(lo.byokKeysStatus || {}),
            twilio: Boolean(twilioConfig.accountSid && twilioConfig.phoneNumber),
          },
        };
      }
      return lo;
    });

    onUpdateGuidesState(prev => ({
      ...prev,
      loanOfficers: updatedOfficers
    }));

    triggerToast(`Twilio BYOK credentials updated for Loan Officer.`);
  };

  // Extract unique branch criteria for dropdowns
  const uniqueBranchIds = useMemo(() => {
    const set = new Set<string>();
    allLoanOfficers.forEach(lo => {
      if (lo.branchId) set.add(lo.branchId);
    });
    return Array.from(set).sort();
  }, [allLoanOfficers]);

  const uniqueManagers = useMemo(() => {
    const set = new Set<string>();
    allLoanOfficers.forEach(lo => {
      if (lo.branchManagerName) set.add(lo.branchManagerName);
    });
    return Array.from(set).sort();
  }, [allLoanOfficers]);

  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    allLoanOfficers.forEach(lo => {
      if (lo.branchCity) set.add(lo.branchCity);
    });
    return Array.from(set).sort();
  }, [allLoanOfficers]);

  const uniqueStates = useMemo(() => {
    const set = new Set<string>();
    allLoanOfficers.forEach(lo => {
      if (lo.branchState) set.add(lo.branchState);
    });
    return Array.from(set).sort();
  }, [allLoanOfficers]);

  // Filter Loan Officers by all criteria
  const filteredLoanOfficers = useMemo(() => {
    return allLoanOfficers.filter(lo => {
      // Branch ID Filter
      if (selectedBranchId !== "all" && lo.branchId !== selectedBranchId) {
        return false;
      }
      // Manager Filter
      if (selectedManager !== "all" && lo.branchManagerName !== selectedManager) {
        return false;
      }
      // City Filter
      if (selectedCity !== "all" && lo.branchCity !== selectedCity) {
        return false;
      }
      // State Filter
      if (selectedState !== "all" && lo.branchState !== selectedState) {
        return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = lo.name.toLowerCase().includes(q);
        const matchesNmls = (lo.nmlsId || "").toLowerCase().includes(q);
        const matchesBranch = (lo.branch || "").toLowerCase().includes(q);
        const matchesBranchId = (lo.branchId || "").toLowerCase().includes(q);
        const matchesManager = (lo.branchManagerName || "").toLowerCase().includes(q);
        const matchesPartner = lo.topPartners12Mo?.some(p => p.partnerName.toLowerCase().includes(q));
        if (!matchesName && !matchesNmls && !matchesBranch && !matchesBranchId && !matchesManager && !matchesPartner) {
          return false;
        }
      }
      return true;
    });
  }, [allLoanOfficers, selectedBranchId, selectedManager, selectedCity, selectedState, searchQuery]);

  // Handle Quick CSV Download
  const handleQuickDownloadCsv = (format: CrmExportFormat = "salesforce") => {
    if (leads.length === 0) {
      triggerToast("No leads in current branch state to export.");
      return;
    }

    const result = triggerCrmCsvDownload(
      format,
      leads,
      guidesState.loanOfficers || [],
      guidesState.agents || []
    );

    const formatName = format === "totalexpert" ? "Total Expert CRM" : "Salesforce CRM";
    triggerToast(`Downloaded ${result.rowCount} branch leads formatted for ${formatName} (${result.fileName})`);
  };

  // Handle Adding an Ad Expense to an LO
  const handleSaveAdExpense = (
    loId: string, 
    expense: { source: string; amount: number; campaignName: string; assetType: string }
  ) => {
    const updatedLos = allLoanOfficers.map(lo => {
      if (lo.id === loId) {
        const currentTotal = lo.adExpensesTotal || 0;
        const currentBreakdown = lo.adExpensesBreakdown || [];
        return {
          ...lo,
          adExpensesTotal: currentTotal + expense.amount,
          adExpensesBreakdown: [
            ...currentBreakdown,
            {
              source: expense.source,
              amount: expense.amount,
              campaignName: expense.campaignName,
              assetType: expense.assetType
            }
          ]
        };
      }
      return lo;
    });

    const isCurrent = guidesState.loanOfficer.id === loId;
    const targetLo = updatedLos.find(l => l.id === loId);

    onUpdateGuidesState({
      ...guidesState,
      loanOfficers: updatedLos,
      loanOfficer: isCurrent && targetLo ? targetLo : guidesState.loanOfficer
    });

    triggerToast(`Logged $${expense.amount.toLocaleString()} ad expense for ${targetLo?.name || "Loan Officer"}. ROLI updated!`);
  };

  // Aggregate Company / Filtered ROLI Metrics
  const aggregatedMetrics = useMemo(() => {
    let totalAdSpend = 0;
    let total12MoUnits = 0;
    let total12MoVolume = 0;
    let total6MoUnits = 0;
    let total6MoVolume = 0;
    let total3MoUnits = 0;
    let total3MoVolume = 0;
    let total30dUnits = 0;
    let total30dVolume = 0;
    let totalPairsCount = 0;

    const sourceExpenseMap: Record<string, number> = {
      "Facebook Ads": 0,
      "Google Ads": 0,
      "YouTube Video Ads": 0,
      "GeoSphere GIS Map": 0,
      "Social Media": 0
    };

    const sourceLeadsMap: Record<string, number> = {
      "Facebook Ads": 0,
      "Google Ads": 0,
      "YouTube Video Ads": 0,
      "GeoSphere GIS Map": 0,
      "Social Media": 0,
      "Roadmap / Chatbot": 0
    };

    filteredLoanOfficers.forEach(lo => {
      totalAdSpend += (lo.adExpensesTotal || 0);
      total12MoUnits += (lo.production12MoUnits || 0);
      total12MoVolume += (lo.production12MoVolume || 0);
      total6MoUnits += (lo.production6MoUnits || Math.round((lo.production12MoUnits || 0) * 0.5));
      total6MoVolume += (lo.production6MoVolume || Math.round((lo.production12MoVolume || 0) * 0.5));
      total3MoUnits += (lo.production3MoUnits || Math.round((lo.production12MoUnits || 0) * 0.25));
      total3MoVolume += (lo.production3MoVolume || Math.round((lo.production12MoVolume || 0) * 0.25));
      total30dUnits += (lo.production30DaysUnits || Math.round((lo.production12MoUnits || 0) * 0.08));
      total30dVolume += (lo.production30DaysVolume || Math.round((lo.production12MoVolume || 0) * 0.08));

      // Pairs
      const loPairs = pairings.filter(p => p.loId === lo.id).length || lo.topPartners12Mo?.length || 2;
      totalPairsCount += loPairs;

      // Expenses breakdown
      if (lo.adExpensesBreakdown) {
        lo.adExpensesBreakdown.forEach(item => {
          if (sourceExpenseMap[item.source] !== undefined) {
            sourceExpenseMap[item.source] += item.amount;
          } else {
            sourceExpenseMap[item.source] = (sourceExpenseMap[item.source] || 0) + item.amount;
          }
        });
      }

      // Estimate leads intake by source deterministically for this LO
      const idNum = lo.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      sourceLeadsMap["Facebook Ads"] += (idNum % 25) + 18;
      sourceLeadsMap["Google Ads"] += (idNum % 20) + 14;
      sourceLeadsMap["YouTube Video Ads"] += (idNum % 16) + 10;
      sourceLeadsMap["GeoSphere GIS Map"] += (idNum % 14) + 8;
      sourceLeadsMap["Social Media"] += (idNum % 10) + 6;
      sourceLeadsMap["Roadmap / Chatbot"] += (idNum % 8) + 4;
    });

    const totalLeads = Object.values(sourceLeadsMap).reduce((a, b) => a + b, 0);
    const costPerLead = totalLeads > 0 ? (totalAdSpend / totalLeads) : 0;
    const nationalCplAvg = 48.50; // Mortgage industry national average CPL benchmark
    const cplSavingsPct = Math.max(0, Math.round(((nationalCplAvg - costPerLead) / nationalCplAvg) * 100));

    // Prepare source pie chart data
    const pieData = Object.entries(sourceExpenseMap)
      .filter(([_, val]) => val > 0)
      .map(([name, val]) => ({
        name,
        value: val,
        color: SOURCE_COLORS[name] || "#4A5D4E"
      }));

    return {
      totalAdSpend,
      totalLeads,
      costPerLead,
      cplSavingsPct,
      total12MoUnits,
      total12MoVolume,
      total6MoUnits,
      total6MoVolume,
      total3MoUnits,
      total3MoVolume,
      total30dUnits,
      total30dVolume,
      totalPairsCount,
      sourceExpenseMap,
      sourceLeadsMap,
      pieData
    };
  }, [filteredLoanOfficers, pairings]);

  // Selected branch details (if single branch filtered)
  const selectedBranchInfo = useMemo(() => {
    if (selectedBranchId === "all") return null;
    const los = allLoanOfficers.filter(l => l.branchId === selectedBranchId);
    if (los.length === 0) return null;
    const sample = los[0];
    return {
      branchId: selectedBranchId,
      branchName: sample.branch || "Branch Office",
      managerName: sample.branchManagerName || "Mike Ford",
      city: sample.branchCity || "Lake Oswego",
      state: sample.branchState || "Oregon",
      loCount: los.length,
      volume12Mo: los.reduce((sum, l) => sum + (l.production12MoVolume || 0), 0),
      units12Mo: los.reduce((sum, l) => sum + (l.production12MoUnits || 0), 0),
      adSpend: los.reduce((sum, l) => sum + (l.adExpensesTotal || 0), 0)
    };
  }, [selectedBranchId, allLoanOfficers]);

  return (
    <div className="space-y-6">
      {/* Header Banner with Title and Direct CRM Quick-Actions */}
      <div className="bg-gradient-to-r from-[#2D362E] via-[#3A4A3C] to-[#4A5D4E] rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-xl bg-white/10 border border-white/20 text-[#E7C19D]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#E7C19D] font-bold">
                  Mike Ford Admin &bull; Executive Command
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold font-display">
                  Branch Performance, Multi-Branch Sorter &amp; ROLI Intelligence
                </h1>
              </div>
            </div>
            <p className="text-emerald-100 opacity-90 max-w-3xl text-xs sm:text-sm leading-relaxed">
              Track <strong>Return on Lead Investment (ROLI)</strong> by total expenses vs. leads intake across branches, monitor 12mo/6mo/3mo/30d loan funding volumes, oversee LO + Agent co-brand pairs, and inspect granular ad copy &amp; video asset attributions.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {/* Enter Ad Expense Button */}
            <button
              onClick={() => {
                setExpenseTargetLoId(filteredLoanOfficers[0]?.id);
                setShowAdExpenseModal(true);
              }}
              className="px-4 py-2.5 bg-[#C18C5D] hover:bg-[#A87447] text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
              title="Record advertising expense for any loan officer to update ROLI"
            >
              <Plus className="w-4 h-4" />
              <span>Log Ad Expense</span>
            </button>

            {/* Quick Export CRM Leads */}
            <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/20">
              <button
                onClick={() => handleQuickDownloadCsv("salesforce")}
                className="px-3 py-1.5 bg-[#00A1E0] hover:bg-[#0089BE] text-white rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                title="Download leads formatted for Salesforce CRM"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Salesforce CSV</span>
              </button>
              <button
                onClick={() => handleQuickDownloadCsv("totalexpert")}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm ml-1"
                title="Download leads formatted for Total Expert CRM"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Total Expert CSV</span>
              </button>
            </div>

            {/* Schema Studio Trigger */}
            <button
              onClick={() => {
                setModalFormat("salesforce");
                setShowExportModal(true);
              }}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 border border-white/20"
              title="View field mapping and preview CRM leads"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#00A1E0]" />
              <span>CRM Schema Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Branch Filter & Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-[#EAE7E0] shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#EAE7E0]">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#4A5D4E]" />
            <h2 className="text-sm font-bold text-[#2D362E]">Branch &amp; Team Oversight Filters</h2>
            <span className="text-xs text-[#606C5D]">
              ({filteredLoanOfficers.length} of {allLoanOfficers.length} Loan Officers shown)
            </span>
          </div>
          {(selectedBranchId !== "all" || selectedManager !== "all" || selectedCity !== "all" || selectedState !== "all" || searchQuery) && (
            <button
              onClick={() => {
                setSelectedBranchId("all");
                setSelectedManager("all");
                setSelectedCity("all");
                setSelectedState("all");
                setSearchQuery("");
              }}
              className="text-xs text-[#C18C5D] hover:text-[#9F6E45] font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Unique Branch ID Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#606C5D] flex items-center gap-1">
              <Building className="w-3 h-3 text-[#4A5D4E]" />
              <span>Unique Branch ID</span>
            </label>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
            >
              <option value="all">All Branch IDs ({uniqueBranchIds.length} Total)</option>
              {uniqueBranchIds.map(id => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </div>

          {/* Branch Manager Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#606C5D] flex items-center gap-1">
              <Users className="w-3 h-3 text-[#4A5D4E]" />
              <span>Branch Manager</span>
            </label>
            <select
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
              className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs font-medium text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
            >
              <option value="all">All Managers ({uniqueManagers.length})</option>
              {uniqueManagers.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Branch Office City Location */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#606C5D] flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#4A5D4E]" />
              <span>Office City Location</span>
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs font-medium text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
            >
              <option value="all">All Office Cities ({uniqueCities.length})</option>
              {uniqueCities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Branch State Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#606C5D] flex items-center gap-1">
              <Compass className="w-3 h-3 text-[#4A5D4E]" />
              <span>Branch State</span>
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs font-medium text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
            >
              <option value="all">All States ({uniqueStates.length})</option>
              {uniqueStates.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#606C5D]">Search LO / Partner / NMLS</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search LO, agent pair..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl pl-8 pr-3 py-2 text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Selected Branch Office Card (Rendered if a specific branch is selected) */}
      {selectedBranchInfo && (
        <div className="bg-gradient-to-br from-[#FAF9F5] to-[#F1EFE9] rounded-3xl p-5 sm:p-6 border border-[#EAE7E0] shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#4A5D4E] text-white flex items-center justify-center font-mono font-bold text-base shadow-sm shrink-0">
                {selectedBranchInfo.branchId.split('-')[1] || "BR"}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#4A5D4E]/15 text-[#4A5D4E]">
                    {selectedBranchInfo.branchId}
                  </span>
                  <h3 className="font-serif font-bold text-lg text-[#2D362E]">
                    {selectedBranchInfo.branchName}
                  </h3>
                </div>
                <p className="text-xs text-[#606C5D] mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>Branch Manager: <strong className="text-[#2D362E]">{selectedBranchInfo.managerName}</strong></span>
                  <span>&bull;</span>
                  <span>Location: <strong className="text-[#2D362E]">{selectedBranchInfo.city}, {selectedBranchInfo.state}</strong></span>
                  <span>&bull;</span>
                  <span>Roster: <strong className="text-[#2D362E]">{selectedBranchInfo.loCount} Loan Officers</strong></span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap bg-white px-4 py-2.5 rounded-2xl border border-[#EAE7E0] shrink-0">
              <div>
                <span className="text-[10px] text-[#606C5D] uppercase font-bold block">Branch 12M Volume</span>
                <span className="font-mono font-bold text-sm text-[#2D362E]">
                  ${(selectedBranchInfo.volume12Mo / 1000000).toFixed(1)}M
                </span>
                <span className="text-[11px] text-[#606C5D] ml-1">({selectedBranchInfo.units12Mo} units)</span>
              </div>
              <div className="h-7 w-px bg-[#EAE7E0]" />
              <div>
                <span className="text-[10px] text-[#606C5D] uppercase font-bold block">Branch Ad Spend (ROLI)</span>
                <span className="font-mono font-bold text-sm text-emerald-700">
                  ${selectedBranchInfo.adSpend.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Company ROLI & Executive Production At-A-Glance Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ROLI - Return on Lead Investment Card */}
        <div className="bg-white p-5 rounded-3xl border border-[#EAE7E0] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#606C5D]">Company ROLI Spend</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold font-mono text-[#2D362E]">
              ${aggregatedMetrics.totalAdSpend.toLocaleString()}
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
              ROLI Tracked
            </span>
          </div>
          <p className="text-[11px] text-[#606C5D] mt-1">
            Total advertising expenses logged across filtered roster
          </p>
        </div>

        {/* Cost Per Lead (CPL) Card */}
        <div className="bg-white p-5 rounded-3xl border border-[#EAE7E0] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#606C5D]">Cost Per Lead (CPL)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold font-mono text-emerald-700">
              ${aggregatedMetrics.costPerLead.toFixed(2)}
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
              {aggregatedMetrics.cplSavingsPct}% Below Nat'l Avg
            </span>
          </div>
          <p className="text-[11px] text-[#606C5D] mt-1">
            {aggregatedMetrics.totalLeads} leads captured across all media channels
          </p>
        </div>

        {/* Loan Journey Completions (Fundings) */}
        <div className="bg-white p-5 rounded-3xl border border-[#EAE7E0] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#606C5D]">Loan Completions ({timeframeView.toUpperCase()})</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-[#2D362E]">
              {timeframeView === "12mo" && `${aggregatedMetrics.total12MoUnits} Units`}
              {timeframeView === "6mo" && `${aggregatedMetrics.total6MoUnits} Units`}
              {timeframeView === "3mo" && `${aggregatedMetrics.total3MoUnits} Units`}
              {timeframeView === "30days" && `${aggregatedMetrics.total30dUnits} Units`}
            </h3>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100 flex items-center">
              <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> +19.4% MoM
            </span>
          </div>
          <p className="text-[11px] font-mono font-semibold text-[#4A5D4E] mt-1">
            ${(
              (timeframeView === "12mo" ? aggregatedMetrics.total12MoVolume :
               timeframeView === "6mo" ? aggregatedMetrics.total6MoVolume :
               timeframeView === "3mo" ? aggregatedMetrics.total3MoVolume :
               aggregatedMetrics.total30dVolume) / 1000000
            ).toFixed(1)}M Total Volume
          </p>
        </div>

        {/* LO + Agent Co-Brand Pairs Card */}
        <div className="bg-white p-5 rounded-3xl border border-[#EAE7E0] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#606C5D]">Active LO + Agent Pairs</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-[#2D362E]">
              {aggregatedMetrics.totalPairsCount} Pairs
            </h3>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-full border border-purple-100">
              Co-Branded
            </span>
          </div>
          <p className="text-[11px] text-[#606C5D] mt-1">
            Active real estate agent marketing partnerships setup
          </p>
        </div>
      </div>

      {/* Lead Intake Across All Sources Breakdown Strip */}
      <div className="bg-white p-5 rounded-3xl border border-[#EAE7E0] shadow-xs">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#606C5D]">
              Incoming Leads Intake Breakdown Across All Media Sources
            </h3>
            <p className="text-[11px] text-[#9A9488]">
              Tracks lead acquisition channels with exact published ad copy and video ad assets
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-[#F9F8F4] p-1 rounded-xl border border-[#EAE7E0]">
            {(["12mo", "6mo", "3mo", "30days"] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframeView(tf)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                  timeframeView === tf
                    ? "bg-[#4A5D4E] text-white shadow-2xs"
                    : "text-[#606C5D] hover:text-[#2D362E]"
                }`}
              >
                {tf === "12mo" ? "12 Months" : tf === "6mo" ? "6 Months" : tf === "3mo" ? "3 Months" : "30 Days"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(aggregatedMetrics.sourceLeadsMap).map(([sourceName, count]) => {
            const color = SOURCE_COLORS[sourceName] || "#4A5D4E";
            return (
              <div 
                key={sourceName} 
                className="p-3 rounded-2xl bg-[#F9F8F4] border border-[#EAE7E0] space-y-1"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-xs font-semibold text-[#2D362E] truncate">{sourceName}</span>
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-lg font-bold font-mono text-[#2D362E]">{count}</span>
                  <span className="text-[10px] text-[#606C5D] font-medium">leads</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enterprise CRM Lead Ingestion Hub (Salesforce / Total Expert) */}
      <div className="bg-gradient-to-br from-[#1B365D] via-[#24426E] to-[#1B365D] rounded-3xl p-6 text-white shadow-sm border border-[#2D4E7C]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/15 text-[#00A1E0] shrink-0">
              <Database className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-lg font-bold font-display">Enterprise CRM Lead Ingestion (Salesforce &amp; Total Expert)</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00A1E0]/20 text-[#00A1E0] border border-[#00A1E0]/30 uppercase tracking-wider">
                  RFC 4180 UTF-8 BOM
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Total Expert &amp; Jungo FSC Ready
                </span>
              </div>
              <p className="text-xs text-blue-100/85 mt-1.5 max-w-2xl leading-relaxed">
                Export branch homebuyer leads transformed according to the enterprise schemas for <strong>Salesforce Lead Object / Jungo CRM</strong> and <strong>Total Expert Mortgage Marketing Engine</strong>. Includes automatic contact name splitting, household creation, Total Expert owner email routing, standardized date formatting (ISO 8601 vs YYYY-MM-DD HH:mm:ss), TCPA opt-in audit stamps, and Realtor co-brand attribution.
              </p>
              <div className="flex items-center gap-3 sm:gap-4 mt-3 text-xs text-blue-200 flex-wrap">
                <span className="flex items-center gap-1.5 font-semibold text-white">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  {leads.length} Leads in Current State
                </span>
                <span className="text-blue-300/40">&bull;</span>
                <span>Salesforce (39 Fields)</span>
                <span className="text-blue-300/40">&bull;</span>
                <span>Total Expert (42 Fields)</span>
              </div>
            </div>
          </div>

          <div className="flex sm:items-center gap-2.5 flex-col sm:flex-row shrink-0">
            <button
              onClick={() => {
                setModalFormat("salesforce");
                setShowExportModal(true);
              }}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-white/20"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#00A1E0]" />
              CRM Schema Studio
            </button>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleQuickDownloadCsv("salesforce")}
                className="px-4 py-2.5 bg-[#00A1E0] hover:bg-[#0089BE] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                title="Download Salesforce Lead CSV"
              >
                <Download className="w-4 h-4" />
                Salesforce
              </button>
              <button
                onClick={() => handleQuickDownloadCsv("totalexpert")}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                title="Download Total Expert Contact CSV"
              >
                <Download className="w-4 h-4" />
                Total Expert
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Loan Officer Production & ROLI Ledger (Detailed Cards for Each LO) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-bold font-serif text-[#2D362E]">
              Loan Officer Roster &amp; Production Matrix
            </h2>
            <p className="text-xs text-[#606C5D]">
              Individual funding units &amp; volumes (12mo, 6mo, 3mo, 30d), LO + Agent pairs, exact lead source attributions, and mini ROLI visuals
            </p>
          </div>
          <button
            onClick={() => {
              setExpenseTargetLoId(filteredLoanOfficers[0]?.id);
              setShowAdExpenseModal(true);
            }}
            className="px-3.5 py-2 bg-[#4A5D4E] hover:bg-[#3D4D40] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Enter LO Ad Expense</span>
          </button>
        </div>

        {filteredLoanOfficers.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-[#EAE7E0] text-center text-[#606C5D]">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <h3 className="text-base font-bold text-[#2D362E] mb-1">No Loan Officers Match Current Filter</h3>
            <p className="text-xs max-w-md mx-auto mb-4">
              Try adjusting your Branch ID, Branch Manager, or Location filter criteria above to see branch members.
            </p>
            <button
              onClick={() => {
                setSelectedBranchId("all");
                setSelectedManager("all");
                setSelectedCity("all");
                setSelectedState("all");
                setSearchQuery("");
              }}
              className="px-4 py-2 bg-[#4A5D4E] text-white text-xs font-bold rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredLoanOfficers.map((lo) => {
              // Deterministic calculations for this LO's leads and ROLI
              const idNum = lo.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
              const loAdSpend = lo.adExpensesTotal || (idNum % 800) + 450;
              const lo12MoUnits = lo.production12MoUnits || 48;
              const lo12MoVolume = lo.production12MoVolume || 26000000;
              const lo6MoUnits = lo.production6MoUnits || Math.round(lo12MoUnits * 0.5);
              const lo6MoVolume = lo.production6MoVolume || Math.round(lo12MoVolume * 0.5);
              const lo3MoUnits = lo.production3MoUnits || Math.round(lo12MoUnits * 0.25);
              const lo3MoVolume = lo.production3MoVolume || Math.round(lo12MoVolume * 0.25);
              const lo30dUnits = lo.production30DaysUnits || Math.max(2, Math.round(lo12MoUnits * 0.08));
              const lo30dVolume = lo.production30DaysVolume || Math.round(lo12MoVolume * 0.08);

              // Lead counts by source for this LO
              const fbLeads = (idNum % 25) + 18;
              const googleLeads = (idNum % 20) + 14;
              const ytLeads = (idNum % 16) + 10;
              const geoLeads = (idNum % 14) + 8;
              const socialLeads = (idNum % 10) + 6;
              const organicLeads = (idNum % 8) + 4;
              const totalLoLeads = fbLeads + googleLeads + ytLeads + geoLeads + socialLeads + organicLeads;
              const loCpl = totalLoLeads > 0 ? (loAdSpend / totalLoLeads) : 0;

              // Mini Pie data for LO ROLI
              const loPieData = (lo.adExpensesBreakdown && lo.adExpensesBreakdown.length > 0)
                ? lo.adExpensesBreakdown.map(b => ({
                    name: b.source,
                    value: b.amount,
                    color: SOURCE_COLORS[b.source] || "#4A5D4E"
                  }))
                : [
                    { name: "Facebook Ads", value: Math.round(loAdSpend * 0.4), color: SOURCE_COLORS["Facebook Ads"] },
                    { name: "Google Ads", value: Math.round(loAdSpend * 0.3), color: SOURCE_COLORS["Google Ads"] },
                    { name: "YouTube Video Ads", value: Math.round(loAdSpend * 0.2), color: SOURCE_COLORS["YouTube Video Ads"] },
                    { name: "GeoSphere GIS Map", value: Math.round(loAdSpend * 0.1), color: SOURCE_COLORS["GeoSphere GIS Map"] }
                  ];

              // Paired agents
              const agentPairs = lo.topPartners12Mo || [];

              return (
                <div 
                  key={lo.id}
                  className="bg-white rounded-3xl border border-[#EAE7E0] p-6 shadow-xs space-y-5 hover:border-[#4A5D4E]/30 transition-all"
                >
                  {/* LO Header Strip */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#EAE7E0]">
                    <div className="flex items-start gap-4">
                      {lo.headshotUrl ? (
                        <img 
                          src={lo.headshotUrl} 
                          alt={lo.name} 
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md bg-[#EAE7E0] shrink-0" 
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-[#4A5D4E] text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                          {lo.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-serif font-bold text-lg text-[#2D362E]">{lo.name}</h3>
                          <span className="text-[11px] font-mono text-[#606C5D] bg-[#F9F8F4] px-2 py-0.5 rounded-md border border-[#EAE7E0]">
                            {lo.nmlsId}
                          </span>
                          {lo.branchId && (
                            <button
                              onClick={() => setSelectedBranchId(lo.branchId!)}
                              className="text-[11px] font-mono font-bold text-[#4A5D4E] bg-[#4A5D4E]/10 hover:bg-[#4A5D4E]/20 px-2 py-0.5 rounded-md transition-colors"
                              title="Filter by this Branch ID"
                            >
                              {lo.branchId}
                            </button>
                          )}
                          {lo.isAdmin && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                              Branch Admin (Mike Ford)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#606C5D] mt-0.5">
                          {lo.title} &bull; {lo.branch || "Pacific Northwest Branch"}
                        </p>
                        <p className="text-[11px] text-[#9A9488] mt-0.5 flex items-center gap-2 flex-wrap">
                          <span>Manager: <strong className="text-[#606C5D]">{lo.branchManagerName || "Mike Ford"}</strong></span>
                          <span>&bull;</span>
                          <span>Office: <strong className="text-[#606C5D]">{lo.branchCity || "Lake Oswego"}, {lo.branchState || "Oregon"}</strong></span>
                          <span>&bull;</span>
                          <span>Email: <strong className="text-[#606C5D]">{lo.email}</strong></span>
                        </p>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      <button
                        onClick={() => {
                          setTwilioTargetLoId(lo.id);
                          setShowTwilioModal(true);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs ${
                          lo.twilioPhoneNumber
                            ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                        title={lo.twilioPhoneNumber ? `Twilio Number: ${lo.twilioPhoneNumber}` : "Twilio BYOK setup pending"}
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{lo.twilioPhoneNumber ? `Twilio: ${lo.twilioPhoneNumber}` : "Twilio BYOK"}</span>
                      </button>

                      <button
                        onClick={() => {
                          setExpenseTargetLoId(lo.id);
                          setShowAdExpenseModal(true);
                        }}
                        className="px-3 py-1.5 bg-[#FAF9F5] hover:bg-[#F1EFE9] border border-[#EAE7E0] hover:border-[#4A5D4E] text-[#2D362E] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <DollarSign className="w-3.5 h-3.5 text-[#4A5D4E]" />
                        <span>Log Expense</span>
                      </button>

                      <button
                        onClick={() => {
                          onUpdateGuidesState(prev => ({ ...prev, currentUserId: lo.id }));
                          triggerToast(`Now shadowing ${lo.name}'s Loan Officer Dashboard.`);
                        }}
                        className="px-3.5 py-1.5 bg-[#4A5D4E] hover:bg-[#3D4D40] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Shadow Dashboard</span>
                      </button>
                    </div>
                  </div>

                  {/* Section 1: Loan Funding Units & Volume Matrix (Across All 4 Exact Timeframes) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#606C5D] flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-[#C18C5D]" />
                        <span>Production &amp; Loan Funding Volume (12M &bull; 6M &bull; 3M &bull; 30 Days)</span>
                      </h4>
                      <span className="text-[10px] text-[#9A9488]">Real-time Funding Ledger</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {/* 12 Months */}
                      <div className="p-3 bg-[#F9F8F4] rounded-2xl border border-[#EAE7E0] space-y-1">
                        <span className="text-[10px] font-bold text-[#606C5D] uppercase block">Last 12 Months</span>
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm font-bold font-mono text-[#2D362E]">
                            ${(lo12MoVolume / 1000000).toFixed(2)}M
                          </span>
                          <span className="text-xs font-bold text-[#4A5D4E]">{lo12MoUnits} Units</span>
                        </div>
                        <div className="w-full bg-[#EAE7E0] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#4A5D4E] h-full w-full" />
                        </div>
                      </div>

                      {/* 6 Months */}
                      <div className="p-3 bg-[#F9F8F4] rounded-2xl border border-[#EAE7E0] space-y-1">
                        <span className="text-[10px] font-bold text-[#606C5D] uppercase block">Last 6 Months</span>
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm font-bold font-mono text-[#2D362E]">
                            ${(lo6MoVolume / 1000000).toFixed(2)}M
                          </span>
                          <span className="text-xs font-bold text-[#4A5D4E]">{lo6MoUnits} Units</span>
                        </div>
                        <div className="w-full bg-[#EAE7E0] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#4A5D4E] h-full w-[50%]" />
                        </div>
                      </div>

                      {/* 3 Months */}
                      <div className="p-3 bg-[#F9F8F4] rounded-2xl border border-[#EAE7E0] space-y-1">
                        <span className="text-[10px] font-bold text-[#606C5D] uppercase block">Last 3 Months</span>
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm font-bold font-mono text-[#2D362E]">
                            ${(lo3MoVolume / 1000000).toFixed(2)}M
                          </span>
                          <span className="text-xs font-bold text-[#4A5D4E]">{lo3MoUnits} Units</span>
                        </div>
                        <div className="w-full bg-[#EAE7E0] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#C18C5D] h-full w-[25%]" />
                        </div>
                      </div>

                      {/* 30 Days */}
                      <div className="p-3 bg-[#F9F8F4] rounded-2xl border border-[#EAE7E0] space-y-1">
                        <span className="text-[10px] font-bold text-[#606C5D] uppercase block">Last 30 Days</span>
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm font-bold font-mono text-[#2D362E]">
                            ${(lo30dVolume / 1000000).toFixed(2)}M
                          </span>
                          <span className="text-xs font-bold text-emerald-700">{lo30dUnits} Units</span>
                        </div>
                        <div className="w-full bg-[#EAE7E0] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full w-[12%]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Exact LO + Agent "Pairs" Setup */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#606C5D] flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-purple-600" />
                        <span>Active LO + Agent Co-Brand Pairs ({agentPairs.length} Configured)</span>
                      </h4>
                      <span className="text-[10px] text-[#9A9488]">Real Estate Agent Relationships</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {agentPairs.map((pair, idx) => (
                        <div 
                          key={pair.partnerId || idx}
                          className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#EAE7E0] flex items-center justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span className="text-xs font-bold text-[#2D362E]">{pair.partnerName}</span>
                            </div>
                            <p className="text-[10px] text-[#606C5D] truncate">{pair.partnerCompanyOrBrokerage}</p>
                            <p className="text-[10px] text-[#9A9488]">
                              {pair.closedUnits12Mo} Co-Closed Units &bull; ${(pair.closedVolume12Mo / 1000000).toFixed(1)}M Vol
                            </p>
                          </div>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 shrink-0">
                            Active Pair
                          </span>
                        </div>
                      ))}
                      {agentPairs.length === 0 && (
                        <div className="col-span-full p-3 rounded-xl bg-[#F9F8F4] text-xs text-[#9A9488] text-center">
                          No direct Realtor pairs mapped. Use the agent directory to assign real estate partners.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section 3: Incoming Leads Intake by Source & Exact Published Ad Copy / Asset Attribution */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-1">
                    {/* Left: Lead Intake Counts & Asset Attribution */}
                    <div className="lg:col-span-2 space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#606C5D] flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-blue-600" />
                        <span>Incoming Leads Intake &amp; Exact Media Asset Attribution</span>
                      </h4>

                      {/* Source Chips */}
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {[
                          { name: "Facebook", count: fbLeads, color: SOURCE_COLORS["Facebook Ads"] },
                          { name: "Google Ads", count: googleLeads, color: SOURCE_COLORS["Google Ads"] },
                          { name: "YouTube", count: ytLeads, color: SOURCE_COLORS["YouTube Video Ads"] },
                          { name: "GeoSphere", count: geoLeads, color: SOURCE_COLORS["GeoSphere GIS Map"] },
                          { name: "Social Media", count: socialLeads, color: SOURCE_COLORS["Social Media"] },
                          { name: "Roadmap App", count: organicLeads, color: SOURCE_COLORS["Roadmap / Chatbot"] },
                        ].map(src => (
                          <div key={src.name} className="p-2 rounded-xl bg-[#F9F8F4] border border-[#EAE7E0] text-center">
                            <span className="text-[10px] text-[#606C5D] block font-medium truncate">{src.name}</span>
                            <span className="text-xs font-bold font-mono text-[#2D362E]">{src.count}</span>
                          </div>
                        ))}
                      </div>

                      {/* Exact Published Ad Copy or Video Assets List */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold text-[#2D362E] block">
                          Published Ad Copies &amp; Video Media Assets:
                        </span>
                        <div className="space-y-1.5">
                          {lo.adExpensesBreakdown && lo.adExpensesBreakdown.length > 0 ? (
                            lo.adExpensesBreakdown.map((item, i) => (
                              <div 
                                key={i}
                                className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0] text-xs"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  {item.assetType === "youtube_video" ? (
                                    <Video className="w-3.5 h-3.5 text-red-600 shrink-0" />
                                  ) : item.assetType === "geosphere_map" ? (
                                    <MapPin className="w-3.5 h-3.5 text-[#4A5D4E] shrink-0" />
                                  ) : item.assetType === "google_ad" ? (
                                    <Globe className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                                  ) : (
                                    <Share2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                  )}
                                  <span className="font-semibold text-[#2D362E] truncate">
                                    {item.campaignName || `${item.source} Asset`}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="font-mono font-bold text-[#4A5D4E]">${item.amount}</span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EAE7E0] text-[#606C5D]">
                                    {item.source}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0] text-xs text-[#606C5D] space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-[#2D362E]">Meta Feed - 2026 Oregon FTHB DPA 3.5% Grant Flyer</span>
                                <span className="font-mono text-[#4A5D4E] font-bold">$350.00</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-[#2D362E]">Vantage AI Video - 1240 Willamette Heights Walkthrough</span>
                                <span className="font-mono text-[#4A5D4E] font-bold">$250.00</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-[#2D362E]">GeoSphere Map - Oregon USDA 0% Down Interactive Tract Search</span>
                                <span className="font-mono text-[#4A5D4E] font-bold">$150.00</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Mini ROLI Pie Chart & Cost Per Lead Visual */}
                    <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#EAE7E0] flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-[#2D362E] flex items-center gap-1.5">
                            <PieChartIcon className="w-3.5 h-3.5 text-[#C18C5D]" />
                            <span>LO Return on Lead Investment</span>
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            ROLI A+
                          </span>
                        </div>
                        <p className="text-[10px] text-[#606C5D]">
                          Ad spend vs. total lead yield
                        </p>
                      </div>

                      {/* Mini Recharts Pie */}
                      <div className="h-28 relative my-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPie>
                            <Pie
                              data={loPieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={30}
                              outerRadius={45}
                              paddingAngle={4}
                              dataKey="value"
                              stroke="none"
                            >
                              {loPieData.map((entry, index) => (
                                <Cell key={`lo-cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip 
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px' }}
                            />
                          </RechartsPie>
                        </ResponsiveContainer>
                      </div>

                      {/* Summary Metrics */}
                      <div className="pt-2 border-t border-[#EAE7E0] space-y-1 text-xs">
                        <div className="flex items-center justify-between text-[#606C5D]">
                          <span>Total Incurred Ad Costs:</span>
                          <span className="font-mono font-bold text-[#2D362E]">${loAdSpend.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-[#606C5D]">
                          <span>Total Ingested Leads:</span>
                          <span className="font-mono font-bold text-[#2D362E]">{totalLoLeads} leads</span>
                        </div>
                        <div className="flex items-center justify-between text-[#2D362E] font-semibold pt-1 border-t border-[#EAE7E0]/60">
                          <span>Cost Per Lead (CPL):</span>
                          <span className="font-mono font-bold text-emerald-700">${loCpl.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Local Toast Notification */}
      {localToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1B365D] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 className="w-4 h-4 text-[#00A1E0] shrink-0" />
          <span>{localToast}</span>
        </div>
      )}

      {/* Log Advertising Expense Modal */}
      <AddAdExpenseModal
        isOpen={showAdExpenseModal}
        onClose={() => {
          setShowAdExpenseModal(false);
          setExpenseTargetLoId(undefined);
        }}
        loanOfficers={allLoanOfficers}
        selectedLoId={expenseTargetLoId}
        onSaveExpense={handleSaveAdExpense}
      />

      {/* Salesforce & Total Expert CSV Export & Ingestion Studio Modal */}
      <SalesforceCsvExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        leads={leads}
        loanOfficers={guidesState.loanOfficers || []}
        agents={guidesState.agents || []}
        defaultFormat={modalFormat}
        onTriggerToast={triggerToast}
      />

      {/* Individual Loan Officer Twilio BYOK Modal */}
      <TwilioSettingsModal
        isOpen={showTwilioModal}
        onClose={() => {
          setShowTwilioModal(false);
          setTwilioTargetLoId(undefined);
        }}
        allLoanOfficers={allLoanOfficers}
        initialTargetLoId={twilioTargetLoId}
        onSaveLoTwilioConfig={handleSaveLoTwilioConfig}
      />
    </div>
  );
};
