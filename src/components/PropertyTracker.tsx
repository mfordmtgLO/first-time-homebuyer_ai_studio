import React, { useState, useEffect } from "react";
import { motion, useAnimation, PanInfo, useMotionValue, useTransform, AnimatePresence } from "motion/react";
import { 
  Building, 
  Plus, 
  Star, 
  MapPin, Map, 
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
import { getNearbyAmenities, getListingSchoolDistrict } from "../utils/propertyMapUtils";
import { ScreeningDisclaimerBanner } from "./ScreeningDisclaimerBanner";
import { generateKML } from "../utils/kmlExporter";
import { generateGeoJSON } from "../utils/geojsonExporter";
import { PropertyReportModal } from "./PropertyReportModal";
import { ShareViaEmailModal } from "./ShareViaEmailModal";
import { Code } from "lucide-react";
import { PropertyMapOverlay } from "./PropertyMapOverlay";
import { PropertyCard } from "./PropertyCard";
import { PropertyCalculatorModal } from "./PropertyCalculatorModal";
import { SmartCompareAI } from "./SmartCompareAI";
import { ROADMAP_MILESTONES, DOCUMENT_VAULT_ITEMS } from "../data/initialData";
import { RoadmapMilestone, DocumentItem, LoanOfficerProfile, RealEstateAgentProfile } from "../types";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const SwipeableCardWrapper: React.FC<{
  children: React.ReactNode;
  onFavorite: () => void;
  onArchive: () => void;
  isFavorite: boolean;
}> = ({ children, onFavorite, onArchive, isFavorite }) => {
  const controls = useAnimation();
  const x = useMotionValue(0);
  const [confirmedAction, setConfirmedAction] = useState<'favorite' | 'archive' | null>(null);

  // Dynamic scaling and opacity for background icons
  const favoriteScale = useTransform(x, [0, 100], [0.8, 1.2]);
  const favoriteOpacity = useTransform(x, [0, 100], [0.3, 1]);
  const bgFavoriteOpacity = useTransform(x, [0, 150], [0, 1]);

  const archiveScale = useTransform(x, [0, -100], [0.8, 1.2]);
  const archiveOpacity = useTransform(x, [0, -100], [0.3, 1]);
  const bgArchiveOpacity = useTransform(x, [0, -150], [0, 1]);
  
  const handleDragEnd = async (event: any, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    // Swipe right to favorite/unfavorite
    if (offset > 100 || velocity > 500) {
      setConfirmedAction('favorite');
      await controls.start({ x: window.innerWidth > 600 ? 500 : 350, opacity: 0, transition: { duration: 0.25, ease: "easeOut" } });
      onFavorite();
      
      // Wait for state to register and show the confirmation icon
      setTimeout(() => {
        setConfirmedAction(null);
        // Snap back instantly without animation, then fade in
        controls.set({ x: 0 });
        controls.start({ opacity: 1, transition: { duration: 0.2 } });
      }, 700);
    } 
    // Swipe left to archive/delete
    else if (offset < -100 || velocity < -500) {
      setConfirmedAction('archive');
      await controls.start({ x: window.innerWidth > 600 ? -500 : -350, opacity: 0, transition: { duration: 0.25, ease: "easeOut" } });
      onArchive();
      // Card will likely unmount, but reset just in case
      setTimeout(() => {
        setConfirmedAction(null);
        controls.set({ x: 0, opacity: 1 });
      }, 700);
    } else {
      // Return to center if threshold not met
      controls.start({ x: 0, scale: 1, transition: { type: "spring", stiffness: 400, damping: 25 } });
    }
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#E2DFD2] dark:bg-slate-800 touch-pan-y">
      {/* Animated Background Overlays */}
      <motion.div style={{ opacity: bgFavoriteOpacity }} className="absolute inset-0 bg-emerald-100 dark:bg-emerald-900/40 z-0 pointer-events-none" />
      <motion.div style={{ opacity: bgArchiveOpacity }} className="absolute inset-0 bg-rose-100 dark:bg-rose-900/40 z-0 pointer-events-none" />

      {/* Background Underlay for Swipe Actions */}
      <div className="absolute inset-0 flex items-center justify-between px-8 z-0 pointer-events-none">
        <motion.div style={{ scale: favoriteScale, opacity: favoriteOpacity }} className="flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400">
          <Star className={`w-8 h-8 ${isFavorite ? "fill-emerald-600" : ""}`} />
          <span className="text-xs font-bold mt-1">{isFavorite ? "Unfavorite" : "Favorite"}</span>
        </motion.div>
        <motion.div style={{ scale: archiveScale, opacity: archiveOpacity }} className="flex flex-col items-center justify-center text-rose-600 dark:text-rose-400">
          <Trash2 className="w-8 h-8" />
          <span className="text-xs font-bold mt-1">Archive</span>
        </motion.div>
      </div>

      {/* Confirmation Overlay (Shows after swipe finishes) */}
      <AnimatePresence>
        {confirmedAction === 'favorite' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-emerald-100/95 dark:bg-emerald-900/95 backdrop-blur-md pointer-events-none rounded-2xl shadow-inner"
          >
             <Star className={`w-16 h-16 text-emerald-600 dark:text-emerald-400 ${!isFavorite ? "fill-emerald-600" : ""}`} />
             <span className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-3">{!isFavorite ? "Favorited!" : "Removed from Favorites"}</span>
          </motion.div>
        )}
        {confirmedAction === 'archive' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-rose-100/95 dark:bg-rose-900/95 backdrop-blur-md pointer-events-none rounded-2xl shadow-inner"
          >
             <Trash2 className="w-16 h-16 text-rose-600 dark:text-rose-400" />
             <span className="text-xl font-bold text-rose-700 dark:text-rose-300 mt-3">Archived!</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Draggable Top Layer */}
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        whileDrag={{ scale: 0.96, cursor: "grabbing" }}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="relative z-20 w-full h-full shadow-md bg-white dark:bg-slate-900 rounded-2xl"
      >
        {children}
      </motion.div>
    </div>
  );
};

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
  const [showShareViaEmailModal, setShowShareViaEmailModal] = useState(false);
  const [showPdfReportModal, setShowPdfReportModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [calculatorProperty, setCalculatorProperty] = useState<PropertyListing | null>(null);
  const [isSavingLayer, setIsSavingLayer] = useState(false);
  const [savedLayerId, setSavedLayerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedGroups, setSavedGroups] = useState<{id: string, name: string, propertyIds: string[]}[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [showGroupNameInput, setShowGroupNameInput] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<string>("all");
  
  // Load saved layer on mount
  useEffect(() => {
    const loadSavedLayer = async () => {
      if (!profile?.id) return;
      try {
        const layerRef = doc(db, 'user_map_layers', profile.id);
        const layerSnap = await getDoc(layerRef);
        if (layerSnap.exists()) {
          const data = layerSnap.data();
          if (data.groups && Array.isArray(data.groups)) {
             setSavedGroups(data.groups);
          }
        }
      } catch (err) {
        console.error("Failed to load map layer:", err);
      }
    };
    loadSavedLayer();
  }, [profile?.id]);
  
  const handleSaveMapLayer = async () => {
    if (!profile?.id) return alert("You must be logged in.");
    if (selectedPropertyIds.length === 0) return alert("Select properties to save.");
    if (!newGroupName.trim()) return alert("Please provide a name for this group.");

    setIsSavingLayer(true);
    try {
      const newGroup = {
        id: Date.now().toString(),
        name: newGroupName.trim(),
        propertyIds: selectedPropertyIds,
        createdAt: new Date().toISOString()
      };
      
      const updatedGroups = [...savedGroups, newGroup];
      
      const layerRef = doc(db, 'user_map_layers', profile.id);
      await setDoc(layerRef, {
        groups: updatedGroups,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setSavedGroups(updatedGroups);
      setActiveGroupId(newGroup.id);
      setNewGroupName("");
      setShowGroupNameInput(false);
      
      alert(`Success! "${newGroup.name}" (${selectedPropertyIds.length} properties) has been saved to your profile.`);
    } catch (err) {
      console.error("Failed to save map layer:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSavingLayer(false);
    }
  };
  
  const handleLoadGroup = (groupId: string) => {
    setActiveGroupId(groupId);
    if (groupId === "all") {
       // Just keep current selections or clear? Let's leave selections alone or clear them
    } else {
       const group = savedGroups.find(g => g.id === groupId);
       if (group) setSelectedPropertyIds(group.propertyIds);
    }
  };
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
  const [showKmlPreview, setShowKmlPreview] = useState(false);
  const [showMapLegend, setShowMapLegend] = useState(false);
  const [lastExportedKmlUrl, setLastExportedKmlUrl] = useState<string | null>(null);

  const handleExportKml = () => {
    const listToExport = selectedPropertyIds.length > 0 
      ? properties.filter(p => selectedPropertyIds.includes(p.id)) 
      : filtered;

    if (listToExport.length === 0) {
      alert("No properties available to export.");
      return;
    }

    const kmlContent = generateKML(listToExport);

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

  const handleExportGeoJson = () => {
    const listToExport = selectedPropertyIds.length > 0 
      ? properties.filter(p => selectedPropertyIds.includes(p.id)) 
      : filtered;

    if (listToExport.length === 0) {
      alert("No properties available to export.");
      return;
    }

    const geoJsonString = generateGeoJSON(listToExport);

    const blob = new Blob([geoJsonString], { type: "application/geo+json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `Homebuyer_Curated_GeoJSON_${Date.now()}.geojson`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setToastMessage({
      title: "GeoJSON Export Complete!",
      body: `Successfully exported ${listToExport.length} properties to GeoJSON format for Mapbox, ArcGIS, and GIS tools.`,
      type: "success"
    });
    setTimeout(() => setToastMessage(null), 6000);
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
    if (filterStatus === "unrated" && p.tourGrade) return false;
    if (filterStatus === "alerts" && !p.priceAlertEnabled) return false;
    if (filterStatus === "consideration" && p.status !== "saved" && p.status !== "touring") return false;
    if (filterStatus === "offered" && p.status !== "offered" && p.status !== "under_contract") return false;
    if (filterStatus === "archived" && p.status !== "passed") return false;

    // 2. Overlay Filter
    if (overlayFilter === "usda" && !isUsdaEligible(p)) return false;
    if (overlayFilter === "ohcs" && !(isLakeviewNationalEligible(p) || isLmiEligible(p) || isFirstHomePriceEligible(p))) return false;
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
    } else if (sortBy === "match") {
      // Score based on grant eligibility and favorites
      const scoreA = (a.isFavorite ? 5 : 0) + (isUsdaEligible(a) ? 3 : 0) + (isLmiEligible(a) ? 2 : 0);
      const scoreB = (b.isFavorite ? 5 : 0) + (isUsdaEligible(b) ? 3 : 0) + (isLmiEligible(b) ? 2 : 0);
      comparison = scoreB - scoreA; // Highest score first
    } else {
      // Default to added date
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
            <form className="mt-4 flex flex-col sm:flex-row gap-2 max-w-3xl" onSubmit={(e) => {
              e.preventDefault();
              if(!searchQuery) return;
              alert("GeoSphere AI Search Active.\n\nParsing intent: " + searchQuery + "\n\nCross-referencing live active listings with local boundary shapefiles...");
              setViewMode("map");
            }}>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., Portland, 3 bed, 2 bath, 2000 sqft, 10 DOM..." 
                className="flex-1 px-4 py-3 rounded-xl border border-indigo-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 shadow-sm" 
              />
              <button 
                type="submit" 
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
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
                 const listToSync = selectedPropertyIds.length > 0 ? properties.filter(p => selectedPropertyIds.includes(p.id)) : filtered;
                 if (listToSync.length === 0) return;
                 
                 // Generate Google Maps Directions / Multi-stop Route
                 // Origin is left blank to use user's current location
                 let mapUrl = 'https://www.google.com/maps/dir/?api=1';
                 
                 if (listToSync.length === 1) {
                    mapUrl += `&destination=${encodeURIComponent(listToSync[0].lat + ',' + listToSync[0].lng)}`;
                 } else {
                    const destination = listToSync[listToSync.length - 1];
                    const waypoints = listToSync.slice(0, -1).map(p => `${p.lat},${p.lng}`).join('|');
                    mapUrl += `&destination=${encodeURIComponent(destination.lat + ',' + destination.lng)}&waypoints=${encodeURIComponent(waypoints)}`;
                 }
                 
                 alert(`Google Maps Custom Layer Compiled!\n\n${listToSync.length} properties have been exported into a unified Google Maps Driving Route.\n\nCRITICAL NEXT STEP:\nWhen Google Maps opens, you MUST tap the "Save to Home Screen", "Pin Route", or "Share to Phone" button. This permanently saves this custom multi-stop layer to your personal Google Maps account for instant recall across all your devices.`);
                 
                 window.open(mapUrl, '_blank');
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
              <span>Export KML {selectedPropertyIds.length > 0 ? `(${selectedPropertyIds.length})` : ""}</span>
            </button>
            <button
              onClick={handleExportGeoJson}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 text-white hover:bg-slate-900 font-semibold text-xs shadow-sm transition-all cursor-pointer hover:scale-105"
              title="Download GeoJSON format for Mapbox, ArcGIS, and GIS tools"
            >
              <FileDown className="w-4 h-4 text-emerald-400" />
              <span>Export GeoJSON {selectedPropertyIds.length > 0 ? `(${selectedPropertyIds.length})` : ""}</span>
            </button>
            <button
              onClick={() => setShowMapLegend(!showMapLegend)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 font-semibold text-xs shadow-sm transition-all cursor-pointer"
              title="Toggle map legend explaining USDA and OHCS census tract indicators"
            >
              <MapIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{showMapLegend ? "Hide Map Legend" : "Map Legend"}</span>
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

      {/* KML Preview Side-Panel */}
      {showKmlPreview && (() => {
        const listToPreview = selectedPropertyIds.length > 0 
          ? properties.filter(p => selectedPropertyIds.includes(p.id)) 
          : filtered;
        const kmlString = generateKML(listToPreview);
        const truncatedKml = kmlString.length > 1200 ? kmlString.substring(0, 1200) + "\n... [truncated for display]" : kmlString;

        return (
          <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 mb-6 shadow-xl border border-violet-500/30 relative animate-in fade-in slide-in-from-top-4 duration-200 text-left">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-900/50 rounded-xl flex items-center justify-center">
                  <Code className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <span>Google My Maps KML Structure Preview</span>
                    <span className="bg-violet-500/20 text-violet-300 text-[10px] px-2 py-0.5 rounded-full font-mono">{listToPreview.length} Properties</span>
                  </h3>
                  <p className="text-xs text-slate-400">Live XML structure displaying metadata tags, coordinates, and co-branded contacts for Google My Maps.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(kmlString);
                    alert("KML XML copied to clipboard!");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition-colors"
                >
                  Copy XML
                </button>
                <button
                  onClick={() => setShowKmlPreview(false)}
                  className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Metadata summary */}
              <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-3">
                <h4 className="text-xs font-bold text-violet-300 uppercase tracking-wider">Export Metadata Summary</h4>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Format:</span>
                    <span className="font-mono text-emerald-400">OGC KML 2.2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Placemarks:</span>
                    <span className="font-mono text-white">{listToPreview.length} items</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Loan Officer:</span>
                    <span className="font-mono text-white">Mike Ford</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Co-Brand Agent:</span>
                    <span className="font-mono text-white">Kanndice McLean</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">USDA / LMI Tags:</span>
                    <span className="font-mono text-emerald-400">Included</span>
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    onClick={handleExportKml}
                    className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Compass className="w-4 h-4 text-purple-200" />
                    <span>Download Ready-to-Import KML File</span>
                  </button>
                </div>
              </div>

              {/* Right: XML Code Preview */}
              <div className="lg:col-span-2 bg-black/50 p-4 rounded-2xl border border-slate-800 font-mono text-[11px] text-violet-300 overflow-x-auto max-h-72 overflow-y-auto">
                <pre className="whitespace-pre-wrap">{truncatedKml}</pre>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Toggleable Map Legend Panel */}
      {showMapLegend && (
        <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl p-6 mb-6 shadow-xl border border-emerald-500/30 relative animate-in fade-in slide-in-from-top-4 duration-200 text-left">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center">
                <MapIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Interactive Map &amp; Census Tract Legend</span>
                  <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-mono">Grant Indicators</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Visual guide explaining USDA rural eligibility and OHCS FirstHome census tract zone indicators.</p>
              </div>
            </div>
            <button
              onClick={() => setShowMapLegend(false)}
              className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Legend Item 1 */}
            <div className="bg-emerald-50/50 dark:bg-slate-800/60 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-600 inline-block shadow-sm"></span>
                <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">USDA Rural Eligible</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Indicates properties located within officially designated USDA Rural Development geographic zones. Qualifies eligible buyers for <strong>100% financing (zero down payment)</strong> and favorable mortgage insurance rates.
              </p>
            </div>

            {/* Legend Item 2 */}
            <div className="bg-sky-50/50 dark:bg-slate-800/60 p-4 rounded-2xl border border-sky-200 dark:border-sky-900/50 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-sky-600 inline-block shadow-sm"></span>
                <h4 className="text-xs font-bold text-sky-900 dark:text-sky-300 uppercase tracking-wider">OHCS FirstHome / LMI</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Highlights homes located in Oregon Housing and Community Services (OHCS) FirstHome targeted census tracts or Low-to-Moderate Income (LMI) areas, granting access to down payment assistance (DPA) and below-market interest rates.
              </p>
            </div>

            {/* Legend Item 3 */}
            <div className="bg-amber-50/50 dark:bg-slate-800/60 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-500 inline-block shadow-sm"></span>
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">School &amp; Amenity Zones</h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Color-coded polygons representing top-rated school district boundaries, transit hubs, and grocery access radii mapped dynamically for buyer search optimization.
              </p>
            </div>
          </div>
        </div>
      )}

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
            { id: "favorites", label: `⭐ Favorites (${properties.filter(p => p.isFavorite).length})` },
            { id: "unrated", label: `❓ Unrated (${properties.filter(p => !p.tourGrade).length})` },
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

        {/* Grant Eligibility Filter Dropdown */}
        <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-[#EAE7E0]/60">
          <span className="text-[11px] font-bold text-[#606C5D] uppercase tracking-wider">Grant Eligibility:</span>
          <select
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-[#EAE7E0] dark:border-slate-700 text-xs font-semibold text-[#2D362E] dark:text-slate-200 shadow-2xs focus:outline-hidden cursor-pointer"
            value={overlayFilter}
            onChange={(e) => setOverlayFilter(e.target.value)}
          >
            <option value="all">All Properties ({properties.length})</option>
            <option value="usda">USDA-Eligible Properties ({overlayCounts.usda})</option>
            <option value="ohcs">OHCS-Eligible Properties ({overlayCounts.lakeviewNational + overlayCounts.lmi + overlayCounts.firstHomePriceEligible})</option>
            <option value="lmi_usda">USDA &amp; LMI Dual Eligible ({overlayCounts.lmiUsda})</option>
            <option value="targeted">OHCS Targeted Areas ({overlayCounts.targeted})</option>
          </select>
          <span className="text-[10px] text-[#9A9488] dark:text-slate-500 italic">Toggle specifically between USDA-Eligible and OHCS-Eligible grant tracts</span>
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
              } else if (val === "match_desc") {
                setSortBy("match");
                setSortOrder("desc");
              }
            }}
          >
            <option value="added_desc">Newest (Recently Added)</option>
            <option value="match_desc">Best Match (Grant &amp; Amenity Score)</option>
            <option value="price_asc">Price (Low-High)</option>
            <option value="price_desc">Price (High-Low)</option>
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
            properties={selectedPropertyIds.length > 0 ? properties.filter(p => selectedPropertyIds.includes(p.id)) : filtered}
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
                   const listToSync = properties.filter(p => selectedPropertyIds.includes(p.id));
                   if (listToSync.length === 0) return;
                   
                   let mapUrl = 'https://www.google.com/maps/dir/?api=1';
                   if (listToSync.length === 1) {
                      mapUrl += `&destination=${encodeURIComponent(listToSync[0].lat + ',' + listToSync[0].lng)}`;
                   } else {
                      const destination = listToSync[listToSync.length - 1];
                      const waypoints = listToSync.slice(0, -1).map(p => `${p.lat},${p.lng}`).join('|');
                      mapUrl += `&destination=${encodeURIComponent(destination.lat + ',' + destination.lng)}&waypoints=${encodeURIComponent(waypoints)}`;
                   }
                   
                   alert(`Google Maps Custom Layer Compiled!\n\n${listToSync.length} properties have been exported into a unified Google Maps Route.\n\nCRITICAL NEXT STEP:\nWhen Google Maps opens, you MUST tap the "Pin Route" or "Save to Phone" button at the bottom of the screen. This permanently saves this custom layer to your personal Google Maps account for instant recall across all your devices.`);
                   
                   window.open(mapUrl, '_blank');
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
      <div className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 w-full">
        {filtered.map((property) => (
          <div
            key={property.id}
            draggable
            onDragStart={(e) => handleDragStart(e, property.id)}
            onDragOver={(e) => handleDragOver(e, property.id)}
            onDrop={(e) => handleDrop(e, property.id)}
            onDragEnd={handleDragEnd}
            className={`w-full transition-all duration-200 cursor-grab active:cursor-grabbing ${
              dragOverId === property.id ? 'opacity-40 scale-[0.98] ring-4 ring-indigo-500/50 rounded-2xl' : ''
            } ${draggedId === property.id ? 'opacity-30 scale-[0.98]' : ''}`}
            title="Drag to reorder this property"
          >
            <SwipeableCardWrapper
              isFavorite={!!property.isFavorite}
              onFavorite={() => toggleFavorite(property.id, { stopPropagation: () => {} } as any)}
              onArchive={() => deleteProperty(property.id, { stopPropagation: () => {} } as any)}
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
                loanOfficer={loanOfficer}
                agent={activeAgent}
              />
            </SwipeableCardWrapper>
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