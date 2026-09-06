import React, { useState } from "react";
import { 
  Building, 
  Plus, 
  Star, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  SlidersHorizontal, 
  Eye, 
  ArrowRight,
  Sparkles,
  Layers,
  X,
  ExternalLink,
  FileDown,
  FileSpreadsheet,
  TrendingUp,
  Clock,
  Mail,
  Footprints,
  Map as MapIcon,
  Compass,
  LayoutGrid,
  Bell,
  BellRing
} from "lucide-react";
import { PropertyListing, FinancialProfile } from "../types";
import { calculateMonthlyPI, formatUSD } from "../utils/mortgageMath";
import { calculateMockWalkScore } from "../utils/walkScoreUtils";
import { 
  hasAuthenticPropertyPhoto, 
  getListingOverlayBadges,
  calculateOverlayCounts,
  isLakeviewNationalEligible,
  isUsdaEligible,
  isLmiEligible,
  isLmiUsdaDual,
  isTargetedArea,
  isNonTargetedArea,
  isFirstHomePriceEligible,
  getZillowUrl
} from "../utils/overlayClassification";
import { getPropertyOhcsPriceLimit, OREGON_COUNTY_PRICE_LIMITS } from "../utils/ohcsPurchaseLimits";
import { ScreeningDisclaimerBanner } from "./ScreeningDisclaimerBanner";
import { EmailOutreachModal } from "./EmailOutreachModal";
import { PropertyReportModal } from "./PropertyReportModal";
import { ShareViaEmailModal } from "./ShareViaEmailModal";
import { PropertyMapOverlay } from "./PropertyMapOverlay";
import { PropertyCard } from "./PropertyCard";
import { ROADMAP_MILESTONES, DOCUMENT_VAULT_ITEMS } from "../data/initialData";
import { RoadmapMilestone, DocumentItem, LoanOfficerProfile, RealEstateAgentProfile } from "../types";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface PropertyTrackerProps {
  properties: PropertyListing[];
  setProperties: React.Dispatch<React.SetStateAction<PropertyListing[]>>;
  profile: FinancialProfile;
  milestones?: RoadmapMilestone[];
  documents?: DocumentItem[];
  loanOfficer?: LoanOfficerProfile;
  activeAgent?: RealEstateAgentProfile;
  onOpenScorecard: (property: PropertyListing) => void;
  onOpenNewModal: () => void;
  onAskAiAboutProperty: (property: PropertyListing) => void;
}

