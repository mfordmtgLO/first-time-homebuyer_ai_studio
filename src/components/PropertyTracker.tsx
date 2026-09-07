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
  Sparkles, Search, 
  Layers,
  X,
  ExternalLink,
  FileDown,
  FileSpreadsheet,
  TrendingUp,
  Clock,
  Mail, Phone,
  Footprints,
  Map as MapIcon, QrCode,
  Compass,
  Flame,
  LayoutGrid,
  Bell,
  BellRing,
  GraduationCap,
  ShoppingCart,
  Bus,
  TreePine,
  Share2
} from "lucide-react";
import { PropertyListing, FinancialProfile } from "../types";
import { calculateMonthlyPI, formatUSD } from "../utils/mortgageMath";
import { calculateMockWalkScore } from "../utils/walkScoreUtils";
import { calculateMockSchoolScore } from "../utils/schoolScoreUtils";
import { hasAmenity } from "../utils/amenitiesUtils";
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
import { PropertyCalculatorModal } from "./PropertyCalculatorModal";
import { SmartCompareAI } from "./SmartCompareAI";
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
  const [viewMode, setViewMode] = useState<"cards" | "map">("cards");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [overlayFilter, setOverlayFilter] = useState<string>("all");
  const [amenitiesFilter, setAmenitiesFilter] = useState<string>("all");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showShareViaEmailModal, setShowShareViaEmailModal] = useState(false);
  const [showPdfReportModal, setShowPdfReportModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [calculatorProperty, setCalculatorProperty] = useState<PropertyListing | null>(null);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [sortBy, setSortBy] = useState("added");
  const [sortOrder, setSortOrder] = useState("desc");
  const [toastMessage, setToastMessage] = useState<{title: string, body: React.ReactNode, type: 'up' | 'down' | 'success'} | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

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

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverId !== id) {
      setDragOverId(id);
    }
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      handleDragEnd();
      return;
    }

    setProperties(prev => {
      const newOrder = [...prev];
      const draggedIdx = newOrder.findIndex(p => p.id === draggedId);
      const targetIdx = newOrder.findIndex(p => p.id === targetId);
      
      if (draggedIdx !== -1 && targetIdx !== -1) {
        const [draggedItem] = newOrder.splice(draggedIdx, 1);
        newOrder.splice(targetIdx, 0, draggedItem);
      }
      return newOrder;
    });
    
    handleDragEnd();
  };

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
    
    // Agent Co-branding Notification Workflow
    const prop = properties.find(p => p.id === id);
    if (prop && !prop.isFavorite) {
      // It's being favorited
      alert(`🤖 SYSTEM AUTOMATION: SMS SENT TO CO-BRANDED PARTNER\n\nTo: Your Co-branded Agent (555-0199)\n\nMessage: "Hey Your Co-branded Agent, your buyer just Favorited ${prop.title} on their portal. Give them a call to schedule a tour!"`);
    }

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

  const handleShareList = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    if (filterStatus !== "all") params.set("status", filterStatus);
    if (overlayFilter !== "all") params.set("overlay", overlayFilter);
    if (amenitiesFilter !== "all") params.set("amenity", amenitiesFilter);
    if (sortBy !== "added") params.set("sort", sortBy);

    const shareUrl = `${baseUrl}?${params.toString()}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
      setToastMessage({
        title: "Link Copied!",
        body: "Shareable deep link copied to your clipboard.",
        type: "success"
      });
      setTimeout(() => {
        setToastMessage(null);
      }, 3000);
    }).catch(() => {
      alert("Failed to copy link. The URL is: " + shareUrl);
    });
  };

  const [isEmailingDashboard, setIsEmailingDashboard] = useState(false);

  const handleEmailDashboard = async () => {
    try {
      setIsEmailingDashboard(true);
      const res = await fetch("/api/dashboard/email-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: profile.email || "fordmj@gmail.com",
          profile,
          properties,
          milestones
        })
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage({
          title: "Dashboard Emailed Successfully!",
          body: `Your progress, milestones, and saved properties were bundled and sent to ${data.recipient}.`,
          type: "success"
        });
        setTimeout(() => setToastMessage(null), 6000);
      } else {
        alert(data.error || "Failed to email dashboard.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to server for emailing dashboard.");
    } finally {
      setIsEmailingDashboard(false);
    }
  };



  const [showMyMapsModal, setShowMyMapsModal] = useState(false);
  const [lastExportedKmlUrl, setLastExportedKmlUrl] = useState<string | null>(null);

  const handleExportKml = () => {
    const listToExport = selectedPropertyIds.length > 0 
      ? properties.filter(p => selectedPropertyIds.includes(p.id)) 
      : filtered;

    if (listToExport.length === 0) {
      alert("No properties available to export.");
      return;
    }

    // Build KML XML structure for Google My Maps
    let kmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    kmlContent += `<kml xmlns="http://www.opengis.net/kml/2.2">\n`;
    kmlContent += `  <Document>\n`;
    kmlContent += `    <name>First-Time Homebuyer Curated Property Map</name>\n`;
    kmlContent += `    <description>Curated properties with USDA/LMI eligibility, monthly payments, and co-branded loan officer contacts (Mike Ford &amp; Kanndice McLean).</description>\n`;

    listToExport.forEach((p, idx) => {
      const lat = p.lat || (45.5152 + (idx * 0.01));
      const lng = p.lng || (-122.6784 + (idx * 0.01));

      kmlContent += `    <Placemark>\n`;
      kmlContent += `      <name><![CDATA[${p.title} - $${p.price.toLocaleString()}]]></name>\n`;
      kmlContent += `      <description><![CDATA[\n`;
      kmlContent += `        <b>Address:</b> ${p.address}, ${p.city}, ${p.state} ${p.zip}<br/>\n`;
      kmlContent += `        <b>Price:</b> $${p.price.toLocaleString()}<br/>\n`;
      kmlContent += `        <b>Est. Monthly P&I:</b> $${p.monthlyPayment || Math.round(p.price * 0.0065)}/mo<br/>\n`;
      kmlContent += `        <b>Tour Grade:</b> ${p.tourGrade || 'B+'}<br/>\n`;
      kmlContent += `        <hr/>\n`;
      kmlContent += `        <b>Co-Branded Contact:</b><br/>\n`;
      kmlContent += `        • Loan Officer: Mike Ford (fordmj@gmail.com / 555-0199)<br/>\n`;
      kmlContent += `        • Real Estate Agent: Kanndice McLean<br/>\n`;
      kmlContent += `        <br/>\n`;
      kmlContent += `        <i>For more information on low or no down payment mortgage products matched for high confidence eligible areas, call Mike Ford. To get a personalized home search profile, reach out to Kanndice McLean.</i>\n`;
      kmlContent += `      ]]></description>\n`;
      kmlContent += `      <Point>\n`;
      kmlContent += `        <coordinates>${lng},${lat},0</coordinates>\n`;
      kmlContent += `      </Point>\n`;
      kmlContent += `    </Placemark>\n`;
    });

    kmlContent += `  </Document>\n`;
    kmlContent += `</kml>`;

    const blob = new Blob([kmlContent], { type: "application/vnd.google-earth.kml+xml" });
    const url = URL.createObjectURL(blob);
    setLastExportedKmlUrl(url);

    // Auto trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = `Homebuyer_Curated_Map_${Date.now()}.kml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setShowMyMapsModal(true);

    setToastMessage({
      title: "Google My Maps KML Exported!",
      body: `Successfully compiled ${listToExport.length} properties into a KML layer. Follow the 1-click import guide below.`,
      type: "success"
    });
    setTimeout(() => setToastMessage(null), 7000);
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

    // 3. Amenities Filter
    if (amenitiesFilter === "grocery" && !hasAmenity(p.id, "grocery")) return false;
    if (amenitiesFilter === "transit" && !hasAmenity(p.id, "transit")) return false;
    if (amenitiesFilter === "parks" && !hasAmenity(p.id, "parks")) return false;

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
          <div className={`bg-white dark:bg-slate-900 border-l-4 rounded-xl shadow-2xl p-4 flex items-start gap-3 w-80 sm:w-96 border-t border-r border-b border-t-[#EAE7E0] dark:border-t-slate-700 border-r-[#EAE7E0] dark:border-r-slate-700 border-b-[#EAE7E0] dark:border-b-slate-700`} style={{ borderLeftColor: toastMessage.type === 'up' ? '#EF4444' : toastMessage.type === 'down' ? '#10B981' : '#4A5D4E' }}>
            {toastMessage.type === 'up' ? (
              <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-red-500 dark:text-red-400" />
              </div>
            ) : toastMessage.type === 'down' ? (
              <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                <FileDown className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#ECFDF5] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
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

      {/* Ask GeoSphere Maps Search */}
      <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-900/50 rounded-3xl p-6 sm:p-8 relative overflow-hidden mb-6 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/300/10 dark:bg-indigo-900/10 dark:bg-indigo-900/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 text-xs font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask GeoSphere AI</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-indigo-900 dark:text-indigo-300">
              Conversational Property Discovery
            </h2>
            <p className="text-sm text-indigo-900 dark:text-indigo-300/80 max-w-2xl">
              Tell the map exactly what you're looking for. We'll cross-reference live MLS data, Census Tract boundaries, and zero-down grants.
            </p>
            <form className="mt-4 flex flex-col sm:flex-row gap-2 max-w-3xl" onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="e.g., Show me 3 bed homes under $450k near St. Johns that qualify for the DevNW 0% down grant..." className="flex-1 px-4 py-3 rounded-xl border border-indigo-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 shadow-sm" />
              <button 
                type="button" 
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
                onClick={() => {
                  alert("GeoSphere AI Search Active.\n\nParsing intent: \n- Price: <$450k\n- Location: St. Johns (Multnomah County)\n- Financial Trigger: DevNW 0% down grant eligibility\n\nCross-referencing live active listings with LMI Census Tract shapefiles...");
                  // Example simulation effect
                  setTimeout(() => {
                    alert("Found 6 matches! These properties have been pinned to your map and synced with your loan officer.");
                  }, 1500);
                }}
              >
                <Search className="w-4 h-4" /> Search Map
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Top Header & Pipeline Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#EAE7E0] p-6 sm:p-8 space-y-6 shadow-sm">
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
                  ? "bg-[#ECFDF5] border-emerald-500 text-emerald-700 dark:text-emerald-400 hover:bg-[#D1FAE5]" 
                  : "bg-white dark:bg-slate-900 border-[#EAE7E0] text-[#606C5D] hover:text-[#2D362E] hover:bg-stone-50 dark:bg-stone-900/30"
              }`}
              title={allAlertsEnabled ? "Disable price alerts for all properties" : "Enable price alerts for all properties"}
            >
              {allAlertsEnabled ? <BellRing className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              <span>{allAlertsEnabled ? "Alerts On" : "Alerts Off"}</span>
            </button>
            <button
              onClick={() => setShowShareViaEmailModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-[#4A5D4E] text-[#4A5D4E] hover:bg-[#F9F8F4] font-semibold text-xs shadow-sm transition-all cursor-pointer hover:scale-105"
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
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-[#EAE7E0] hover:bg-stone-50 dark:bg-stone-900/30 text-[#606C5D] hover:text-[#2D362E] font-semibold text-xs shadow-sm transition-all cursor-pointer"
              title="Download complete property tour & scorecard CSV report"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#4A5D4E]" />
              <span>Download CSV</span>
            </button>
            <button
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-[#EAE7E0] hover:bg-stone-50 dark:bg-stone-900/30 text-[#606C5D] hover:text-[#2D362E] font-semibold text-xs shadow-sm transition-all cursor-pointer"
              title="Generate QR code to open Google Maps layer on mobile"
            >
              <QrCode className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span>Maps QR Code</span>
            </button>
            <button
              onClick={() => setShowPdfReportModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#4A5D4E] text-white hover:bg-[#38463B] font-semibold text-xs shadow-sm transition-all cursor-pointer hover:scale-105"
              title="Save printable PDF property audit & tour scorecard report"
            >
              <FileDown className="w-4 h-4 text-emerald-300" />
              <span>Save PDF {selectedPropertyIds.length > 0 ? `(${selectedPropertyIds.length})` : ""}</span>
            </button>
            <button
              onClick={() => {
                 const count = selectedPropertyIds.length > 0 ? selectedPropertyIds.length : filtered.length;
                 alert(`Google Maps Custom Layer Compiled!\n\n${count} properties (with all custom tags, labels, and financial math) have been exported into a unified Google My Maps layer.\n\nCRITICAL NEXT STEP:\nWhen Google Maps opens, you MUST tap the "Follow" or "Save" button at the bottom of the screen. This permanently saves this custom layer to your personal Google Maps account for instant recall later, across all your devices.`);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-semibold text-xs shadow-sm transition-all cursor-pointer hover:scale-105"
              title="Export properties as a bulk layer to Google Maps"
            >
              <MapPin className="w-4 h-4 text-indigo-300" />
              <span>Sync to Maps {selectedPropertyIds.length > 0 ? `(${selectedPropertyIds.length})` : ""}</span>
            </button>
            <button
              onClick={handleExportKml}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-700 text-white hover:bg-purple-800 font-semibold text-xs shadow-sm transition-all cursor-pointer hover:scale-105"
              title="Download KML file for instant Google My Maps import"
            >
              <Compass className="w-4 h-4 text-purple-200" />
              <span>Export KML Maps {selectedPropertyIds.length > 0 ? `(${selectedPropertyIds.length})` : ""}</span>
            </button>
            <button
              onClick={handleShareList}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 text-white hover:bg-sky-700 font-semibold text-xs shadow-sm transition-all cursor-pointer hover:scale-105"
              title="Share your filtered property list"
            >
              <Share2 className="w-4 h-4 text-sky-200" />
              <span>Share List</span>
            </button>
            <button
              onClick={handleEmailDashboard}
              disabled={isEmailingDashboard}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 font-semibold text-xs shadow-sm transition-all cursor-pointer hover:scale-105 disabled:opacity-50"
              title="Email my dashboard summary, progress & saved properties"
            >
              <Mail className="w-4 h-4 text-emerald-200" />
              <span>{isEmailingDashboard ? "Emailing..." : "Email My Dashboard"}</span>
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

        
      {/* Cloud Function Price Drop Alert Simulation */}
      {properties.filter(p => p.priceDropAmount && p.priceDropAmount > 0).length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900/50 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-xl shrink-0">
              <BellRing className="w-5 h-5 text-red-600 dark:text-red-400 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-red-900 dark:text-red-300 text-sm tracking-tight flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-red-600 dark:text-red-400" />
                Firebase Cloud Function: Price Drop Detected!
              </h3>
              <p className="text-xs text-red-800 dark:text-red-300/80 mt-0.5 leading-relaxed max-w-2xl">
                The automated MLS/Rentcast API sync just detected a price drop of up to <strong>{formatUSD(Math.max(...properties.filter(p => p.priceDropAmount && p.priceDropAmount > 0).map(p => p.priceDropAmount || 0)))}</strong> on your saved properties. 
                An updated, synced Google Maps layer has been dispatched to your mobile device via Push Notification.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setViewMode("cards");
              alert("Simulating Consumer Flow:\n\nThe user taps the mobile Google Maps push notification which routes them directly back to this dashboard to review the new financial scorecard for the discounted property.");
            }}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm whitespace-nowrap cursor-pointer"
          >
            Review Disclosures
          </button>
        </div>
      )}

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
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-400 text-stone-900 dark:text-stone-300 ml-1">
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
            { id: "alerts", label: `Price Drops / Alerts (${properties.filter(p => p.priceAlertEnabled || p.priceDropAmount).length})` },
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
                  : "bg-white dark:bg-slate-900 text-[#606C5D] hover:text-[#2D362E] border border-[#EAE7E0]"
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

        {/* Nearby Amenities Filter Row */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#EAE7E0]/60 dark:border-slate-700/60">
          <span className="text-[11px] font-bold text-[#606C5D] dark:text-slate-300 uppercase tracking-wider mr-1">Nearby Amenities:</span>
          {[
            { id: "all", label: "All Areas", icon: MapPin },
            { id: "grocery", label: "Grocery (< 1mi)", icon: ShoppingCart },
            { id: "transit", label: "Transit (< 0.5mi)", icon: Bus },
            { id: "parks", label: "Parks (< 0.5mi)", icon: TreePine },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setAmenitiesFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                amenitiesFilter === tab.id
                  ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-2xs font-bold ring-2 ring-indigo-600/20"
                  : "bg-white dark:bg-slate-800 text-[#606C5D] dark:text-slate-300 hover:bg-[#F1EFE9] dark:hover:bg-slate-700 border border-[#EAE7E0] dark:border-slate-600"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
          <span className="text-[10px] text-[#9A9488] dark:text-slate-500 ml-auto italic">Powered by Google Maps Places API</span>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#EAE7E0]/60">
          <span className="text-[11px] font-bold text-[#606C5D] uppercase tracking-wider mr-1">Sort By:</span>
          <select
            className="bg-[#FAF9F5] dark:bg-slate-900 border border-[#EAE7E0] dark:border-slate-700 text-[#2D362E] dark:text-slate-200 text-xs font-semibold rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#4A5D4E]/20 cursor-pointer"
            value={`${sortBy}_${sortOrder}`}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "price_asc") {
                setSortBy("price");
                setSortOrder("asc");
              } else if (val === "price_desc") {
                setSortBy("price");
                setSortOrder("desc");
              } else if (val === "added_desc") {
                setSortBy("added");
                setSortOrder("desc");
              } else if (val === "added_asc") {
                setSortBy("added");
                setSortOrder("asc");
              } else if (val === "dom_asc") {
                setSortBy("dom");
                setSortOrder("asc");
              }
            }}
          >
            <option value="added_desc">Added Date (Newest)</option>
            <option value="added_asc">Added Date (Oldest)</option>
            <option value="price_asc">Price (Low to High)</option>
            <option value="price_desc">Price (High to Low)</option>
            <option value="dom_asc">Days on Market (Low to High)</option>
          </select>
        </div>

        {/* Screening Aid Disclaimer Banner */}
        <ScreeningDisclaimerBanner variant="compact" />
      </div>

      {/* KPI Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#EAE7E0] p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#F1EFE9] rounded-xl text-[#4A5D4E]">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#9A9488] uppercase tracking-wider">Active Listings</p>
            <p className="text-2xl font-serif font-bold text-[#2D362E]">{kpiStats.activeListings}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#EAE7E0] p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#F1EFE9] rounded-xl text-[#4A5D4E]">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#9A9488] uppercase tracking-wider">Total Volume</p>
            <p className="text-2xl font-serif font-bold text-[#2D362E]">{formatUSD(kpiStats.totalVolume)}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#EAE7E0] p-5 shadow-sm flex items-center gap-4">
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

      <div id="property-report-content" className="p-4 bg-white dark:bg-slate-900/50 rounded-xl">
      {/* Listing Agent Distribution Chart */}
      {agentDistribution.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#EAE7E0] p-6 shadow-sm mb-6 mt-6">
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
                className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-900 border border-[#4A5D4E]/30 text-[#4A5D4E] hover:bg-[#4A5D4E] hover:text-white font-bold text-xs rounded-lg shadow-2xs transition-all cursor-pointer"
                title="Download CSV report for selected properties"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Download Selected CSV ({selectedPropertyIds.length})</span>
              </button>
              <button
                onClick={() => setShowQrModal(true)}
                className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-900 border border-indigo-200 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:bg-indigo-900/30 font-bold text-xs rounded-lg shadow-2xs transition-all cursor-pointer"
                title="Generate QR code for selected properties"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Maps QR ({selectedPropertyIds.length})</span>
              </button>
              <button
                onClick={() => {
                   alert(`Google Maps Custom Layer Compiled!\n\n${selectedPropertyIds.length} properties (with all custom tags, labels, and financial math) have been exported into a unified Google My Maps layer.\n\nCRITICAL NEXT STEP:\nWhen Google Maps opens, you MUST tap the "Follow" or "Save" button at the bottom of the screen. This permanently saves this custom layer to your personal Google Maps account for instant recall later, across all your devices.`);
                }}
                className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-xs rounded-lg shadow-2xs transition-all cursor-pointer"
                title="Export selected properties as a bulk layer to Google Maps"
              >
                <MapPin className="w-3.5 h-3.5 text-indigo-300" />
                <span>Sync to Maps ({selectedPropertyIds.length})</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Property Cards Grid */}
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible hide-scrollbar">
        {filtered.map((property) => (
          <div
            key={property.id}
            draggable
            onDragStart={(e) => handleDragStart(e, property.id)}
            onDragOver={(e) => handleDragOver(e, property.id)}
            onDrop={(e) => handleDrop(e, property.id)}
            onDragEnd={handleDragEnd}
            className={`snap-center shrink-0 w-[85vw] sm:w-[360px] md:w-auto h-full transition-all duration-200 cursor-grab active:cursor-grabbing ${
              dragOverId === property.id ? 'opacity-40 scale-[0.98] ring-4 ring-indigo-500/50 rounded-2xl' : ''
            } ${draggedId === property.id ? 'opacity-30 scale-[0.98]' : ''}`}
            title="Drag to reorder this property"
          >
            <PropertyCard
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
              onOpenCalculator={(p) => setCalculatorProperty(p)}
            />
          </div>
        ))}
      </div>

      {calculatorProperty && (
        <PropertyCalculatorModal
          property={calculatorProperty}
          profile={profile}
          isOpen={true}
          onClose={() => setCalculatorProperty(null)}
        />
      )}

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
          <div className="bg-white dark:bg-slate-900 border border-[#EAE7E0] rounded-3xl max-w-5xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150">
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
                  <tr className="border-b border-[#EAE7E0] dark:border-slate-700">
                    <th className="p-3 text-[#9A9488] dark:text-slate-400 font-semibold w-40 align-top">
                      <div className="flex flex-col gap-2">
                        <span>Attribute</span>
                        <div className="flex flex-col gap-1.5 text-[9px] leading-tight text-[#9A9488]/90 dark:text-slate-500 font-normal mt-1">
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded w-max border border-emerald-100 dark:border-emerald-800/50">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="font-semibold">Live Sync Active</span>
                          </div>
                          <span className="italic">* Disclaimer: All property listings are snapshots in time. Current listing status and days on market are not verified.</span>
                        </div>
                      </div>
                    </th>
                    {comparedProperties.map(p => (
                      <th key={p.id} className="p-3 text-[#2D362E] dark:text-slate-100 font-bold align-top">
                        <div className="flex flex-col">
                          <span>{p.title}</span>
                          <span className="text-[10px] text-[#9A9488] dark:text-slate-400 font-normal flex items-center gap-1 mt-1.5">
                            <Clock className="w-3 h-3" /> 
                            Last synced: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
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
                    <td className="p-3 text-[#606C5D] dark:text-slate-300">Walk Score®</td>
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
                    <td className="p-3 text-[#606C5D] dark:text-slate-300">GreatSchools Rating</td>
                    {comparedProperties.map(p => {
                      const school = calculateMockSchoolScore(p.address, p.city, p.zip);
                      return (
                        <td key={p.id} className="p-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold border ${school.badgeBg} ${school.badgeText} ${school.badgeBorder}`}>
                            <GraduationCap className="w-3 h-3 shrink-0" />
                            <span className={`px-1 py-0.2 rounded text-[10px] font-mono font-extrabold ${school.badgePillBg}`}>{school.score}/10</span>
                            <span>{school.category}</span>
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="p-3 text-[#606C5D] dark:text-slate-300">Nearby Amenities</td>
                    {comparedProperties.map(p => (
                      <td key={p.id} className="p-3">
                        <div className="flex flex-col gap-1.5 items-start">
                          {hasAmenity(p.id, "grocery") && (
                            <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                              <ShoppingCart className="w-3 h-3 shrink-0 opacity-80" />
                              <span>Grocery</span>
                            </span>
                          )}
                          {hasAmenity(p.id, "transit") && (
                            <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                              <Bus className="w-3 h-3 shrink-0 opacity-80" />
                              <span>Transit Hub</span>
                            </span>
                          )}
                          {hasAmenity(p.id, "parks") && (
                            <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                              <TreePine className="w-3 h-3 shrink-0 opacity-80" />
                              <span>Parks</span>
                            </span>
                          )}
                          {!hasAmenity(p.id, "grocery") && !hasAmenity(p.id, "transit") && !hasAmenity(p.id, "parks") && (
                            <span className="text-[#9A9488] text-xs">None listed</span>
                          )}
                        </div>
                      </td>
                    ))}
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
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 text-xs font-bold border border-blue-200 transition-colors"
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
            
            <SmartCompareAI 
              properties={comparedProperties}
              loanOfficer={loanOfficer}
              agent={activeAgent}
            />

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
      {showQrModal && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full relative text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowQrModal(false)} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 rounded-full text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-[#2D362E] dark:text-white mb-2">Scan for Google Maps</h3>
            <p className="text-sm text-[#606C5D] dark:text-slate-300 mb-6 leading-relaxed">
              Point your phone's camera at this code to instantly open the custom Google Maps Layer containing your curated properties.
            </p>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 inline-block mb-6 shadow-sm">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://maps.google.com/local?q=curated+property+list" alt="QR Code" className="w-48 h-48 mx-auto" />
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-900/50 text-indigo-800 dark:text-indigo-300 text-xs p-4 rounded-xl font-medium text-left">
              <strong className="text-sm block mb-1">Included Metadata:</strong>
              <ul className="space-y-1 ml-1">
                <li>✓ Tour Grades & Scores</li>
                <li>✓ Estimated Renovation Costs</li>
                <li>✓ Affordability Match Tags</li>
                <li>✓ Monthly Payment Estimates</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Google My Maps 1-Click Import Guide Modal */}
      {showMyMapsModal && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-xl w-full relative shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <button onClick={() => setShowMyMapsModal(false)} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-full text-slate-600 dark:text-slate-300 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-2xl flex items-center justify-center shrink-0">
                <Compass className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#2D362E] dark:text-white">Import My Properties (4-Step Guide)</h3>
                <p className="text-xs text-[#606C5D] dark:text-slate-400">Your curated KML file is downloaded! Follow these visual steps to pin everything to Google Maps.</p>
              </div>
            </div>

            {/* 4-Step Visual Carousel Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {/* Step 1 */}
              <div className="bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 p-4 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">1</div>
                <div>
                  <h4 className="text-xs font-bold text-purple-900 dark:text-purple-300 mb-1 flex items-center gap-1.5">
                    <span>📥 KML File Saved</span>
                  </h4>
                  <p className="text-[11px] text-[#606C5D] dark:text-slate-300 leading-relaxed">
                    Your customized property KML file has successfully downloaded to your device storage.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 p-4 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">2</div>
                <div>
                  <h4 className="text-xs font-bold text-purple-900 dark:text-purple-300 mb-1 flex items-center gap-1.5">
                    <span>🗺️ Open My Maps</span>
                  </h4>
                  <p className="text-[11px] text-[#606C5D] dark:text-slate-300 leading-relaxed">
                    Click the button below to open Google My Maps and sign in with your Google account.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 p-4 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">3</div>
                <div>
                  <h4 className="text-xs font-bold text-purple-900 dark:text-purple-300 mb-1 flex items-center gap-1.5">
                    <span>➕ Create New Map</span>
                  </h4>
                  <p className="text-[11px] text-[#606C5D] dark:text-slate-300 leading-relaxed">
                    Click <strong className="text-purple-700 dark:text-purple-300">+ Create a new map</strong> on your Google My Maps dashboard.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 p-4 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">4</div>
                <div>
                  <h4 className="text-xs font-bold text-purple-900 dark:text-purple-300 mb-1 flex items-center gap-1.5">
                    <span>📂 Import .kml File</span>
                  </h4>
                  <p className="text-[11px] text-[#606C5D] dark:text-slate-300 leading-relaxed">
                    Click <strong className="text-purple-700 dark:text-purple-300">Import</strong> under the layer and select your saved KML file!
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 p-3 rounded-xl text-xs text-amber-800 dark:text-amber-300 mb-6">
              💡 <strong>Permanent Sync:</strong> All property pins, monthly payments, USDA/LMI tags, and <strong>Mike Ford &amp; Kanndice McLean's</strong> contact details are permanently saved to your Google account for mobile &amp; desktop access anytime.
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  if (lastExportedKmlUrl) {
                    const a = document.createElement("a");
                    a.href = lastExportedKmlUrl;
                    a.download = `Homebuyer_Curated_Map_${Date.now()}.kml`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }
                }}
                className="px-4 py-2.5 rounded-xl border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 text-xs font-bold transition-colors"
              >
                📥 Download KML Again
              </button>
              <a
                href="https://www.google.com/maps/d/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowMyMapsModal(false)}
                className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
              >
                <span>Open Google My Maps Now</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};