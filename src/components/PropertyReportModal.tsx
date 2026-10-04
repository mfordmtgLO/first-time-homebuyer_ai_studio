import React, { useRef, useState } from "react";
import { 
  Building, 
  X, 
  FileDown, 
  Printer, 
  FileSpreadsheet, 
  Star, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Layers, 
  MapPin, 
  Calendar, 
  DollarSign, 
  User, 
  Phone, 
  Mail, 
  ExternalLink,
  ShieldCheck,
  Clock,
  Wrench,
  ThumbsUp,
  AlertCircle
} from "lucide-react";
import { PropertyListing, FinancialProfile } from "../types";
import { calculateMonthlyPI, formatUSD } from "../utils/mortgageMath";
import { 
  isLakeviewNationalEligible,
  isUsdaEligible, 
  isLmiEligible, 
  isTargetedArea, 
  isFirstHomePriceEligible,
  getZillowUrl 
} from "../utils/overlayClassification";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface PropertyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: PropertyListing[];
  profile: FinancialProfile;
}

export const PropertyReportModal: React.FC<PropertyReportModalProps> = ({
  isOpen,
  onClose,
  properties,
  profile,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Aggregate Metrics
  const totalVolume = properties.reduce((sum, p) => sum + p.price, 0);
  const avgPrice = properties.length > 0 ? Math.round(totalVolume / properties.length) : 0;
  const touredProperties = properties.filter(p => p.scorecard !== undefined);
  const touredCount = touredProperties.length;
  
  const avgRating = touredCount > 0 
    ? (touredProperties.reduce((sum, p) => sum + (p.scorecard?.overallRating || 0), 0) / touredCount).toFixed(1)
    : "N/A";
  
  const totalEstimatedReno = touredProperties.reduce((sum, p) => sum + (p.scorecard?.estimatedRenovationCost || 0), 0);
  const lakeviewNationalCount = properties.filter(p => isLakeviewNationalEligible(p)).length;
  const usdaEligibleCount = properties.filter(p => isUsdaEligible(p)).length;
  const lmiEligibleCount = properties.filter(p => isLmiEligible(p)).length;

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // PDF Export Handler
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const element = reportRef.current;
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

      pdf.save(`FirstHome-Property-Tour-Report-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF", err);
      alert("An error occurred while generating the PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // CSV Export Handler
  const handleDownloadCSV = () => {
    if (properties.length === 0) return;
    const headers = [
      "Property Title", "Address", "City", "State", "Zip", "Status", "Price ($)",
      "Est Monthly ($)", "Beds", "Baths", "SqFt", "Price/SqFt ($)", "Year Built", "Days on Market",
      "Tour Grade", "Tour Score (1-10)", "Est Reno Cost ($)", "Red Flags", "Notes"
    ].join(",");

    const rows = properties.map(p => {
      const loanAmt = Math.max(0, p.price - profile.downPaymentSavings);
      const estPI = calculateMonthlyPI(loanAmt, profile.interestRate, profile.loanTermYears);
      const estMonthly = estPI + Math.round(p.propertyTaxAnnual / 12) + Math.round(profile.annualHomeInsurance / 12) + p.hoaMonthly;
      const pricePerSqft = p.sqft ? Math.round(p.price / p.sqft) : "";
      const sc = p.scorecard;

      const escapeCsv = (val: any) => `"${String(val || '').replace(/"/g, '""')}"`;

      return [
        escapeCsv(p.title),
        escapeCsv(p.address),
        escapeCsv(p.city),
        escapeCsv(p.state),
        escapeCsv(p.zip),
        escapeCsv(p.status),
        p.price,
        estMonthly,
        p.beds,
        p.baths,
        p.sqft,
        pricePerSqft,
        p.yearBuilt || "",
        p.daysOnMarket || 0,
        escapeCsv(sc?.grade || "N/A"),
        sc?.overallRating ?? "N/A",
        sc?.estimatedRenovationCost ?? 0,
        escapeCsv(sc?.redFlags?.join("; ") || "None"),
        escapeCsv(p.notes || "")
      ].join(",");
    });

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Property-Report-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Print styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-pdf-report, #printable-pdf-report * {
            visibility: visible;
          }
          #printable-pdf-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-before: always;
          }
        }
      `}</style>

      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-[#EAE7E0] overflow-hidden my-auto">
        {/* Modal Toolbar Header */}
        <div className="bg-[#2D362E] p-4 sm:p-5 text-white flex items-center justify-between shrink-0 border-b border-white/10 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C18C5D] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Property & Tour Scorecard PDF Report</h3>
              <p className="text-xs text-white/80">
                Save a formatted property audit report ({properties.length} {properties.length === 1 ? 'property' : 'properties'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
              title="Download CSV Spreadsheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="px-3.5 py-1.5 bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isExporting ? "Exporting..." : "Save PDF"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Container */}
        <div className="flex-1 overflow-y-auto bg-[#F9F8F4] p-4 sm:p-8">
          <div 
            ref={reportRef} 
            id="printable-pdf-report" 
            className="bg-white max-w-4xl mx-auto rounded-3xl border border-[#EAE7E0] p-6 sm:p-10 space-y-8 shadow-sm text-[#2D362E]"
          >
            {/* Document Header & Co-Branding */}
            <div className="border-b-2 border-[#4A5D4E] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF9F5] text-[#C18C5D] text-xs font-bold border border-[#C18C5D]/30 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>OHCS First-Time Homebuyer Property Audit</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D362E]">
                  Saved Properties & Tour Scorecard Report
                </h1>
                <p className="text-xs text-[#606C5D] mt-1">
                  Prepared on {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} • Comprehensive Evaluation & Structural Audits
                </p>
              </div>

              {/* Client Profile Summary Box */}
              <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#EAE7E0] text-xs space-y-1 min-w-[220px]">
                <div className="text-[10px] font-bold text-[#9A9488] uppercase tracking-wider">Buyer Financial Profile</div>
                <div className="flex justify-between gap-2">
                  <span className="text-[#606C5D]">Target Price:</span>
                  <strong className="text-[#4A5D4E] font-bold">{formatUSD(profile.targetPrice)}</strong>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-[#606C5D]">Down Savings:</span>
                  <strong className="text-[#2D362E]">{formatUSD(profile.downPaymentSavings)}</strong>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-[#606C5D]">Status:</span>
                  <strong className="text-[#4A5D4E]">Pre-Screening Audit</strong>
                </div>
              </div>
            </div>

            {/* Executive Pipeline KPI Summary */}
            <div className="bg-[#FAF9F5] rounded-2xl p-5 border border-[#EAE7E0] space-y-3">
              <h3 className="text-xs font-bold text-[#9A9488] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#C18C5D]" />
                <span>Executive Pipeline Summary</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-[#EAE7E0]">
                  <span className="text-[10px] text-[#606C5D] block">Total Properties</span>
                  <strong className="text-lg font-bold text-[#2D362E]">{properties.length} Listings</strong>
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#EAE7E0]">
                  <span className="text-[10px] text-[#606C5D] block">Total Pipeline Value</span>
                  <strong className="text-lg font-bold text-[#4A5D4E]">{formatUSD(totalVolume)}</strong>
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#EAE7E0]">
                  <span className="text-[10px] text-[#606C5D] block">Homes Toured & Scored</span>
                  <strong className="text-lg font-bold text-[#C18C5D]">{touredCount} Homes ({avgRating}/10 Avg)</strong>
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#EAE7E0]">
                  <span className="text-[10px] text-[#606C5D] block">Program Overlay Matches</span>
                  <strong className="text-lg font-bold text-emerald-800">{lakeviewNationalCount} Lakeview • {usdaEligibleCount} USDA • {lmiEligibleCount} LMI</strong>
                </div>
              </div>
            </div>

            {/* Detailed Properties List */}
            <div className="space-y-8">
              <h3 className="text-sm font-bold text-[#2D362E] uppercase tracking-wider border-b border-[#EAE7E0] pb-2 flex items-center justify-between">
                <span>Evaluated Properties ({properties.length})</span>
                {touredCount > 0 && (
                  <span className="text-xs text-[#606C5D] font-normal">
                    Est. Total Renovation Needed: <strong className="text-[#C18C5D] font-bold">{formatUSD(totalEstimatedReno)}</strong>
                  </span>
                )}
              </h3>

              {properties.map((property, index) => {
                const loanAmt = Math.max(0, property.price - profile.downPaymentSavings);
                const estPI = calculateMonthlyPI(loanAmt, profile.interestRate, profile.loanTermYears);
                const propTax = Math.round(property.propertyTaxAnnual / 12);
                const homeIns = Math.round(profile.annualHomeInsurance / 12);
                const totalMonthly = estPI + propTax + homeIns + property.hoaMonthly;
                const pricePerSqft = property.sqft ? Math.round(property.price / property.sqft) : 0;
                const sc = property.scorecard;

                return (
                  <div 
                    key={property.id} 
                    className={`bg-white rounded-2xl border border-[#EAE7E0] p-5 sm:p-6 space-y-5 shadow-xs ${
                      index > 0 ? "page-break pt-6" : ""
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE7E0] pb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#4A5D4E] text-white uppercase">
                            {property.status.replace("_", " ")}
                          </span>
                          {property.isFavorite && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Favorite
                            </span>
                          )}
                          <span className="text-xs text-[#606C5D] font-medium">MLS #{property.mlsNumber || "N/A"}</span>
                        </div>
                        <h4 className="text-xl font-serif font-bold text-[#2D362E]">{property.title}</h4>
                        <p className="text-xs text-[#606C5D] flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#C18C5D]" />
                          <span>{property.address}, {property.city}, {property.county ? `${property.county} County, ` : ""}{property.state} {property.zip}</span>
                        </p>
                      </div>

                      <div className="sm:text-right bg-[#FAF9F5] p-3 rounded-2xl border border-[#EAE7E0] shrink-0">
                        <div className="text-2xl font-serif font-bold text-[#4A5D4E]">{formatUSD(property.price)}</div>
                        <div className="text-xs font-bold text-[#2D362E]">{pricePerSqft > 0 ? `$${pricePerSqft}/sqft` : "Residential"}</div>
                        <div className="text-[10px] text-[#606C5D]">{property.daysOnMarket || 0} Days on Market</div>
                      </div>
                    </div>

                    {/* Property Specs & Overlays Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#EAE7E0]">
                        <span className="text-[10px] text-[#9A9488] font-bold uppercase block">Specs</span>
                        <span className="font-bold text-[#2D362E]">{property.beds} Beds • {property.baths} Baths</span>
                        <span className="text-[11px] text-[#606C5D] block">{property.sqft} sqft • Built {property.yearBuilt}</span>
                      </div>

                      <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#EAE7E0]">
                        <span className="text-[10px] text-[#9A9488] font-bold uppercase block">Property Tax & Escrows</span>
                        <span className="font-bold text-[#4A5D4E]">Tax: {formatUSD(property.propertyTaxAnnual)}/yr</span>
                        <span className="text-[11px] text-[#606C5D] block">Est. Tax: ~${propTax}/mo</span>
                      </div>

                      <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#EAE7E0]">
                        <span className="text-[10px] text-[#9A9488] font-bold uppercase block">HOA & Association</span>
                        <span className="font-bold text-[#2D362E]">{property.hoaMonthly > 0 ? `${formatUSD(property.hoaMonthly)}/mo HOA` : "No HOA"}</span>
                        <span className="text-[11px] text-[#606C5D] block">Single Family Residence</span>
                      </div>

                      <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#EAE7E0]">
                        <span className="text-[10px] text-[#9A9488] font-bold uppercase block">Listing Agent</span>
                        <span className="font-bold text-[#2D362E]">{property.listingAgent?.name || "Agent Unspecified"}</span>
                        <span className="text-[11px] text-[#606C5D] block">{property.listingAgent?.phone || "N/A"}</span>
                      </div>
                    </div>

                    {/* DPA & Overlay Badges */}
                    <div className="flex items-center gap-2 flex-wrap text-[11px]">
                      {isLakeviewNationalEligible(property) && (
                        <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 font-bold border border-blue-300">
                          ✓ Lakeview National Eligible
                        </span>
                      )}
                      {isUsdaEligible(property) && (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-bold border border-emerald-300">
                          ✓ USDA RD 100% Financing Eligible
                        </span>
                      )}
                      {isLmiEligible(property) && (
                        <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 font-bold border border-blue-300">
                          ✓ Flex Lending / LMI Eligible
                        </span>
                      )}
                      {isTargetedArea(property) && (
                        <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-900 font-bold border border-purple-300">
                          ✓ OHCS Targeted Area (Higher Cap)
                        </span>
                      )}
                      {isFirstHomePriceEligible(property) && (
                        <span className="px-2.5 py-1 rounded-lg bg-[#FAF9F5] text-[#4A5D4E] font-bold border border-[#EAE7E0]">
                          ✓ OHCS Purchase Price Cap Eligible
                        </span>
                      )}
                    </div>

                    {/* TOUR SCORECARD SECTION */}
                    {sc ? (
                      <div className="bg-[#FAF9F5] rounded-2xl p-4 sm:p-5 border border-[#EAE7E0] space-y-4">
                        <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-9 h-9 rounded-2xl bg-[#4A5D4E] text-white flex items-center justify-center font-serif font-bold text-base shadow-xs">
                              {sc.grade}
                            </span>
                            <div>
                              <h5 className="font-bold text-xs text-[#2D362E] uppercase tracking-wider">On-Site Tour Scorecard</h5>
                              <p className="text-[11px] text-[#606C5D]">
                                Overall Rating: <strong className="text-[#4A5D4E]">{sc.overallRating}/10</strong> {property.tourDate ? `• Toured on ${property.tourDate}` : ""}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-[#9A9488] font-bold uppercase block">Est. Renovation Needed</span>
                            <span className="text-sm font-bold text-[#C18C5D]">{formatUSD(sc.estimatedRenovationCost)}</span>
                          </div>
                        </div>

                        {/* 9 Category Score Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          {[
                            { label: "Roof & Exterior", score: sc.roofAndExterior },
                            { label: "Foundation & Structure", score: sc.foundationAndStructure },
                            { label: "HVAC & Electrical", score: sc.hvacAndElectrical },
                            { label: "Plumbing & Water", score: sc.plumbingAndWaterPressure },
                            { label: "Kitchen & Baths", score: sc.kitchenAndBathrooms },
                            { label: "Layout & Light", score: sc.layoutAndNaturalLight },
                            { label: "Neighborhood & Safety", score: sc.neighborhoodAndSafety },
                            { label: "Parking & Access", score: sc.parkingAndAccess },
                            { label: "Noise & Surroundings", score: sc.noiseAndSurroundings },
                          ].map((item, idx) => (
                            <div key={idx} className="bg-white p-2.5 rounded-xl border border-[#EAE7E0] flex items-center justify-between">
                              <span className="text-[#606C5D] text-[11px] font-medium">{item.label}</span>
                              <div className="flex items-center gap-1.5">
                                <div className="w-16 h-2 bg-[#EAE7E0] rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${item.score >= 8 ? 'bg-emerald-600' : item.score >= 5 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                    style={{ width: `${(item.score / 10) * 100}%` }}
                                  />
                                </div>
                                <span className="font-bold text-[#2D362E] text-xs w-6 text-right">{item.score}/10</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Red Flags & Positives */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-200/60 space-y-1">
                            <span className="font-bold text-rose-900 text-[11px] flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Structural Red Flags ({sc.redFlags?.length || 0})
                            </span>
                            {sc.redFlags && sc.redFlags.length > 0 ? (
                              <ul className="list-disc list-inside text-rose-800 text-[11px] space-y-0.5">
                                {sc.redFlags.map((rf, rIdx) => (
                                  <li key={rIdx}>{rf}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-rose-700/70 text-[11px] italic">No structural red flags identified.</p>
                            )}
                          </div>

                          <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200/60 space-y-1">
                            <span className="font-bold text-emerald-900 text-[11px] flex items-center gap-1">
                              <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" /> Positive Highlights ({sc.positives?.length || 0})
                            </span>
                            {sc.positives && sc.positives.length > 0 ? (
                              <ul className="list-disc list-inside text-emerald-800 text-[11px] space-y-0.5">
                                {sc.positives.map((p, pIdx) => (
                                  <li key={pIdx}>{p}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-emerald-700/70 text-[11px] italic">No highlights recorded.</p>
                            )}
                          </div>
                        </div>

                        {/* Buyer Notes */}
                        {property.notes && (
                          <div className="bg-white p-3 rounded-xl border border-[#EAE7E0] text-xs space-y-1">
                            <span className="text-[10px] text-[#9A9488] font-bold uppercase block">Homebuyer Tour Notes</span>
                            <p className="text-[#2D362E] text-[11px] italic leading-relaxed">{property.notes}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#EAE7E0] text-xs text-[#606C5D] italic">
                        No on-site tour scorecard recorded yet for this property.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Side-by-Side Comparison Matrix Table */}
            {properties.length > 1 && (
              <div className="space-y-4 page-break pt-4 border-t-2 border-[#4A5D4E]">
                <h3 className="text-sm font-bold text-[#2D362E] uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#4A5D4E]" />
                  <span>Side-by-Side Property Matrix</span>
                </h3>
                <div className="overflow-x-auto rounded-2xl border border-[#EAE7E0]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#FAF9F5] text-[#9A9488] uppercase text-[10px] font-bold border-b border-[#EAE7E0]">
                      <tr>
                        <th className="p-3">Property</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Est. Monthly</th>
                        <th className="p-3">Price/SqFt</th>
                        <th className="p-3">Beds / Baths / SqFt</th>
                        <th className="p-3">Tour Grade</th>
                        <th className="p-3">Est. Reno Cost</th>
                        <th className="p-3">Lakeview / USDA / LMI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE7E0]">
                      {properties.map(p => {
                        const loanAmt = Math.max(0, p.price - profile.downPaymentSavings);
                        const estPI = calculateMonthlyPI(loanAmt, profile.interestRate, profile.loanTermYears);
                        const totalMonthly = estPI + Math.round(p.propertyTaxAnnual / 12) + Math.round(profile.annualHomeInsurance / 12) + p.hoaMonthly;
                        return (
                          <tr key={p.id} className="hover:bg-[#FAF9F5]">
                            <td className="p-3 font-bold text-[#2D362E]">{p.title}</td>
                            <td className="p-3 font-bold text-[#4A5D4E]">{formatUSD(p.price)}</td>
                            <td className="p-3 font-bold text-[#2D362E]">{formatUSD(totalMonthly)}/mo</td>
                            <td className="p-3 text-[#606C5D]">${Math.round(p.price / p.sqft)}</td>
                            <td className="p-3 text-[#606C5D]">{p.beds}b / {p.baths}ba / {p.sqft}sf</td>
                            <td className="p-3">
                              {p.scorecard ? (
                                <span className="font-bold text-[#4A5D4E]">
                                  {p.scorecard.grade} ({p.scorecard.overallRating}/10)
                                </span>
                              ) : (
                                <span className="text-[#9A9488] italic">Unscored</span>
                              )}
                            </td>
                            <td className="p-3 text-[#C18C5D] font-medium">
                              {p.scorecard ? formatUSD(p.scorecard.estimatedRenovationCost) : "N/A"}
                            </td>
                            <td className="p-3">
                              <span className="text-[10px] font-bold text-emerald-800">
                                {isLakeviewNationalEligible(p) ? "Lakeview " : ""}{isUsdaEligible(p) ? "USDA " : ""}{isLmiEligible(p) ? "LMI" : ""}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Document Footer Disclaimer */}
            <div className="border-t border-[#EAE7E0] pt-4 text-[10px] text-[#9A9488] space-y-1 text-center">
              <p className="font-bold text-[#2D362E]">Oregon Housing & Community Services (OHCS) First-Homebuyer Screening Aid</p>
              <p>
                This report aggregates saved properties, user tour scorecards, and estimated mortgage calculations. Rates and payments are estimates and subject to underwriting, appraisal, and lender approval. NMLS #192840.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-white p-4 border-t border-[#EAE7E0] flex items-center justify-between shrink-0 no-print">
          <span className="text-xs text-[#606C5D]">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'} ready for PDF download
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="px-4 py-2 bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" />
              <span>{isExporting ? "Exporting..." : "Save PDF"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