export const PropertyTracker: React.FC<PropertyTrackerProps> = ({
  properties,
  setProperties,
  profile,
  milestones = ROADMAP_MILESTONES,
  documents = DOCUMENT_VAULT_ITEMS,
  loanOfficer,
  activeAgent,
  onOpenScorecard,
  onOpenNewModal,
  onAskAiAboutProperty,
}) => {
  const [viewMode, setViewMode] = useState<"cards" | "map">("map");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [overlayFilter, setOverlayFilter] = useState<string>("all");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showShareViaEmailModal, setShowShareViaEmailModal] = useState(false);
  const [showPdfReportModal, setShowPdfReportModal] = useState(false);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [sortBy, setSortBy] = useState("added");
  const [sortOrder, setSortOrder] = useState("desc");
  const [toastMessage, setToastMessage] = useState<{title: string, body: React.ReactNode, type: 'up' | 'down' | 'success'} | null>(null);

  // Mock Price Updates for Price Alerts
  React.useEffect(() => {
    const interval = setInterval(() => {
      setProperties(prev => {
        let changed = false;
        const updated = prev.map(p => {
          if (p.priceAlertEnabled && Math.random() > 0.7) { // 30% chance to change price every interval
            changed = true;
            const changePercent = (Math.random() * 0.05) - 0.025; // -2.5% to +2.5%
            const newPrice = Math.round(p.price * (1 + changePercent));
            if (newPrice !== p.price) {
              const diff = newPrice - p.price;
              const type = diff > 0 ? 'up' : 'down';
              const diffFormatted = Math.abs(diff).toLocaleString();
              setToastMessage({
                title: 'Price Alert Triggered',
                body: `${p.title} has ${type === 'up' ? 'increased' : 'dropped'} by $${diffFormatted}!`,
                type
              });
              
              // auto hide toast
              setTimeout(() => {
                setToastMessage(null);
              }, 5000);

              return { ...p, previousPrice: p.price, price: newPrice };
            }
          }
          return p;
        });
        return changed ? updated : prev;
      });
    }, 10000); // Check every 10 seconds for demo purposes
    
    return () => clearInterval(interval);
  }, [setProperties]);

  const showExportSuccessToast = (type: 'CSV' | 'PDF') => {
    const agentName = activeAgent?.name || loanOfficer?.name || "Kanndice McLean";
    const agentEmail = activeAgent?.email || loanOfficer?.email || "kanndice@thecooleygroup.com";
    const agentPhone = activeAgent?.phone || loanOfficer?.phone || "555-0123";
    const agentBrokerage = activeAgent?.brokerage || "The Cooley Group";

    setToastMessage({
      title: `${type} Download Complete`,
      type: 'success',
      body: (
        <>
          <p>Your property tracker has been saved successfully.</p>
          <p className="mt-2 text-[#4A5D4E] font-medium border-t border-[#EAE7E0] pt-2">
            For more property specific details on your curated saved list today, reach out to <strong>{agentName}</strong> @ {agentBrokerage}.
          </p>
          <div className="flex items-center gap-3 mt-2 font-bold text-[#2D362E]">
            <a href={`mailto:${agentEmail}`} className="flex items-center gap-1 hover:text-[#C18C5D] transition-colors">
              <Mail className="w-3.5 h-3.5" />
              {agentEmail}
            </a>
            <a href={`tel:${agentPhone}`} className="flex items-center gap-1 hover:text-[#C18C5D] transition-colors">
              <Phone className="w-3.5 h-3.5" />
              {agentPhone}
            </a>
          </div>
        </>
      )
    });
    
    // Auto-dismiss after a longer time so they can read and click
    setTimeout(() => {
      setToastMessage(null);
    }, 12000);
  };

  const handleExportCSV = () => {
    const listToExport = selectedPropertyIds.length > 0 
      ? filtered.filter(p => selectedPropertyIds.includes(p.id)) 
      : filtered;

    if (listToExport.length === 0) {
      alert("No properties found to export.");
      return;
    }

    const headers = [
      "Property Title",
      "Address",
      "City",
      "County",
      "State",
      "Zip Code",
      "Status",
      "Property Type",
      "Price ($)",
      "Est. Monthly Payment ($)",
      "Bedrooms",
      "Bathrooms",
      "Square Feet",
      "Price per SqFt ($)",
      "Year Built",
      "Days on Market",
      "HOA Monthly ($)",
      "Property Tax Annual ($)",
      "Favorite",
      "Tour Date",
      "Overall Tour Grade",
      "Overall Scorecard Rating (1-10)",
      "Roof & Exterior (1-10)",
      "Foundation & Structure (1-10)",
      "HVAC & Electrical (1-10)",
      "Plumbing & Water Pressure (1-10)",
      "Kitchen & Bathrooms (1-10)",
      "Layout & Natural Light (1-10)",
      "Neighborhood & Safety (1-10)",
      "Parking & Access (1-10)",
      "Noise & Surroundings (1-10)",
      "Est. Renovation Cost ($)",
      "Structural Red Flags",
      "Positive Highlights",
      "Notes",
      "Listing Agent Name",
      "Listing Agent Email",
      "Listing Agent Phone",
      "MLS Number",
      "Lakeview National Eligible",
      "USDA Eligible",
      "Flex Lending / LMI Eligible",
      "OHCS Targeted Area"
    ].join(",");

    const escapeCsv = (val: any) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = listToExport.map(p => {
      const loanAmt = Math.max(0, p.price - profile.downPaymentSavings);
      const estPI = calculateMonthlyPI(loanAmt, profile.interestRate, profile.loanTermYears);
      const estMonthly = estPI + Math.round(p.propertyTaxAnnual / 12) + Math.round(profile.annualHomeInsurance / 12) + p.hoaMonthly;
      const pricePerSqft = p.sqft ? Math.round(p.price / p.sqft) : "";

      const sc = p.scorecard;
      const overallGrade = sc?.grade || "N/A";
      const overallRating = sc?.overallRating !== undefined ? sc.overallRating : "N/A";
      const roofExterior = sc?.roofAndExterior !== undefined ? sc.roofAndExterior : "N/A";
      const foundationStructure = sc?.foundationAndStructure !== undefined ? sc.foundationAndStructure : "N/A";
      const hvacElectrical = sc?.hvacAndElectrical !== undefined ? sc.hvacAndElectrical : "N/A";
      const plumbingWater = sc?.plumbingAndWaterPressure !== undefined ? sc.plumbingAndWaterPressure : "N/A";
      const kitchenBaths = sc?.kitchenAndBathrooms !== undefined ? sc.kitchenAndBathrooms : "N/A";
      const layoutLight = sc?.layoutAndNaturalLight !== undefined ? sc.layoutAndNaturalLight : "N/A";
      const neighborhoodSafety = sc?.neighborhoodAndSafety !== undefined ? sc.neighborhoodAndSafety : "N/A";
      const parkingAccess = sc?.parkingAndAccess !== undefined ? sc.parkingAndAccess : "N/A";
      const noiseSurroundings = sc?.noiseAndSurroundings !== undefined ? sc.noiseAndSurroundings : "N/A";
      const renoCost = sc?.estimatedRenovationCost !== undefined ? sc.estimatedRenovationCost : "N/A";
      const redFlagsStr = sc?.redFlags && sc.redFlags.length > 0 ? sc.redFlags.join("; ") : "None";
      const positivesStr = sc?.positives && sc.positives.length > 0 ? sc.positives.join("; ") : "None";

      return [
        escapeCsv(p.title),
        escapeCsv(p.address),
        escapeCsv(p.city),
        escapeCsv(p.county || ""),
        escapeCsv(p.state),
        escapeCsv(p.zip),
        escapeCsv(p.status),
        escapeCsv(p.propertyType),
        p.price,
        estMonthly,
        p.beds,
        p.baths,
        p.sqft,
        pricePerSqft,
        p.yearBuilt || "",
        p.daysOnMarket !== undefined ? p.daysOnMarket : "",
        p.hoaMonthly || 0,
        p.propertyTaxAnnual || 0,
        p.isFavorite ? "Yes" : "No",
        escapeCsv(p.tourDate || ""),
        escapeCsv(overallGrade),
        overallRating,
        roofExterior,
        foundationStructure,
        hvacElectrical,
        plumbingWater,
        kitchenBaths,
        layoutLight,
        neighborhoodSafety,
        parkingAccess,
        noiseSurroundings,
        renoCost,
        escapeCsv(redFlagsStr),
        escapeCsv(positivesStr),
        escapeCsv(p.notes || ""),
        escapeCsv(p.listingAgent?.name || ""),
        escapeCsv(p.listingAgent?.email || ""),
        escapeCsv(p.listingAgent?.phone || ""),
        escapeCsv(p.mlsNumber || ""),
        isUsdaEligible(p) ? 'Yes' : 'No',
        isLmiEligible(p) ? 'Yes' : 'No',
        isTargetedArea(p) ? 'Yes' : 'No'
      ].join(",");
    });

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Property-Tour-Scorecards-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showExportSuccessToast('CSV');
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById("property-report-content");
      if (!element) return;
      
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("Property-Pipeline-Report.pdf");
      showExportSuccessToast('PDF');
    } catch (error) {
      console.error("Failed to export PDF", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProperties(prev =>
      prev.map(p => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

  const togglePriceAlert = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProperties(prev =>
      prev.map(p => {
        if (p.id === id) {
          const isEnabled = !p.priceAlertEnabled;
          if (isEnabled) {
            // Optional: You could show a quick toast saying "Alerts enabled for this property" here
            console.log("Price alerts enabled for", p.id);
          }
          return { ...p, priceAlertEnabled: isEnabled, previousPrice: p.price };
        }
        return p;
      })
    );
  };

  const allAlertsEnabled = properties.length > 0 && properties.every(p => p.priceAlertEnabled);

  const toggleAllAlerts = () => {
    const turnOn = !allAlertsEnabled;
    setProperties(prev => prev.map(p => ({
      ...p,
      priceAlertEnabled: turnOn,
      previousPrice: p.price
    })));
    
    setToastMessage({
      title: turnOn ? 'Master Alerts Enabled' : 'Master Alerts Disabled',
      body: turnOn ? 'Price alerts are now active for all properties.' : 'Price alerts have been paused.',
      type: turnOn ? 'down' : 'up'
    });
    
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  const deleteProperty = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to remove this property from your pipeline?")) {
      setProperties(prev => prev.filter(p => p.id !== id));
      setCompareIds(prev => prev.filter(cid => cid !== id));
    }
  };

  const toggleCompare = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (compareIds.includes(id)) {
      setCompareIds(prev => prev.filter(cid => cid !== id));
    } else {
      if (compareIds.length >= 3) {
        alert("You can compare up to 3 properties at a time.");
        return;
      }
      setCompareIds(prev => [...prev, id]);
    }
  };

  const overlayCounts = calculateOverlayCounts(properties);

  const filtered = properties.filter(p => {
    // 1. Status Filter
    if (filterStatus === "favorites" && !p.isFavorite) return false;
    if (filterStatus === "alerts" && !p.priceAlertEnabled) return false;
    if (filterStatus === "consideration" && p.status !== "saved" && p.status !== "touring") return false;
    if (filterStatus === "offered" && p.status !== "offered" && p.status !== "under_contract") return false;
    if (filterStatus === "archived" && p.status !== "passed") return false;

    // 2. Overlay Filter
    if (overlayFilter === "usda" && !isUsdaEligible(p)) return false;
    if (overlayFilter === "lmi" && !isLmiEligible(p)) return false;
    if (overlayFilter === "lmi_usda" && !isLmiUsdaDual(p)) return false;
    if (overlayFilter === "targeted" && !isTargetedArea(p)) return false;
    if (overlayFilter === "non_targeted" && !isNonTargetedArea(p)) return false;
    if (overlayFilter === "price_eligible" && !isFirstHomePriceEligible(p)) return false;

    return true;
  }).sort((a, b) => {
    let comparison = 0;
    if (sortBy === "price") {
      comparison = a.price - b.price;
    } else if (sortBy === "dom") {
      comparison = (a.daysOnMarket || 0) - (b.daysOnMarket || 0);
    } else {
      // Default to added date (assuming higher ID or syncedAt means newer, for mock data we can sort by id if syncedAt missing)
      const dateA = a.syncedAt ? new Date(a.syncedAt).getTime() : a.id.localeCompare(b.id);
      const dateB = b.syncedAt ? new Date(b.syncedAt).getTime() : 0;
      comparison = (dateA > dateB) ? 1 : -1;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const comparedProperties = properties.filter(p => compareIds.includes(p.id));

  // KPI Calculations
  const kpiStats = React.useMemo(() => {
    if (filtered.length === 0) return { totalVolume: 0, avgDom: 0, activeListings: 0 };
    const totalVolume = filtered.reduce((sum, p) => sum + p.price, 0);
    const totalDom = filtered.reduce((sum, p) => sum + (p.daysOnMarket || 0), 0);
    const activeListings = filtered.length;
    return {
      totalVolume,
      activeListings,
      avgDom: Math.round(totalDom / activeListings)
    };
  }, [filtered]);

  const agentDistribution = React.useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach(p => {
      if (p.listingAgent?.name) {
        counts[p.listingAgent.name] = (counts[p.listingAgent.name] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [filtered]);

  return (
    <div className="space-y-8 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`bg-white border-l-4 rounded-xl shadow-2xl p-4 flex items-start gap-3 w-80 sm:w-96 border-t border-r border-b border-t-[#EAE7E0] border-r-[#EAE7E0] border-b-[#EAE7E0]`} style={{ borderLeftColor: toastMessage.type === 'up' ? '#EF4444' : toastMessage.type === 'down' ? '#10B981' : '#4A5D4E' }}>
            {toastMessage.type === 'up' ? (
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-red-500" />
              </div>
            ) : toastMessage.type === 'down' ? (
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <FileDown className="w-4 h-4 text-emerald-500" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#ECFDF5] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
            )}
            <div className="flex-1">
              <h4 className="font-bold text-sm text-[#2D362E]">{toastMessage.title}</h4>
              <div className="text-xs text-[#606C5D] mt-0.5 space-y-2">{toastMessage.body}</div>
            </div>
            <button 
              onClick={() => setToastMessage(null)}
              className="ml-auto text-[#9A9488] hover:text-[#2D362E] transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Header & Pipeline Controls */}
      <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1EFE9] text-[#4A5D4E] text-xs font-semibold border border-[#EAE7E0]">
              <Building className="w-3.5 h-3.5" />
              <span>Property Tour & Scorecard Tracker</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D362E]">
              Your Target Homes & Tour Audits
            </h2>
            <p className="text-xs sm:text-sm text-[#606C5D]">
              Evaluate real properties, record structural tour scorecards on-site, and run side-by-side affordability comparisons.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={toggleAllAlerts}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border font-semibold text-xs shadow-sm transition-all cursor-pointer ${
                allAlertsEnabled 
                  ? "bg-[#ECFDF5] border-emerald-500 text-emerald-700 hover:bg-[#D1FAE5]" 
                  : "bg-white border-[#EAE7E0] text-[#606C5D] hover:text-[#2D362E] hover:bg-stone-50"
              }`}
              title={allAlertsEnabled ? "Disable price alerts for all properties" : "Enable price alerts for all properties"}
            >
              {allAlertsEnabled ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              <span>{allAlertsEnabled ? "Alerts On" : "Alerts Off"}</span>
            </button>
            <button
              onClick={() => setShowShareViaEmailModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#4A5D4E] text-[#4A5D4E] hover:bg-[#F9F8F4] font-semibold text-xs shadow-sm transition-all cursor-pointer hover:scale-105"
              title="Share your saved properties & roadmap via email"
            >
              <Mail className="w-4 h-4 text-[#4A5D4E]" />
              <span>Share Plan & Homes</span>
            </button>
            <button
              onClick={() => setShowEmailModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#C18C5D] text-[#C18C5D] hover:bg-[#C18C5D] hover:text-white font-semibold text-xs shadow-sm transition-all"
            >
              <Mail className="w-4 h-4" />
              <span>Email Agents {selectedPropertyIds.length > 0 ? `(${selectedPropertyIds.length})` : ""}</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#EAE7E0] hover:bg-stone-50 text-[#606C5D] hover:text-[#2D362E] font-semibold text-xs shadow-sm transition-all cursor-pointer"
              title="Download complete property tour & scorecard CSV report"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#4A5D4E]" />
              <span>Download CSV</span>
            </button>
            <button
              onClick={() => setShowPdfReportModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#4A5D4E] text-white hover:bg-[#38463B] font-semibold text-xs shadow-sm transition-all cursor-pointer hover:scale-105"
              title="Save printable PDF property audit & tour scorecard report"
            >
              <FileDown className="w-4 h-4 text-emerald-300" />
              <span>Save PDF {selectedPropertyIds.length > 0 ? `(${selectedPropertyIds.length})` : ""}</span>
            </button>
            {compareIds.length > 1 && (
              <button
                onClick={() => setShowCompareModal(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C18C5D] hover:bg-[#A87447] text-white font-semibold text-xs shadow-sm transition-all animate-pulse"
              >
                <Layers className="w-4 h-4" />
                <span>Compare Selected ({compareIds.length})</span>
              </button>
            )}

            <button
              onClick={onOpenNewModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white font-semibold text-xs shadow-sm transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Home</span>
            </button>
          </div>
        </div>

        {/* Primary View Mode Switcher: Google Maps Overlay vs Grid Cards */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-2 border-t border-[#EAE7E0]">
          <div className="flex items-center gap-1.5 p-1 bg-[#FAF9F5] rounded-2xl border border-[#EAE7E0]">
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "map"
                  ? "bg-[#4A5D4E] text-white shadow-2xs font-bold"
                  : "text-[#606C5D] hover:text-[#2D362E]"
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-300" />
              <span>Google Maps Overlay & Radius Search</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-400 text-stone-900 ml-1">
                Readiness & Amenities
              </span>
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "cards"
                  ? "bg-[#4A5D4E] text-white shadow-2xs font-bold"
                  : "text-[#606C5D] hover:text-[#2D362E]"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Pipeline Cards & Scorecards ({filtered.length})</span>
            </button>
          </div>

          <div className="text-xs text-[#606C5D] font-medium hidden sm:block">
            {viewMode === "map" ? (
              <span>Interactive radius search & amenity proximity view</span>
            ) : (
              <span>Detail list & on-site tour scorecard auditing</span>
            )}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#EAE7E0]">
          {[
            { id: "all", label: `All Pipeline (${properties.length})` },
            { id: "favorites", label: `Favorites (${properties.filter(p => p.isFavorite).length})` },
            { id: "alerts", label: `Price Alerts (${properties.filter(p => p.priceAlertEnabled).length})` },
            { id: "consideration", label: `Under Consideration (${properties.filter(p => p.status === "saved" || p.status === "touring").length})` },
            { id: "offered", label: `Offered / Contract (${properties.filter(p => p.status === "offered" || p.status === "under_contract").length})` },
            { id: "archived", label: `Archived (${properties.filter(p => p.status === "passed").length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterStatus === tab.id
                  ? "bg-[#F1EFE9] text-[#4A5D4E] border border-[#EAE7E0] font-bold"
                  : "bg-white text-[#606C5D] hover:text-[#2D362E] border border-[#EAE7E0]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* OHCS GIS Overlay Filter Row */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#EAE7E0]/60">
          <span className="text-[11px] font-bold text-[#606C5D] uppercase tracking-wider mr-1">Overlay Filter:</span>
          {[
            { id: "all", label: `All (${properties.length})` },
            { id: "lakeviewNational", label: `Lakeview (${overlayCounts.lakeviewNational})` },
            { id: "usda", label: `USDA RD (${overlayCounts.usda})` },
            { id: "lmi", label: `Flex Lending/LMI (${overlayCounts.lmi})` },
            { id: "lmi_usda", label: `USDA RD+Flex (${overlayCounts.lmiUsda})` },
            { id: "targeted", label: `Targeted Area Cap (${overlayCounts.targeted})` },
            { id: "non_targeted", label: `Non-Targeted Cap (${overlayCounts.nonTargeted})` },
            { id: "price_eligible", label: `Under Price Cap (${overlayCounts.firstHomePriceEligible})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setOverlayFilter(tab.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                overlayFilter === tab.id
                  ? "bg-[#4A5D4E] text-white shadow-2xs font-bold ring-2 ring-[#4A5D4E]/20"
                  : "bg-[#FAF9F5] text-[#606C5D] hover:bg-[#F1EFE9] border border-[#EAE7E0]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#EAE7E0]/60">
          <span className="text-[11px] font-bold text-[#606C5D] uppercase tracking-wider mr-1">Sort By:</span>
          {[
            { id: "added", label: "Added Date" },
            { id: "price", label: "Market Value" },
            { id: "dom", label: "Days on Market" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                if (sortBy === tab.id) {
                  setSortOrder(prev => prev === "asc" ? "desc" : "asc");
                } else {
                  setSortBy(tab.id);
                  setSortOrder("desc");
                }
              }}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                sortBy === tab.id
                  ? "bg-[#4A5D4E] text-white shadow-2xs font-bold ring-2 ring-[#4A5D4E]/20"
                  : "bg-[#FAF9F5] text-[#606C5D] hover:bg-[#F1EFE9] border border-[#EAE7E0]"
              }`}
            >
              {tab.label}
              {sortBy === tab.id && (
                <ArrowRight className={`w-3 h-3 transition-transform ${sortOrder === "desc" ? "rotate-90" : "-rotate-90"}`} />
              )}
            </button>
          ))}
        </div>

        {/* Screening Aid Disclaimer Banner */}
        <ScreeningDisclaimerBanner variant="compact" />
      </div>

      {/* KPI Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-[#EAE7E0] p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#F1EFE9] rounded-xl text-[#4A5D4E]">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#9A9488] uppercase tracking-wider">Active Listings</p>
            <p className="text-2xl font-serif font-bold text-[#2D362E]">{kpiStats.activeListings}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#EAE7E0] p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#F1EFE9] rounded-xl text-[#4A5D4E]">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#9A9488] uppercase tracking-wider">Total Volume</p>
            <p className="text-2xl font-serif font-bold text-[#2D362E]">{formatUSD(kpiStats.totalVolume)}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#EAE7E0] p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#F1EFE9] rounded-xl text-[#4A5D4E]">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#9A9488] uppercase tracking-wider">Avg Days on Market</p>
            <p className="text-2xl font-serif font-bold text-[#2D362E]">{kpiStats.avgDom} Days</p>
          </div>
        </div>
      </div>

      {/* Google Maps Platform Overlay with Radius Search Visualization */}
      {viewMode === "map" && (
        <div className="mb-6">
          <PropertyMapOverlay
            properties={properties}
            profile={profile}
            onOpenScorecard={onOpenScorecard}
            onAskAiAboutProperty={onAskAiAboutProperty}
            compareIds={compareIds}
            onToggleCompare={toggleCompare}
            onCloseMap={() => setViewMode("cards")}
          />
        </div>
      )}

      <div id="property-report-content" className="p-4 bg-white/50 rounded-xl">
      {/* Listing Agent Distribution Chart */}
      {agentDistribution.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#EAE7E0] p-6 shadow-sm mb-6 mt-6">
          <div className="flex items-center gap-2 mb-6">
            <Building className="w-5 h-5 text-[#4A5D4E]" />
            <h3 className="font-serif text-lg font-bold text-[#2D362E]">Listing Agent Distribution</h3>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#606C5D' }} 
                  axisLine={{ stroke: '#EAE7E0' }}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#606C5D' }} 
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip 
                  cursor={{ fill: '#FAF9F5' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #EAE7E0', fontSize: '12px', padding: '8px 12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="count" fill="#4A5D4E" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Bulk Selection Controls */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between py-2 border-b border-[#EAE7E0]/60 mb-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-[#2D362E] cursor-pointer">
            <input 
              type="checkbox"
              className="w-4 h-4 rounded text-[#4A5D4E] focus:ring-[#4A5D4E]/20"
              checked={selectedPropertyIds.length === filtered.length && filtered.length > 0}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedPropertyIds(filtered.map(p => p.id));
                } else {
                  setSelectedPropertyIds([]);
                }
              }}
            />
            Select All ({filtered.length})
          </label>
          {selectedPropertyIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#4A5D4E] bg-[#4A5D4E]/10 px-2.5 py-1 rounded-md">
                {selectedPropertyIds.length} Selected
              </span>
              <button
                onClick={() => setShowPdfReportModal(true)}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#4A5D4E] text-white hover:bg-[#38463B] font-bold text-xs rounded-lg shadow-2xs transition-all cursor-pointer"
                title="Save PDF report for selected properties"
              >
                <FileDown className="w-3.5 h-3.5 text-emerald-300" />
                <span>Save PDF ({selectedPropertyIds.length})</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#4A5D4E]/30 text-[#4A5D4E] hover:bg-[#4A5D4E] hover:text-white font-bold text-xs rounded-lg shadow-2xs transition-all cursor-pointer"
                title="Download CSV report for selected properties"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Download Selected CSV ({selectedPropertyIds.length})</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Property Cards Grid */}
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible hide-scrollbar">
        {filtered.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            profile={profile}
            isSelectedForCompare={compareIds.includes(property.id)}
            isSelected={selectedPropertyIds.includes(property.id)}
            onToggleSelect={(id, checked) => {
              if (checked) {
                setSelectedPropertyIds(prev => [...prev, id]);
              } else {
                setSelectedPropertyIds(prev => prev.filter(selectedId => selectedId !== id));
              }
            }}
            onToggleFavorite={toggleFavorite}
            onTogglePriceAlert={togglePriceAlert}
            onDeleteProperty={deleteProperty}
            onOpenScorecard={onOpenScorecard}
            onAskAiAboutProperty={onAskAiAboutProperty}
            onToggleCompare={toggleCompare}
          />
        ))}
      </div>

      <EmailOutreachModal 
        isOpen={showEmailModal} 
        onClose={() => setShowEmailModal(false)} 
        properties={selectedPropertyIds.length > 0 ? filtered.filter(p => selectedPropertyIds.includes(p.id)) : filtered} 
      />

      <PropertyReportModal
        isOpen={showPdfReportModal}
        onClose={() => setShowPdfReportModal(false)}
        properties={selectedPropertyIds.length > 0 ? filtered.filter(p => selectedPropertyIds.includes(p.id)) : filtered}
        profile={profile}
      />

      {/* Side-by-Side Property Comparison Modal */}
      </div>
      {showCompareModal && comparedProperties.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#EAE7E0] rounded-3xl max-w-5xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-4">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#2D362E] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#4A5D4E]" />
                  <span>Side-by-Side Property Comparison</span>
                </h3>
                <p className="text-xs text-[#606C5D]">Comparing key financial, structural, and livability metrics.</p>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="p-2 rounded-xl bg-[#F1EFE9] text-[#606C5D] hover:text-[#2D362E] border border-[#EAE7E0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#EAE7E0]">
                    <th className="p-3 text-[#9A9488] font-semibold w-40">Attribute</th>
                    {comparedProperties.map(p => (
                      <th key={p.id} className="p-3 text-[#2D362E] font-bold">
                        {p.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE7E0]">
                  <tr>
                    <td className="p-3 text-[#606C5D]">Purchase Price</td>
                    {comparedProperties.map(p => (
                      <td key={p.id} className="p-3 font-bold text-[#4A5D4E] text-sm">
                        {formatUSD(p.price)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 text-[#606C5D]">Est. Monthly (P&I+Tax+Ins+HOA)</td>
                    {comparedProperties.map(p => {
                      const loanAmt = Math.max(0, p.price - profile.downPaymentSavings);
                      const estPI = calculateMonthlyPI(loanAmt, profile.interestRate, profile.loanTermYears);
                      const total = estPI + Math.round(p.propertyTaxAnnual / 12) + Math.round(profile.annualHomeInsurance / 12) + p.hoaMonthly;
                      return (
                        <td key={p.id} className="p-3 font-bold text-[#2D362E]">
                          {formatUSD(total)}/mo
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="p-3 text-[#606C5D]">Price per SqFt</td>
                    {comparedProperties.map(p => (
                      <td key={p.id} className="p-3 text-[#2D362E]">
                        ${Math.round(p.price / p.sqft)}/sqft
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 text-[#606C5D]">Beds / Baths / SqFt</td>
                    {comparedProperties.map(p => (
                      <td key={p.id} className="p-3 text-[#2D362E]">
                        {p.beds} Beds • {p.baths} Baths • {p.sqft} sqft
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 text-[#606C5D]">Year Built</td>
                    {comparedProperties.map(p => (
                      <td key={p.id} className="p-3 text-[#2D362E]">
                        {p.yearBuilt} ({new Date().getFullYear() - p.yearBuilt} yrs old)
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 text-[#606C5D]">Monthly HOA Fee</td>
                    {comparedProperties.map(p => (
                      <td key={p.id} className={`p-3 font-semibold ${p.hoaMonthly > 0 ? "text-[#C18C5D]" : "text-[#4A5D4E]"}`}>
                        {p.hoaMonthly > 0 ? `${formatUSD(p.hoaMonthly)}/mo` : "$0 (No HOA)"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 text-[#606C5D]">Annual Property Tax</td>
                    {comparedProperties.map(p => (
                      <td key={p.id} className="p-3 text-[#2D362E]">
                        {formatUSD(p.propertyTaxAnnual)}/yr
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 text-[#606C5D]">Walk Score®</td>
                    {comparedProperties.map(p => {
                      const walk = calculateMockWalkScore(p.address, p.city, p.zip, p.walkScore);
                      return (
                        <td key={p.id} className="p-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold border ${walk.badgeBg} ${walk.badgeText} ${walk.badgeBorder}`}>
                            <Footprints className="w-3 h-3 shrink-0" />
                            <span className={`px-1 py-0.2 rounded text-[10px] font-mono font-extrabold ${walk.badgePillBg}`}>{walk.score}</span>
                            <span>{walk.category}</span>
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="p-3 text-[#606C5D]">Tour Scorecard Grade</td>
                    {comparedProperties.map(p => (
                      <td key={p.id} className="p-3">
                        {p.scorecard ? (
                          <span className="px-2 py-0.5 rounded font-bold bg-[#F1EFE9] text-[#4A5D4E] border border-[#EAE7E0]">
                            Grade {p.scorecard.grade} ({p.scorecard.overallRating}/10)
                          </span>
                        ) : (
                          <span className="text-[#9A9488]">Not scored</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 text-[#606C5D]">Est. Renovation Needed</td>
                    {comparedProperties.map(p => (
                      <td key={p.id} className="p-3 text-[#2D362E]">
                        {p.scorecard ? formatUSD(p.scorecard.estimatedRenovationCost) : "Unknown"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 text-[#606C5D]">Live MLS / Zillow</td>
                    {comparedProperties.map(p => (
                      <td key={p.id} className="p-3">
                        <a
                          href={getZillowUrl(p)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors"
                        >
                          <span>Open on Zillow</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowCompareModal(false)}
                className="px-5 py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white font-semibold text-xs transition-colors shadow-sm"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Saved Properties & Roadmap via Email Modal */}
      <ShareViaEmailModal
        isOpen={showShareViaEmailModal}
        onClose={() => setShowShareViaEmailModal(false)}
        profile={profile}
        milestones={milestones}
        properties={properties}
        documents={documents}
        loanOfficer={loanOfficer}
        activeAgent={activeAgent}
      />
    </div>
  );
};
