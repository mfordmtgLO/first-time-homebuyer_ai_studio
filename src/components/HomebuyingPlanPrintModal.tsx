import React, { useRef, useState } from "react";
import { 
  Printer, 
  X, 
  FileDown, 
  CheckCircle2, 
  Circle, 
  Compass, 
  DollarSign, 
  Building, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Star, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Layers, 
  CheckSquare, 
  Square, 
  SlidersHorizontal,
  FileText,
  Footprints,
  Wrench,
  ThumbsUp,
  MapPin,
  ExternalLink,
  QrCode,
  Smartphone
} from "lucide-react";
import { 
  FinancialProfile, 
  PropertyListing, 
  RoadmapMilestone, 
  DocumentItem, 
  LoanOfficerProfile, 
  RealEstateAgentProfile 
} from "../types";
import { calculateMortgageBreakdown, formatUSD, getDTIStatus } from "../utils/mortgageMath";
import { 
  isLakeviewNationalEligible, 
  isUsdaEligible, 
  isLmiEligible, 
  isTargetedArea,
  isFirstHomePriceEligible 
} from "../utils/overlayClassification";
import { ShareViaEmailModal } from "./ShareViaEmailModal";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface HomebuyingPlanPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: FinancialProfile;
  milestones: RoadmapMilestone[];
  properties: PropertyListing[];
  documents?: DocumentItem[];
  loanOfficer?: LoanOfficerProfile;
  activeAgent?: RealEstateAgentProfile;
  isCoBranded?: boolean;
  agentRoster?: RealEstateAgentProfile[];
}

export const HomebuyingPlanPrintModal: React.FC<HomebuyingPlanPrintModalProps> = ({
  isOpen,
  onClose,
  profile,
  milestones,
  properties,
  documents = [],
  loanOfficer,
  activeAgent: propActiveAgent,
  isCoBranded = false,
  agentRoster,
}) => {
  // If we are not co-branded (solo LO link) and we have a loan officer with a spotlight agent, use that agent
  const activeAgent = (!isCoBranded && loanOfficer?.marketNewsSpotlightAgentId && !propActiveAgent && agentRoster) 
    ? agentRoster.find(a => a.id === loanOfficer.marketNewsSpotlightAgentId) || propActiveAgent
    : propActiveAgent;

  const [includeFinancials, setIncludeFinancials] = useState(true);
  const [includeRoadmap, setIncludeRoadmap] = useState(true);
  const [includeProperties, setIncludeProperties] = useState(true);
  const [includeDocuments, setIncludeDocuments] = useState(true);
  const [includeProTeam, setIncludeProTeam] = useState(true);
  const [propertyFilter, setPropertyFilter] = useState<"all" | "toured" | "favorites" | "contract">("all");
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const documentRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Mortgage calculations
  const breakdown = calculateMortgageBreakdown(profile);
  const dtiStatus = getDTIStatus(breakdown.backEndDTI);

  // Overall milestone progress
  const allTasks = milestones.flatMap(m => m.tasks);
  const completedTasks = allTasks.filter(t => t.done).length;
  const totalTasks = allTasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Filter properties based on user preference
  const filteredProperties = properties.filter(p => {
    if (propertyFilter === "toured") return p.scorecard !== undefined || p.tourDate || p.notes?.trim().length > 0;
    if (propertyFilter === "favorites") return p.isFavorite;
    if (propertyFilter === "contract") return p.status === "offered" || p.status === "under_contract";
    return true;
  });

  // Recommended Loan Program & Seller IPC calculation
  const downPaymentPercent = profile.targetPrice > 0 ? (profile.downPaymentSavings / profile.targetPrice) * 100 : 0;
  let recommendedProgram = "Conventional 97 (3% Down)";
  let maxIpcPercent = 3;
  if (downPaymentPercent >= 20) {
    recommendedProgram = "Conventional Standard (20% Down / No PMI)";
    maxIpcPercent = 9;
  } else if (downPaymentPercent >= 10) {
    recommendedProgram = "Conventional Standard (10% Down)";
    maxIpcPercent = 6;
  } else if (profile.creditScore < 680) {
    recommendedProgram = "FHA 3.5% (Flexible Credit)";
    maxIpcPercent = 6;
  }
  const maxIpcDollar = (profile.targetPrice * maxIpcPercent) / 100;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!documentRef.current) return;
    setIsExportingPdf(true);
    try {
      const element = documentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Homebuyer_Master_Plan_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static print:overflow-visible">
      {/* Container Dialog */}
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#EAE7E0] overflow-hidden print:max-w-none print:w-full print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Header / Action Bar (Screen Only) */}
        <div className="p-4 sm:p-6 border-b border-[#EAE7E0] bg-[#F9F8F4] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4A5D4E] text-white flex items-center justify-center shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-[#2D362E]">
                Save Homebuying Plan & Property Notes
              </h2>
              <p className="text-xs text-[#606C5D]">
                Generate a clean, high-contrast PDF document.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F1EFE9] text-[#4A5D4E] font-bold text-xs border border-[#4A5D4E] transition-colors cursor-pointer"
              title="Email this complete plan and notes to yourself or partner"
            >
              <Mail className="w-4 h-4 text-[#4A5D4E]" />
              <span>Email Plan</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isExportingPdf}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F1EFE9] text-[#4A5D4E] font-bold text-xs border border-[#EAE7E0] transition-colors cursor-pointer disabled:opacity-50"
              title="Export as PDF file"
            >
              <FileDown className="w-4 h-4 text-[#C18C5D]" />
              <span>{isExportingPdf ? "Generating..." : "Save PDF"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white hover:bg-[#F1EFE9] text-[#606C5D] hover:text-[#2D362E] border border-[#EAE7E0] transition-colors cursor-pointer"
              title="Close print preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Section Toggles / Filter Toolbar (Screen Only) */}
        <div className="px-4 sm:px-6 py-3 bg-white border-b border-[#EAE7E0] flex flex-wrap items-center justify-between gap-3 text-xs text-[#606C5D] print:hidden">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-[#2D362E] flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#4A5D4E]" />
              <span>Include Sections:</span>
            </span>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#2D362E]">
              <input
                type="checkbox"
                checked={includeFinancials}
                onChange={e => setIncludeFinancials(e.target.checked)}
                className="rounded text-[#4A5D4E] focus:ring-[#4A5D4E]"
              />
              <span>Financial Blueprint</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#2D362E]">
              <input
                type="checkbox"
                checked={includeRoadmap}
                onChange={e => setIncludeRoadmap(e.target.checked)}
                className="rounded text-[#4A5D4E] focus:ring-[#4A5D4E]"
              />
              <span>10-Step Roadmap ({progressPercent}%)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#2D362E]">
              <input
                type="checkbox"
                checked={includeProperties}
                onChange={e => setIncludeProperties(e.target.checked)}
                className="rounded text-[#4A5D4E] focus:ring-[#4A5D4E]"
              />
              <span>Property Notes & Scorecards ({filteredProperties.length})</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#2D362E]">
              <input
                type="checkbox"
                checked={includeDocuments}
                onChange={e => setIncludeDocuments(e.target.checked)}
                className="rounded text-[#4A5D4E] focus:ring-[#4A5D4E]"
              />
              <span>Document Checklist</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#2D362E]">
              <input
                type="checkbox"
                checked={includeProTeam}
                onChange={e => setIncludeProTeam(e.target.checked)}
                className="rounded text-[#4A5D4E] focus:ring-[#4A5D4E]"
              />
              <span>Advisory Team</span>
            </label>
          </div>

          {includeProperties && properties.length > 0 && (
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-[11px] text-[#9A9488]">Filter Homes:</span>
              <select
                value={propertyFilter}
                onChange={(e) => setPropertyFilter(e.target.value as any)}
                className="text-xs bg-[#F9F8F4] border border-[#EAE7E0] rounded-lg px-2 py-1 font-medium text-[#2D362E]"
              >
                <option value="all">All Tracked Homes ({properties.length})</option>
                <option value="toured">Only Toured / With Notes ({properties.filter(p => p.scorecard || p.tourDate || p.notes).length})</option>
                <option value="favorites">Only Favorites ({properties.filter(p => p.isFavorite).length})</option>
                <option value="contract">Offered / Under Contract ({properties.filter(p => p.status === "offered" || p.status === "under_contract").length})</option>
              </select>
            </div>
          )}
        </div>

        {/* Scrollable Printable Document View */}
        <div className="overflow-y-auto p-6 sm:p-10 space-y-8 bg-white print:overflow-visible print:p-0 print:m-0 print:space-y-6">
          <div ref={documentRef} id="printable-homebuying-plan" className="space-y-8 print:space-y-6 text-[#2D362E]">
            
            {/* DOCUMENT HEADER / MASTHEAD */}
            <div className="border-b-2 border-[#2D362E] pb-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F1EFE9] text-[#4A5D4E] text-[11px] font-bold uppercase tracking-wider border border-[#EAE7E0] print:border-black/20">
                    <Compass className="w-3 h-3 text-[#4A5D4E]" />
                    <span>First-Time Homebuyer Master Dossier</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D362E]">
                    Homebuying Plan & Field Property Notes
                  </h1>
                  <p className="text-xs sm:text-sm text-[#606C5D]">
                    Prepared on {todayFormatted} • Structured Chronological Action Plan & Inspection Notes
                  </p>
                </div>

                {/* Key Status Pill */}
                <div className="bg-[#F9F8F4] border border-[#EAE7E0] p-4 rounded-2xl flex items-center gap-4 shrink-0 print:border-black/30">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[#9A9488] block">Overall Readiness</span>
                    <span className="text-xl font-bold font-serif text-[#2D362E]">{progressPercent}% Ready</span>
                    <span className="text-[11px] text-[#606C5D] block">{completedTasks} of {totalTasks} Tasks Done</span>
                  </div>
                </div>
              </div>

              {/* Advisory Guides Strip */}
              {includeProTeam && (loanOfficer || activeAgent) && (
                <div className="bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs print:bg-gray-50 print:border-gray-300">
                  {loanOfficer && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#4A5D4E] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        LO
                      </div>
                      <div>
                        <div className="font-bold text-[#2D362E]">{loanOfficer.name} <span className="font-normal text-[#9A9488]">(NMLS #{loanOfficer.nmlsId})</span></div>
                        <div className="text-[#606C5D] text-[11px]">Senior Mortgage Advisor • {loanOfficer.company}</div>
                        <div className="text-[#4A5D4E] text-[11px] font-medium">{loanOfficer.phone} | {loanOfficer.email}</div>
                      </div>
                    </div>
                  )}

                  {activeAgent && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#C18C5D] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        RE
                      </div>
                      <div>
                        <div className="font-bold text-[#2D362E]">{activeAgent.name} <span className="font-normal text-[#9A9488]">({activeAgent.brokerage})</span></div>
                        <div className="text-[#606C5D] text-[11px]">Buyer's Representative • License #{activeAgent.licenseNumber}</div>
                        <div className="text-[#4A5D4E] text-[11px] font-medium">{activeAgent.phone} | {activeAgent.email}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SECTION 1: FINANCIAL PROFILE & PURCHASING POWER */}
            {includeFinancials && (
              <div className="space-y-4 break-inside-avoid">
                <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-2">
                  <h2 className="text-lg font-serif font-bold text-[#2D362E] flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#4A5D4E]" />
                    <span>1. Executive Financial Plan & Purchasing Power</span>
                  </h2>
                  <span className="text-xs font-semibold text-[#606C5D]">
                    Target Price: <strong className="text-[#2D362E]">{formatUSD(profile.targetPrice)}</strong>
                  </span>
                </div>

                {/* 4 Financial Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#F9F8F4] border border-[#EAE7E0] print:border-gray-300">
                    <span className="text-[10px] uppercase font-bold text-[#9A9488] block">Annual Income</span>
                    <span className="text-base font-bold text-[#2D362E]">{formatUSD(profile.annualIncome)}</span>
                    <span className="text-[10px] text-[#606C5D] block">Debts: {formatUSD(profile.monthlyDebt)}/mo</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F9F8F4] border border-[#EAE7E0] print:border-gray-300">
                    <span className="text-[10px] uppercase font-bold text-[#9A9488] block">Down Payment Saved</span>
                    <span className="text-base font-bold text-[#4A5D4E]">{formatUSD(profile.downPaymentSavings)}</span>
                    <span className="text-[10px] text-[#606C5D] block">{downPaymentPercent.toFixed(1)}% of Target Price</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F9F8F4] border border-[#EAE7E0] print:border-gray-300">
                    <span className="text-[10px] uppercase font-bold text-[#9A9488] block">Max Safe Home Price</span>
                    <span className="text-base font-bold text-[#2D362E]">{formatUSD(breakdown.maxSafePriceConservative)}</span>
                    <span className="text-[10px] text-[#606C5D] block">28/36 Rule Benchmark</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F9F8F4] border border-[#EAE7E0] print:border-gray-300">
                    <span className="text-[10px] uppercase font-bold text-[#9A9488] block">Est. Monthly Payment</span>
                    <span className="text-base font-bold text-[#2D362E]">{formatUSD(breakdown.totalMonthly)}</span>
                    <span className="text-[10px] text-[#606C5D] block">PITI + PMI + HOA</span>
                  </div>
                </div>

                {/* Monthly Payment Breakdown & DTI Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl border border-[#EAE7E0] space-y-2 bg-white print:border-gray-300">
                    <div className="font-bold text-[#2D362E] border-b border-[#EAE7E0] pb-1 flex justify-between">
                      <span>Monthly Payment Breakdown</span>
                      <span>{profile.interestRate}% Interest Rate</span>
                    </div>
                    <div className="space-y-1 text-[#606C5D]">
                      <div className="flex justify-between">
                        <span>Principal & Interest (Loan {formatUSD(breakdown.loanAmount)}):</span>
                        <span className="font-bold text-[#2D362E]">{formatUSD(breakdown.principalAndInterest)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Property Taxes ({profile.propertyTaxRate || 1.2}%):</span>
                        <span className="font-medium text-[#2D362E]">{formatUSD(breakdown.propertyTax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Homeowners Insurance:</span>
                        <span className="font-medium text-[#2D362E]">{formatUSD(breakdown.homeInsurance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mortgage Insurance (PMI):</span>
                        <span className="font-medium text-[#2D362E]">{formatUSD(breakdown.pmi)}</span>
                      </div>
                      {breakdown.hoa > 0 && (
                        <div className="flex justify-between">
                          <span>HOA Dues:</span>
                          <span className="font-medium text-[#2D362E]">{formatUSD(breakdown.hoa)}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-[#EAE7E0] pt-1 font-bold text-[#2D362E]">
                        <span>Total Estimated Monthly Outlay:</span>
                        <span className="text-[#4A5D4E] text-sm">{formatUSD(breakdown.totalMonthly)}/mo</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-[#EAE7E0] space-y-2.5 bg-white print:border-gray-300">
                    <div className="font-bold text-[#2D362E] border-b border-[#EAE7E0] pb-1">
                      Financing & Underwriting Criteria
                    </div>
                    <div className="space-y-1.5 text-[#606C5D]">
                      <div className="flex justify-between items-center">
                        <span>Credit Score:</span>
                        <span className="font-bold text-[#2D362E]">{profile.creditScore} (Eligible)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Front-End DTI (Housing):</span>
                        <span className="font-bold text-[#2D362E]">{breakdown.frontEndDTI}% (Safe ≤ 28%)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Back-End DTI (Total Debts):</span>
                        <span className={`font-bold ${dtiStatus.isHigh ? 'text-amber-700' : 'text-emerald-800'}`}>
                          {breakdown.backEndDTI}% ({dtiStatus.label})
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Recommended Loan Program:</span>
                        <span className="font-bold text-[#4A5D4E]">{recommendedProgram}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Max Seller Credits (IPC Limit):</span>
                        <span className="font-bold text-[#C18C5D]">{maxIpcPercent}% ({formatUSD(maxIpcDollar)})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: 10-STEP HOMEBUYING ROADMAP */}
            {includeRoadmap && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-2">
                  <h2 className="text-lg font-serif font-bold text-[#2D362E] flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#4A5D4E]" />
                    <span>2. 10-Step Chronological Homebuying Roadmap</span>
                  </h2>
                  <span className="text-xs font-semibold text-[#4A5D4E]">
                    {completedTasks} of {totalTasks} Tasks Completed ({progressPercent}%)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {milestones.map((m, idx) => {
                    const stepDone = m.tasks.every(t => t.done);
                    const doneCount = m.tasks.filter(t => t.done).length;

                    return (
                      <div
                        key={m.id}
                        className={`p-3.5 rounded-xl border transition-all break-inside-avoid ${
                          stepDone
                            ? "bg-[#F1EFE9]/60 border-[#4A5D4E]/40"
                            : "bg-white border-[#EAE7E0] print:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              stepDone ? "bg-[#4A5D4E] text-white" : "bg-[#F1EFE9] text-[#606C5D] border border-[#EAE7E0]"
                            }`}>
                              {idx + 1}
                            </span>
                            <div>
                              <h3 className="text-xs font-bold text-[#2D362E]">{m.title}</h3>
                              <span className="text-[10px] font-semibold text-[#9A9488] uppercase tracking-wider">{m.stage}</span>
                            </div>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            stepDone ? "bg-emerald-100 text-emerald-800" : "bg-[#F1EFE9] text-[#606C5D]"
                          }`}>
                            {doneCount}/{m.tasks.length} Done
                          </span>
                        </div>

                        {/* Task Checklist */}
                        <div className="space-y-1.5 pl-2 border-l-2 border-[#EAE7E0] my-2 text-xs">
                          {m.tasks.map((task) => (
                            <div key={task.id} className="flex items-start gap-2">
                              {task.done ? (
                                <CheckSquare className="w-3.5 h-3.5 text-[#4A5D4E] shrink-0 mt-0.5" />
                              ) : (
                                <Square className="w-3.5 h-3.5 text-[#9A9488] shrink-0 mt-0.5" />
                              )}
                              <span className={`leading-tight ${task.done ? "text-[#2D362E] font-medium" : "text-[#606C5D]"}`}>
                                {task.text}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Pro Tip Callout */}
                        {m.proTip && (
                          <div className="text-[11px] text-[#4A5D4E] bg-[#F9F8F4] p-2 rounded-lg border border-[#EAE7E0] mt-2">
                            <strong>Pro Tip:</strong> {m.proTip}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION 3: TRACKED PROPERTIES & FIELD INSPECTION NOTES */}
            {includeProperties && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-2">
                  <h2 className="text-lg font-serif font-bold text-[#2D362E] flex items-center gap-2">
                    <Building className="w-4 h-4 text-[#4A5D4E]" />
                    <span>3. Tracked Properties & Field Inspection Notes</span>
                  </h2>
                  <span className="text-xs font-semibold text-[#606C5D]">
                    {filteredProperties.length} Properties Included
                  </span>
                </div>

                {filteredProperties.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl border border-dashed border-[#EAE7E0] text-xs text-[#9A9488]">
                    No properties currently match the selected filter.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProperties.map((prop, idx) => {
                      const hasNotes = prop.notes && prop.notes.trim().length > 0;
                      const hasScorecard = prop.scorecard !== undefined;
                      const sc = prop.scorecard;

                      return (
                        <div
                          key={prop.id}
                          className="p-4 sm:p-5 rounded-2xl border border-[#EAE7E0] bg-white space-y-3 break-inside-avoid print:border-gray-400 print:shadow-none"
                        >
                          {/* Property Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE7E0] pb-2.5">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-[#2D362E]">{prop.title}</span>
                                {prop.isFavorite && (
                                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold text-[10px] rounded-full">
                                    ★ Favorite
                                  </span>
                                )}
                                <span className="px-2 py-0.5 bg-[#F1EFE9] text-[#606C5D] font-bold text-[10px] rounded-full uppercase">
                                  {prop.status.replace("_", " ")}
                                </span>
                              </div>
                              <p className="text-xs text-[#606C5D] flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-[#4A5D4E]" />
                                {prop.address}, {prop.city}, {prop.state} {prop.zip}
                                {prop.county && ` (${prop.county} County)`}
                              </p>
                            </div>

                            <div className="text-left sm:text-right">
                              <span className="text-base font-bold font-serif text-[#2D362E] block">
                                {formatUSD(prop.price)}
                              </span>
                              <span className="text-[11px] text-[#606C5D]">
                                {prop.beds} beds • {prop.baths} baths • {prop.sqft.toLocaleString()} sqft {prop.yearBuilt ? `• Built ${prop.yearBuilt}` : ''}
                              </span>
                            </div>
                          </div>

                          {/* Tour Details & Walkscore */}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#606C5D]">
                            {prop.tourDate && (
                              <span className="inline-flex items-center gap-1 font-semibold text-[#4A5D4E] bg-[#F1EFE9] px-2.5 py-1 rounded-lg">
                                <Calendar className="w-3 h-3" />
                                Tour Date: {prop.tourDate}
                              </span>
                            )}
                            {prop.walkScore !== undefined && (
                              <span className="inline-flex items-center gap-1 font-medium bg-[#F9F8F4] px-2.5 py-1 rounded-lg border border-[#EAE7E0]">
                                <Footprints className="w-3 h-3 text-[#C18C5D]" />
                                Walk Score: {prop.walkScore}/100
                              </span>
                            )}
                            {prop.mlsNumber && (
                              <span className="text-[#9A9488]">MLS: {prop.mlsNumber}</span>
                            )}
                          </div>

                          {/* USER FIELD NOTES */}
                          {hasNotes && (
                            <div className="bg-[#F9F8F4] border-l-3 border-[#4A5D4E] p-3 rounded-r-xl text-xs space-y-1">
                              <div className="font-bold text-[#2D362E] flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                                <FileText className="w-3 h-3 text-[#4A5D4E]" />
                                <span>Buyer Tour & Inspection Notes</span>
                              </div>
                              <p className="text-[#2D362E] whitespace-pre-line leading-relaxed">
                                {prop.notes}
                              </p>
                            </div>
                          )}

                          {/* SCORECARD & INSPECTION RATINGS */}
                          {hasScorecard && sc && (
                            <div className="bg-[#F9F8F4] border border-[#EAE7E0] p-3.5 rounded-xl space-y-2.5 text-xs">
                              <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-[#2D362E]">Inspection Scorecard</span>
                                  <span className="px-2 py-0.5 rounded-full bg-[#4A5D4E] text-white font-bold text-[10px]">
                                    Grade: {sc.grade} ({sc.overallRating}/10)
                                  </span>
                                </div>
                                {sc.estimatedRenovationCost > 0 && (
                                  <span className="font-bold text-amber-800">
                                    Est. Repairs/Reno: {formatUSD(sc.estimatedRenovationCost)}
                                  </span>
                                )}
                              </div>

                              {/* 9-Point Inspection Grid */}
                              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-[11px]">
                                <div className="p-1.5 bg-white rounded-lg border border-[#EAE7E0]">
                                  <span className="text-[#9A9488] block text-[9px]">Roof & Exterior</span>
                                  <strong className="text-[#2D362E]">{sc.roofAndExterior}/10</strong>
                                </div>
                                <div className="p-1.5 bg-white rounded-lg border border-[#EAE7E0]">
                                  <span className="text-[#9A9488] block text-[9px]">Foundation</span>
                                  <strong className="text-[#2D362E]">{sc.foundationAndStructure}/10</strong>
                                </div>
                                <div className="p-1.5 bg-white rounded-lg border border-[#EAE7E0]">
                                  <span className="text-[#9A9488] block text-[9px]">HVAC & Electric</span>
                                  <strong className="text-[#2D362E]">{sc.hvacAndElectrical}/10</strong>
                                </div>
                                <div className="p-1.5 bg-white rounded-lg border border-[#EAE7E0]">
                                  <span className="text-[#9A9488] block text-[9px]">Plumbing/Water</span>
                                  <strong className="text-[#2D362E]">{sc.plumbingAndWaterPressure}/10</strong>
                                </div>
                                <div className="p-1.5 bg-white rounded-lg border border-[#EAE7E0]">
                                  <span className="text-[#9A9488] block text-[9px]">Kitchen & Baths</span>
                                  <strong className="text-[#2D362E]">{sc.kitchenAndBathrooms}/10</strong>
                                </div>
                              </div>

                              {/* Positives & Red Flags */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                                {sc.positives && sc.positives.length > 0 && (
                                  <div className="space-y-0.5">
                                    <span className="font-bold text-emerald-800 flex items-center gap-1 text-[10px]">
                                      <ThumbsUp className="w-2.5 h-2.5" /> Standout Highlights:
                                    </span>
                                    <ul className="list-disc list-inside text-[#606C5D] space-y-0.5 pl-1">
                                      {sc.positives.map((pos, pIdx) => (
                                        <li key={pIdx}>{pos}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {sc.redFlags && sc.redFlags.length > 0 && (
                                  <div className="space-y-0.5">
                                    <span className="font-bold text-amber-900 flex items-center gap-1 text-[10px]">
                                      <AlertTriangle className="w-2.5 h-2.5" /> Red Flag Concerns:
                                    </span>
                                    <ul className="list-disc list-inside text-amber-950 space-y-0.5 pl-1">
                                      {sc.redFlags.map((flag, fIdx) => (
                                        <li key={fIdx}>{flag}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Grant Eligibility Badges */}
                          {prop.overlayEligibility && (
                            <div className="flex flex-wrap gap-1.5 pt-1 text-[10px]">
                              {isLakeviewNationalEligible(prop) && (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                                  ✓ Lakeview National DPA Eligible
                                </span>
                              )}
                              {isUsdaEligible(prop) && (
                                <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200 font-semibold">
                                  ✓ USDA 0% Down Rural Eligible
                                </span>
                              )}
                              {isLmiEligible(prop) && (
                                <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 font-semibold">
                                  ✓ Low/Moderate Income Area Incentive
                                </span>
                              )}
                              {isFirstHomePriceEligible(prop) && (
                                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                                  ✓ Oregon FirstHome Cap Eligible
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* SECTION 4: DOCUMENT CHECKLIST */}
            {includeDocuments && documents && documents.length > 0 && (
              <div className="space-y-3 break-inside-avoid">
                <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-2">
                  <h2 className="text-lg font-serif font-bold text-[#2D362E] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#4A5D4E]" />
                    <span>4. Underwriting & Closing Document Checklist</span>
                  </h2>
                  <span className="text-xs font-semibold text-[#606C5D]">
                    {documents.filter(d => d.status === "ready" || d.status === "submitted").length} of {documents.length} Prepared
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {documents.map((doc) => {
                    const isReady = doc.status === "ready" || doc.status === "submitted";
                    return (
                      <div
                        key={doc.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between ${
                          isReady ? "bg-[#F1EFE9]/70 border-[#4A5D4E]/30 text-[#2D362E]" : "bg-white border-[#EAE7E0] text-[#606C5D]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isReady ? (
                            <CheckSquare className="w-3.5 h-3.5 text-[#4A5D4E] shrink-0" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-[#9A9488] shrink-0" />
                          )}
                          <span className={isReady ? "font-semibold text-[#2D362E]" : ""}>
                            {doc.title}
                          </span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          isReady ? "bg-emerald-100 text-emerald-800" : "bg-[#F9F8F4] text-[#9A9488]"
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION 5: FAST-TRACK PRE-APPROVAL & MOBILE QR */}
            {loanOfficer && (
              <div className="p-4 rounded-2xl bg-[#F9F8F4] border border-[#EAE7E0] break-inside-avoid print:bg-gray-50 print:border-gray-300 space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1.5 text-center sm:text-left flex-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E] text-[10px] font-bold uppercase tracking-wider">
                      <Smartphone className="w-3 h-3 text-[#4A5D4E]" />
                      <span>Direct Fast-Track Pre-Approval Portal</span>
                    </div>
                    <h3 className="font-serif font-bold text-sm text-[#2D362E]">
                      Ready to take this plan to pre-approval?
                    </h3>
                    <p className="text-xs text-[#606C5D] leading-relaxed">
                      Scan the QR code with any smartphone camera or visit the direct link below to start your verified loan pre-approval application directly with <strong className="text-[#2D362E]">{loanOfficer.name}</strong> (NMLS #{loanOfficer.nmlsId}).
                    </p>
                    <div className="pt-1">
                      <span className="text-[11px] font-mono text-[#4A5D4E] font-semibold break-all underline">
                        {loanOfficer.leadGenFormUrl || "https://portal.myhometrac.com/get-started/MFORD@CFMTG.COM"}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-[#EAE7E0] text-center shrink-0 shadow-2xs">
                    <img 
                      src={loanOfficer.leadGenQrCodeUrl || "/lead-gen-qr-code.png"} 
                      alt="Pre-Approval QR Code" 
                      className="w-24 h-24 mx-auto object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[9px] font-bold text-[#606C5D] block mt-1">
                      Scan with Phone Camera
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* DOCUMENT FOOTER & LEGAL DISCLAIMER */}
            <div className="border-t border-[#EAE7E0] pt-6 space-y-2 text-[11px] text-[#9A9488] break-inside-avoid">
              <p>
                <strong>Consumer Note:</strong> This document is generated for informational and planning purposes only. Loan approval, down payment assistance program eligibility, interest rates, and final mortgage terms are subject to formal underwriting review, credit qualification, asset verification, and property appraisal.
              </p>
              <div className="flex justify-between items-center text-[10px] text-[#606C5D] pt-2">
                <span>First-Time Homebuyer Roadmap Portal • Confidential Buyer Record</span>
                <span>Page 1 of Dossier</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Share Plan & Properties via Email Modal */}
      <ShareViaEmailModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        profile={profile}
        milestones={milestones}
        properties={filteredProperties}
        documents={documents}
        loanOfficer={loanOfficer}
        activeAgent={activeAgent}
      />
    </div>
  );
};
