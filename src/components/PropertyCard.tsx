import React, { useState, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "motion/react";
import { 
  Navigation,
  Flame,
  Star, 
  MapPin, 
  AlertCircle, 
  Trash2, 
  SlidersHorizontal, 
  Sparkles, 
  ExternalLink, 
  Layers, 
  CheckCircle2, 
  Footprints, 
  Bell, 
  BellRing,
  ChevronLeft,
  ChevronRight,
  Camera,
  GraduationCap,
  ShoppingCart,
  Bus,
  TreePine,
  Calculator,
  Megaphone,
  Smartphone,
  Check
} from "lucide-react";
import { PropertyListing, FinancialProfile, LoanOfficerProfile, RealEstateAgentProfile } from "../types";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { calculateMonthlyPI, formatUSD } from "../utils/mortgageMath";
import { calculateMockWalkScore } from "../utils/walkScoreUtils";
import { calculateMockSchoolScore } from "../utils/schoolScoreUtils";
import { hasAmenity } from "../utils/amenitiesUtils";
import { 
  getListingOverlayBadges,
  getZillowUrl
} from "../utils/overlayClassification";
import { 
  calculatePriceDropMonthlySavings, 
  generatePriceDropGeminiRevelation 
} from "../utils/propertyMapUtils";
import { getPropertyOhcsPriceLimit } from "../utils/ohcsPurchaseLimits";
import { PropertyNotesThread } from "./PropertyNotesThread";
import { PropertyLinkedAds } from "./ai/PropertyLinkedAds";

/**
 * Curated high-resolution local architectural fallback photo suites.
 * When an imported or mock listing has only 1 or no images, or generic links,
 * these provide rich multi-angle galleries (Exterior, Living, Kitchen, Yard/Patio).
 */
export const CURATED_ARCHITECTURAL_GALLERIES: Record<string, string[]> = {
  craftsman: [
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80", // Exterior
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80", // Living Room
    "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80", // Modern Kitchen
    "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80", // Sunlit Bedroom
  ],
  townhouse: [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80", // Front Facade
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80", // Modern Open Concept
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80", // Kitchen & Island
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80", // Primary Suite
  ],
  ranch: [
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80", // Mid-century Exterior
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80", // Douglas Fir Living Room
    "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80", // Kitchen / Dining
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80", // Landscaped Mature Lot
  ],
  modern: [
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80", // Contemporary Exterior
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80", // High Ceiling Living
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80", // Quartz Kitchen
    "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=80", // Backyard Patio
  ],
  condo: [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80", // Urban Building
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80", // Clean Studio / Living
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80", // Kitchen
    "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1200&q=80", // City Balcony
  ]
};

/**
 * Returns a complete array of images for a property listing, utilizing:
 * 1. listing.images (if present and non-empty)
 * 2. listing.galleryUrls (if present and non-empty)
 * 3. listing.imageUrl (if valid)
 * 4. Curated local fallback set matched by title / propertyType so every property has 3-4 swipeable high-res photos
 */
export function getPropertyImageGallery(property: PropertyListing): string[] {
  const customList: string[] = [];

  if (property.images && Array.isArray(property.images)) {
    property.images.forEach(img => {
      if (img && typeof img === "string" && img.trim() && !customList.includes(img.trim())) {
        customList.push(img.trim());
      }
    });
  }

  if (property.galleryUrls && Array.isArray(property.galleryUrls)) {
    property.galleryUrls.forEach(img => {
      if (img && typeof img === "string" && img.trim() && !customList.includes(img.trim())) {
        customList.push(img.trim());
      }
    });
  }

  if (property.imageUrl && typeof property.imageUrl === "string" && property.imageUrl.trim()) {
    const trimmed = property.imageUrl.trim();
    if (!customList.includes(trimmed)) {
      customList.unshift(trimmed);
    }
  }

  // If we already have 3 or more photos, return directly
  if (customList.length >= 3) {
    return customList;
  }

  // Pick an architectural curated fallback theme
  const titleLower = (property.title || "").toLowerCase();
  const typeLower = (property.propertyType || "").toLowerCase();

  let fallbackKey = "craftsman";
  if (titleLower.includes("townhome") || typeLower.includes("townhouse")) {
    fallbackKey = "townhouse";
  } else if (titleLower.includes("ranch") || titleLower.includes("hills")) {
    fallbackKey = "ranch";
  } else if (titleLower.includes("condo") || typeLower.includes("condo")) {
    fallbackKey = "condo";
  } else if (titleLower.includes("deschutes") || titleLower.includes("modern") || titleLower.includes("pines")) {
    fallbackKey = "modern";
  }

  const fallbackSuite = CURATED_ARCHITECTURAL_GALLERIES[fallbackKey] || CURATED_ARCHITECTURAL_GALLERIES.craftsman;

  // Merge unique photos from the fallback suite
  fallbackSuite.forEach(url => {
    if (!customList.includes(url)) {
      customList.push(url);
    }
  });

  return customList.length > 0 ? customList : [CURATED_ARCHITECTURAL_GALLERIES.craftsman[0]];
}

export interface PropertyCardProps {
  property: PropertyListing;
  profile: FinancialProfile;
  isSelectedForCompare: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string, selected: boolean) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onTogglePriceAlert: (id: string, e: React.MouseEvent) => void;
  onToggleRateAlert?: (id: string, e: React.MouseEvent) => void;
  onDeleteProperty: (id: string, e: React.MouseEvent) => void;
  onOpenScorecard: (property: PropertyListing) => void;
  onAskAiAboutProperty: (property: PropertyListing) => void;
  onToggleCompare: (id: string, e?: React.MouseEvent) => void;
  onOpenCalculator?: (property: PropertyListing) => void;
  loanOfficer?: LoanOfficerProfile;
  agent?: RealEstateAgentProfile;
  origin?: string;
  onOpenLoanOfficerContact?: () => void;
  onOpenPriceDropAlertOutreach?: (property: PropertyListing) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  profile,
  isSelectedForCompare,
  isSelected,
  onToggleSelect,
  onToggleFavorite,
  onTogglePriceAlert,
  onToggleRateAlert,
  onDeleteProperty,
  onOpenScorecard,
  onAskAiAboutProperty,
  onToggleCompare,
  onOpenCalculator,
  loanOfficer,
  agent,
  origin,
  onOpenLoanOfficerContact,
  onOpenPriceDropAlertOutreach
}) => {
  // Swipeable carousel state powered by Framer Motion drag gestures
  const images = getPropertyImageGallery(property);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [direction, setDirection] = useState<number>(0);
  const carouselContainerRef = useRef<HTMLDivElement>(null);

  // Financial calculations
  const loanAmt = Math.max(0, property.price - profile.downPaymentSavings);
  const estPI = calculateMonthlyPI(loanAmt, profile.interestRate, profile.loanTermYears);
  const estMonthly = estPI + Math.round(property.propertyTaxAnnual / 12) + Math.round(profile.annualHomeInsurance / 12) + property.hoaMonthly;

  const badges = getListingOverlayBadges(property);
  const walk = calculateMockWalkScore(property.address, property.city, property.zip, property.walkScore);
  const school = calculateMockSchoolScore(property.address, property.city, property.zip);
  const priceInfo = getPropertyOhcsPriceLimit(
    property.price,
    property.overlayEligibility?.countyName || property.county,
    property.city,
    property.overlayEligibility?.lmiCensusTract || property.overlayEligibility?.geoid,
    property.overlayEligibility?.targetedArea
  );

  // Price Drop & Payment Reduction Calculations
  const effectivePriceDrop = property.priceDropAmount || ((property.originalPrice && property.price && property.originalPrice > property.price) ? property.originalPrice - property.price : 0);
  const monthlyPaymentSavings = calculatePriceDropMonthlySavings(effectivePriceDrop, profile.interestRate || 6.5);
  const geminiRevelation = generatePriceDropGeminiRevelation(property, monthlyPaymentSavings);

  const [isPushingAlert, setIsPushingAlert] = useState(false);
  const [pushSuccess, setPushSuccess] = useState(false);
  const [autoPushed, setAutoPushed] = useState(false);

  // Automated Real-Time Cell Push Notification Wire
  // Dispatches SMS push automatically to both Loan Officer (Mike Ford) and Buyer without requiring manual clicks
  React.useEffect(() => {
    if (effectivePriceDrop > 0 && property.address) {
      const autoDispatch = async () => {
        try {
          const res = await fetch("/api/sms/send-price-drop-alert", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              propertyAddress: property.address,
              city: property.city || "Oregon",
              state: property.state || "OR",
              zip: property.zip || "",
              originalPrice: property.originalPrice || ((property.price || 0) + effectivePriceDrop),
              currentPrice: property.price,
              priceDropAmount: effectivePriceDrop,
              monthlySavings: monthlyPaymentSavings,
              loName: loanOfficer?.name || "Mike Ford",
              loPhone: loanOfficer?.phone || "(541) 555-0199",
              agentName: agent?.name || "Kanndice",
              agentPhone: agent?.phone || "(541) 555-0142",
              revelation: geminiRevelation,
              userPhone: "(541) 555-0188",
              isManual: false
            }),
          });
          if (res.ok) {
            setAutoPushed(true);
          }
        } catch (e) {
          console.warn("[Auto Cell Push] Notice:", e);
        }
      };
      autoDispatch();
    }
  }, [effectivePriceDrop, property.address, property.price]);

  const handleTriggerCellPushAlert = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPushingAlert(true);
    try {
      const res = await fetch("/api/sms/send-price-drop-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyAddress: property.address,
          city: property.city || "Oregon",
          state: property.state || "OR",
          zip: property.zip || "",
          originalPrice: property.originalPrice || ((property.price || 0) + effectivePriceDrop),
          currentPrice: property.price,
          priceDropAmount: effectivePriceDrop,
          monthlySavings: monthlyPaymentSavings,
          loName: loanOfficer?.name || "Mike Ford",
          loPhone: loanOfficer?.phone || "(541) 555-0199",
          agentName: agent?.name || "Kanndice",
          agentPhone: agent?.phone || "(541) 555-0142",
          revelation: geminiRevelation,
          isManual: true
        }),
      });
      const data = await res.json();
      setPushSuccess(true);
      setTimeout(() => setPushSuccess(false), 5000);
    } catch (err) {
      console.warn("Push alert trigger notice:", err);
    } finally {
      setIsPushingAlert(false);
    }
  };

  // Carousel navigation handlers with direction tracking for fluid transitions
  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIdx(prev => {
      if (newDirection > 0) {
        return prev === images.length - 1 ? 0 : prev + 1;
      }
      return prev === 0 ? images.length - 1 : prev - 1;
    });
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    paginate(-1);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    paginate(1);
  };

  const handleDotClick = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDirection(idx > currentIdx ? 1 : -1);
    setCurrentIdx(idx);
  };

  // Framer Motion Drag End Handler with velocity & offset detection
  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50; // px threshold
    const velocityThreshold = 400; // px/s velocity

    const swipeConfidence = info.offset.x;
    const swipeVelocity = info.velocity.x;

    if (swipeConfidence < -swipeThreshold || swipeVelocity < -velocityThreshold) {
      // Dragged left -> Next slide
      paginate(1);
    } else if (swipeConfidence > swipeThreshold || swipeVelocity > velocityThreshold) {
      // Dragged right -> Prev slide
      paginate(-1);
    }
  };

  // Slide animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : dir < 0 ? "-100%" : 0,
      opacity: 0.8,
      scale: 0.98
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 350, damping: 32 },
        opacity: { duration: 0.25 },
        scale: { duration: 0.2 }
      }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0.6,
      scale: 0.98,
      transition: {
        x: { type: "spring", stiffness: 350, damping: 32 },
        opacity: { duration: 0.2 }
      }
    })
  };

  // Keyboard accessibility when focused on carousel
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    }
  };

  return (
    <div 
      className="bg-white dark:bg-slate-900 rounded-2xl border border-[#EAE7E0] overflow-hidden flex flex-col justify-between hover:border-[#4A5D4E] transition-all shadow-sm group"
      id={`property-card-${property.id}`}
    >
      <div>
        {/* SWIPEABLE IMAGE CAROUSEL HEADER (FRAMER MOTION GESTURES) */}
        <div
          ref={carouselContainerRef}
          className="relative h-52 w-full overflow-hidden bg-[#F1EFE9] select-none focus:outline-none touch-pan-y"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          aria-label={`Photo gallery for ${property.title}. Image ${currentIdx + 1} of ${images.length}. Swipe horizontally or use arrow keys to navigate.`}
        >
          {/* Main Drag-Ready Display Image Container with AnimatePresence */}
          <div className="w-full h-full relative overflow-hidden cursor-grab active:cursor-grabbing">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIdx}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragEnd={handleDragEnd}
                className="absolute inset-0 w-full h-full will-change-transform"
              >
                <img
                  src={images[currentIdx]}
                  alt={`${property.title} - View ${currentIdx + 1}`}
                  referrerPolicy="no-referrer"
                  draggable={false}
                  className="w-full h-full object-cover pointer-events-none group-hover:scale-105 transition-transform duration-500 will-change-transform select-none"
                  loading="lazy"
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Vignette Gradients for Text Contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/35 pointer-events-none" />

          {/* Status & Property Type Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10 max-w-[70%]">
            {property.priceDropAmount && property.priceDropAmount > 0 && (
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-red-600 text-white shadow-md flex items-center gap-1 animate-pulse border border-red-400/40">
                <Flame className="w-3 h-3 text-amber-300" />
                <span>PRICE DROP -{formatUSD(property.priceDropAmount)}</span>
              </span>
            )}
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase shadow-xs backdrop-blur-md ${
                property.status === "offered"
                  ? "bg-[#C18C5D] dark:bg-amber-600 text-white"
                  : property.status === "touring"
                  ? "bg-[#4A5D4E] dark:bg-emerald-600 text-white"
                  : "bg-white dark:bg-slate-800 text-[#2D362E] dark:text-slate-100"
              }`}
            >
              {property.status}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-slate-900/95 text-[#606C5D] backdrop-blur-md shadow-xs">
              {property.propertyType}
            </span>
            {images.length > 1 && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/50 text-white backdrop-blur-md flex items-center gap-1">
                <Camera className="w-3 h-3" />
                <span>{currentIdx + 1}/{images.length}</span>
              </span>
            )}
          </div>

          {/* Top Right Action Controls */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
            <input
              type="checkbox"
              className="w-5 h-5 rounded text-[#4A5D4E] focus:ring-[#4A5D4E]/20 bg-white dark:bg-slate-900/90 border-white/60 cursor-pointer backdrop-blur-md shadow-sm"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onToggleSelect(property.id, e.target.checked);
              }}
              title="Select for export or bulk report"
              aria-label={`Select ${property.title}`}
            />
            <button
              type="button"
              onClick={(e) => onTogglePriceAlert(property.id, e)}
              className={`p-2 rounded-xl backdrop-blur-md border transition-colors shadow-xs ${
                property.priceAlertEnabled
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-emerald-500"
                  : "bg-white dark:bg-slate-900/90 text-[#606C5D] border-white/60 hover:text-[#2D362E]"
              }`}
              title={property.priceAlertEnabled ? "Price alerts active" : "Enable price alerts"}
              aria-label="Toggle price alert"
            >
              {property.priceAlertEnabled ? (
                <BellRing className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              ) : (
                <Bell className="w-4 h-4" />
              )}
            </button>
            {onToggleRateAlert && (
              <button
                type="button"
                onClick={(e) => onToggleRateAlert(property.id, e)}
                className={`p-2 rounded-xl backdrop-blur-md border transition-colors shadow-xs ${
                  property.rateAlertEnabled
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-blue-500"
                    : "bg-white dark:bg-slate-900/90 text-[#606C5D] border-white/60 hover:text-[#2D362E]"
                }`}
                title={property.rateAlertEnabled ? "Mortgage rate shift alerts active" : "Alert me if mortgage rates drop"}
                aria-label="Toggle rate alert"
              >
                {property.rateAlertEnabled ? (
                  <TrendingDown className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
              </button>
            )}
          
            <button
              type="button"
              onClick={(e) => onToggleFavorite(property.id, e)}
              className={`p-2 rounded-xl backdrop-blur-md border transition-colors shadow-xs ${
                property.isFavorite
                  ? "bg-white dark:bg-slate-900 text-[#C18C5D] border-[#C18C5D]"
                  : "bg-white dark:bg-slate-900/90 text-[#606C5D] border-white/60 hover:text-[#2D362E]"
              }`}
              title={property.isFavorite ? "Remove favorite" : "Save favorite"}
              aria-label="Toggle favorite"
            >
              <Star className={`w-4 h-4 ${property.isFavorite ? "fill-[#C18C5D]" : ""}`} />
            </button>
            <button
              type="button"
              onClick={(e) => onDeleteProperty(property.id, e)}
              className="p-2 rounded-xl bg-white dark:bg-slate-900/90 text-[#606C5D] hover:text-rose-600 border border-white/60 backdrop-blur-md transition-colors shadow-xs"
              title="Remove property from pipeline"
              aria-label="Delete property"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Arrows (Visible when more than 1 image exists) */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-xs transition-all z-20 opacity-80 hover:opacity-100 hover:scale-105"
                title="Previous photo"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-xs transition-all z-20 opacity-80 hover:opacity-100 hover:scale-105"
                title="Next photo"
                aria-label="Next photo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Bottom Indicators & Price Tag */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white z-10 pointer-events-none">
            <div className="pointer-events-auto">
              {property.originalPrice && property.originalPrice > property.price && (
                <div className="text-[11px] text-white/80 line-through font-semibold drop-shadow-xs">
                  Was {formatUSD(property.originalPrice)}
                </div>
              )}
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-bold drop-shadow-sm font-serif">{formatUSD(property.price)}</span>
                <span className="text-[10px] sm:text-[11px] text-white/90 ml-1">(${Math.round(property.price / property.sqft)}/sqft)</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5 sm:gap-2">
              {effectivePriceDrop > 0 ? (
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] sm:text-xs font-bold text-white bg-red-600/95 px-2.5 py-0.5 rounded-lg shadow-sm backdrop-blur-xs flex items-center gap-1.5 animate-pulse">
                    <Flame className="w-3 h-3 text-amber-300" />
                    <span>Price Drop: -{formatUSD(effectivePriceDrop)}</span>
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-emerald-100 bg-emerald-800/90 px-2 py-0.5 rounded-md shadow-2xs backdrop-blur-xs flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-emerald-300" />
                    <span>Save ~{formatUSD(monthlyPaymentSavings)}/mo</span>
                  </span>
                </div>
              ) : (
                <span className="text-[10px] sm:text-xs font-semibold text-white bg-[#4A5D4E]/90 px-2 py-0.5 rounded-md shadow-2xs backdrop-blur-xs">
                  {property.daysOnMarket !== undefined ? `${property.daysOnMarket} Days on Market` : "Active Listing"}
                </span>
              )}

              {/* Pagination Dots */}
              {images.length > 1 && (
                <div className="flex items-center gap-1 sm:gap-1.5 bg-black/40 px-1.5 sm:px-2 py-1 rounded-full backdrop-blur-xs pointer-events-auto mt-0.5">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => handleDotClick(idx, e)}
                      className={`transition-all rounded-full ${
                        idx === currentIdx
                          ? "w-4 h-1.5 bg-white dark:bg-slate-900 shadow-xs"
                          : "w-1.5 h-1.5 bg-white dark:bg-slate-900/60 hover:bg-white dark:bg-slate-900"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BODY CONTENT */}
        <div className="p-3 sm:p-5 space-y-3 sm:space-y-4">
          {effectivePriceDrop > 0 && (
            <div className="bg-gradient-to-r from-red-50 via-rose-50 to-amber-50 dark:from-red-950/40 dark:via-rose-950/30 dark:to-amber-950/20 border-2 border-red-200 dark:border-red-800/60 rounded-2xl p-3.5 space-y-3 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1 text-red-700 dark:text-red-400 font-extrabold text-xs bg-red-100 dark:bg-red-900/50 px-2 py-0.5 rounded-md">
                      <Flame className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                      Price Drop: -{formatUSD(effectivePriceDrop)}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-bold text-xs bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-md">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Payment Reduction: ~{formatUSD(monthlyPaymentSavings)}/mo
                    </span>
                    <span className="flex items-center gap-1 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded-md">
                      <Smartphone className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                      {autoPushed ? "Auto-Push: Dispatched to Cell (LO & Buyer)" : "Auto-Push: Active"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#606C5D] dark:text-slate-300 mt-1 font-medium">
                    {property.originalPrice ? `Reduced from ${formatUSD(property.originalPrice)} down to ${formatUSD(property.price)}` : `New asking price: ${formatUSD(property.price)}`}
                  </p>
                </div>

                {/* Quick Action Buttons for LO & Plugin Users */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={handleTriggerCellPushAlert}
                    disabled={isPushingAlert}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                      pushSuccess 
                        ? "bg-emerald-600 text-white" 
                        : "bg-slate-900 hover:bg-slate-800 text-white active:scale-95"
                    }`}
                    title="Send immediate cell phone push notification & SMS alert to Loan Officer Mike Ford & plugin user"
                  >
                    {pushSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Push Alert Sent!</span>
                      </>
                    ) : isPushingAlert ? (
                      <span>Wiring SMS Push...</span>
                    ) : (
                      <>
                        <Smartphone className="w-3.5 h-3.5 text-amber-300" />
                        <span>Push Alert to Cell</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenPriceDropAlertOutreach?.(property);
                    }}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-xl text-xs font-bold shrink-0 flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    title="Send or preview dual-agent price drop alert draft for this specific property address"
                  >
                    <Megaphone className="w-3.5 h-3.5" />
                    <span>Outreach Hub</span>
                  </button>
                </div>
              </div>

              {/* Gemini / Muse Revelation Strategy Note Card */}
              <div className="bg-white/90 dark:bg-slate-900/90 border border-red-200/80 dark:border-red-900/40 rounded-xl p-2.5 text-xs text-[#2D362E] dark:text-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-400 text-[11px] uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                  <span>Gemini / Muse Strategic Revelation</span>
                </div>
                <p className="text-[11px] leading-relaxed text-[#4A5D4E] dark:text-slate-300">
                  {geminiRevelation}
                </p>
              </div>
            </div>
          )}

          <div>
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0">
                <h3 className="font-bold text-sm sm:text-base text-[#2D362E] group-hover:text-[#4A5D4E] transition-colors truncate">
                  {property.title}
                </h3>
                <p className="text-[10px] sm:text-xs text-[#606C5D] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#9A9488] shrink-0" />
                  <span className="truncate">{property.address}, {property.city}, {property.state} {property.zip}</span>
                </p>
              </div>
              <span className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border shadow-2xs ${
                property.status === 'under_contract' || property.status === 'Pending' || property.status === 'pending'
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' 
                  : property.status === 'passed' || property.status === 'off_market' || property.status === 'archived'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              }`}>
                {property.status === 'under_contract' || property.status === 'Pending' || property.status === 'pending'
                  ? 'Pending' 
                  : property.status === 'passed' || property.status === 'off_market' || property.status === 'archived'
                  ? 'Off-Market' 
                  : property.status || 'Active'}
              </span>
            </div>

            {/* Neighborhood Ratings (Walk & School) */}
            <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-[#EAE7E0]/60 dark:border-slate-700/60">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-[#606C5D] dark:text-slate-300">
                  <Footprints className="w-3.5 h-3.5 text-[#4A5D4E] dark:text-emerald-400 shrink-0" />
                  <span className="text-[11px] font-bold">Walk Score®</span>
                </div>
                <div 
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold border ${walk.badgeBg} ${walk.badgeText} ${walk.badgeBorder} cursor-help transition-all hover:scale-105`}
                  title={`Walk Score® ${walk.score}/100: ${walk.description}`}
                >
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-extrabold shadow-2xs ${walk.badgePillBg}`}>
                    {walk.score}
                  </span>
                  <span className="text-[10px] font-semibold">{walk.category}</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-[#606C5D] dark:text-slate-300">
                  <GraduationCap className="w-3.5 h-3.5 text-[#4A5D4E] dark:text-emerald-400 shrink-0" />
                  <span className="text-[11px] font-bold">GreatSchools Rating</span>
                </div>
                <div 
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold border ${school.badgeBg} ${school.badgeText} ${school.badgeBorder} cursor-help transition-all hover:scale-105`}
                  title={`GreatSchools Rating ${school.score}/10: ${school.description}`}
                >
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-extrabold shadow-2xs ${school.badgePillBg}`}>
                    {school.score}/10
                  </span>
                  <span className="text-[10px] font-semibold">{school.category}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Specs Pill Grid - Compact responsive grid */}
          <div className="grid grid-cols-4 gap-1 sm:gap-2 py-2 border-y border-[#EAE7E0] dark:border-slate-700 text-[10px] sm:text-xs text-center overflow-hidden">
            <div className="flex flex-col items-center justify-center p-1 bg-slate-50 dark:bg-slate-800/50 rounded-md">
              <span className="text-[#9A9488] dark:text-slate-400 block mb-0.5">Beds</span>
              <span className="font-bold text-[#2D362E] dark:text-slate-200">{property.beds}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1 bg-slate-50 dark:bg-slate-800/50 rounded-md">
              <span className="text-[#9A9488] dark:text-slate-400 block mb-0.5">Baths</span>
              <span className="font-bold text-[#2D362E] dark:text-slate-200">{property.baths}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1 bg-slate-50 dark:bg-slate-800/50 rounded-md">
              <span className="text-[#9A9488] dark:text-slate-400 block mb-0.5">SqFt</span>
              <span className="font-bold text-[#2D362E] dark:text-slate-200">{property.sqft}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-1 bg-slate-50 dark:bg-slate-800/50 rounded-md relative group cursor-help">
              <span className="text-[#9A9488] dark:text-slate-400 block mb-0.5 flex items-center gap-0.5">
                DOM <AlertCircle className="w-2 h-2" />
              </span>
              <span className="font-bold text-[#2D362E] dark:text-slate-200">{property.daysOnMarket !== undefined ? property.daysOnMarket : "N/A"}</span>
            </div>
          </div>

          {/* Market Context Indicator: Days on Market vs Neighborhood Average */}
          {(() => {
            const dom = property.daysOnMarket !== undefined ? property.daysOnMarket : 14;
            const cityLower = (property.city || "").toLowerCase();
            const neighborhoodAvgDom = cityLower.includes("portland") ? 32 : cityLower.includes("bend") ? 22 : cityLower.includes("eugene") ? 25 : 28;
            const domDiff = neighborhoodAvgDom - dom;
            const isFastMarket = dom <= neighborhoodAvgDom;
            return (
              <div className={`px-3 py-2 rounded-xl text-[11px] font-medium flex items-center justify-between border ${isFastMarket ? 'bg-amber-50/80 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800/40 dark:text-amber-200' : 'bg-emerald-50/80 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:border-emerald-800/40 dark:text-emerald-200'}`}>
                <div className="flex items-center gap-1.5">
                  <Flame className={`w-3.5 h-3.5 ${isFastMarket ? 'text-amber-600 animate-pulse' : 'text-emerald-600'}`} />
                  <span>
                    <strong>Market Context:</strong> {dom}d DOM ({Math.abs(domDiff)}d {isFastMarket ? 'faster' : 'slower'} than {property.city || 'area'} avg {neighborhoodAvgDom}d)
                  </span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/80 dark:bg-slate-900/80 shadow-2xs">
                  {isFastMarket ? 'High Urgency' : 'Good Negotiation'}
                </span>
              </div>
            );
          })()}

          {/* GeoSphere GIS Overlay Eligibility Badges */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {badges.map(b => (
                <span 
                  key={b.id}
                  className={`${b.bgClass} text-[10px] font-bold px-1.5 py-0.5 rounded-md border flex items-center gap-1 shadow-2xs whitespace-nowrap`}
                  title={b.description}
                >
                  <CheckCircle2 className="w-2.5 h-2.5 shrink-0 opacity-80" />
                  <span>{b.shortLabel}</span>
                </span>
              ))}
              <span 
                className={`${walk.badgeBg} ${walk.badgeText} ${walk.badgeBorder} text-[10px] font-bold px-1.5 py-0.5 rounded-md border flex items-center gap-1 shadow-2xs cursor-help whitespace-nowrap`}
                title={`Walk Score® ${walk.score}/100: ${walk.description}`}
              >
                <Footprints className="w-2.5 h-2.5 shrink-0 opacity-80" />
                <span>Walk Score {walk.score}</span>
              </span>
              
              {hasAmenity(property.id, "grocery") && (
                <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-2xs whitespace-nowrap">
                  <ShoppingCart className="w-2.5 h-2.5 shrink-0 opacity-80" />
                  <span>Grocery Nearby</span>
                </span>
              )}
              {hasAmenity(property.id, "transit") && (
                <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-2xs whitespace-nowrap">
                  <Bus className="w-2.5 h-2.5 shrink-0 opacity-80" />
                  <span>Transit Hub</span>
                </span>
              )}
              {hasAmenity(property.id, "parks") && (
                <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-2xs whitespace-nowrap">
                  <TreePine className="w-2.5 h-2.5 shrink-0 opacity-80" />
                  <span>Parks Nearby</span>
                </span>
              )}
            </div>

            {/* OHCS Purchase Price Cap Status */}
            <div className="p-2 rounded-lg bg-[#FAF9F5] border border-[#EAE7E0] text-[10px] sm:text-[11px] text-[#606C5D] space-y-0.5 mt-2">
              <div className="flex items-center justify-between font-semibold text-[#2D362E]">
                <span>{priceInfo.isTargeted ? "Targeted Area Cap" : "Non-Targeted Cap"}:</span>
                <span className="font-mono text-[#4A5D4E]">${priceInfo.applicablePriceLimit.toLocaleString()}</span>
              </div>
              <div className="text-[9px] sm:text-[10px] text-[#9A9488]">
                {priceInfo.qualificationReason}
              </div>
            </div>
          </div>

          {/* Tour Scorecard Grade Banner */}
          {property.scorecard ? (
            <div className="bg-[#F1EFE9] p-2.5 sm:p-3 rounded-xl border border-[#EAE7E0] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs text-[#606C5D]">On-Site Tour Grade:</span>
                <span className="text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-[#4A5D4E] border border-[#EAE7E0]">
                  Grade {property.scorecard.grade} ({property.scorecard.overallRating}/10)
                </span>
              </div>
              {property.scorecard.redFlags && property.scorecard.redFlags.length > 0 ? (
                <div className="text-[10px] sm:text-[11px] text-[#C18C5D] flex items-center gap-1 truncate font-medium">
                  <AlertCircle className="w-2.5 sm:w-3 h-2.5 sm:h-3 shrink-0" />
                  <span>Flag: {property.scorecard.redFlags[0]}</span>
                </div>
              ) : (
                <div className="text-[10px] sm:text-[11px] text-[#4A5D4E] flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-2.5 sm:w-3 h-2.5 sm:h-3 shrink-0" />
                  <span>No major structural red flags noted</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#F9F8F4] p-2.5 sm:p-3 rounded-xl border border-dashed border-[#DEDAD2] text-center">
              <span className="text-[10px] sm:text-xs text-[#9A9488] block">No tour scorecard recorded yet</span>
            </div>
          )}

          {/* Price History Trend */}
          {property.priceHistory && property.priceHistory.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-[#606C5D] dark:text-slate-400 uppercase tracking-wider">Price History</span>
              </div>
              <div className="h-16 w-full -ml-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={property.priceHistory} margin={{ top: 5, right: 5, bottom: 5, left: 10 }}>
                    <XAxis dataKey="date" hide />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#2D362E', borderColor: '#2D362E', borderRadius: '8px', color: '#fff', fontSize: '10px', padding: '4px 8px' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value: number) => [formatUSD(value), 'Price']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#C18C5D" 
                      strokeWidth={2} 
                      dot={{ r: 3, fill: '#C18C5D', strokeWidth: 0 }} 
                      activeDot={{ r: 4, strokeWidth: 0 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

                    {/* Injected Vantage Ads Engine Asset Viewer */}
          <PropertyLinkedAds 
            propertyId={property.id} 
            propertyAddress={property.address} 
            loanOfficerId={loanOfficer?.id}
          />\n          {/* Bidirectional Property Notes Thread, Gamified Q&A & Co-Branded Schema */}
          <PropertyNotesThread
            property={property}
            loanOfficer={loanOfficer}
            agent={agent}
            origin={origin}
            onOpenLoanOfficerContact={onOpenLoanOfficerContact}
          />
        </div>
      </div>

      {/* ACTION BUTTONS FOOTER */}
      <div className="p-3 bg-[#F1EFE9]/60 border-t border-[#EAE7E0] space-y-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => onOpenScorecard(property)}
            className="flex-1 py-2 px-1.5 sm:px-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-[#F1EFE9] text-[#2D362E] text-[10px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-[#EAE7E0] cursor-pointer shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#4A5D4E] shrink-0" />
            <span className="hidden sm:inline">{property.scorecard ? "Scorecard" : "Tour Scorecard"}</span>
            <span className="sm:hidden truncate">Tour</span>
          </button>
          
          {onOpenCalculator && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenCalculator(property);
              }}
              className="flex-1 py-2 px-1.5 sm:px-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-400 text-[10px] sm:text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-indigo-200 dark:border-indigo-800/50 cursor-pointer shadow-2xs"
              title="Run What-If Mortgage Scenario"
            >
              <Calculator className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">What-If Math</span>
              <span className="sm:hidden truncate">Math</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onAskAiAboutProperty(property)}
            className="flex-1 py-2 px-1.5 sm:px-2 rounded-xl bg-[#4A5D4E]/10 hover:bg-[#4A5D4E]/20 text-[#4A5D4E] text-[10px] sm:text-xs font-semibold flex items-center justify-center gap-1 transition-colors border border-[#4A5D4E]/20 cursor-pointer"
            title="Generate offer strategy with Gemini"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C18C5D] shrink-0" />
            <span className="hidden sm:inline">Offer AI</span>
            <span className="sm:hidden truncate">Offer AI</span>
          </button>

          <button
            type="button"
            onClick={(e) => onToggleCompare(property.id, e)}
            className={`p-2 rounded-xl border text-[10px] sm:text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              isSelectedForCompare
                ? "bg-[#C18C5D] text-white border-[#C18C5D]"
                : "bg-white dark:bg-slate-900 text-[#606C5D] border-[#EAE7E0] hover:text-[#2D362E]"
            }`}
            title={isSelectedForCompare ? "Remove from comparison" : "Add to comparison"}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(property.address + ', ' + property.city + ', ' + property.state + ' ' + property.zip)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 py-2 px-1 sm:px-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:text-indigo-300 text-[10px] sm:text-xs font-semibold flex items-center justify-center gap-1 transition-colors border border-indigo-200"
            title="Get driving directions to this property via Google Maps"
          >
            <Navigation className="w-3 sm:w-3.5 h-3 sm:h-3.5 shrink-0" />
            <span className="truncate">Directions</span>
          </a>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${property.lat},${property.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 py-2 px-1 sm:px-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 text-[10px] sm:text-xs font-semibold flex items-center justify-center gap-1 transition-colors border border-emerald-200"
            title="Save this home to your personal Google Maps account. Remember to click 'Save' in Google Maps!"
          >
            <MapPin className="w-3 sm:w-3.5 h-3 sm:h-3.5 shrink-0" />
            <span className="truncate">Maps Sync</span>
          </a>

          <a
            href={getZillowUrl(property)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="py-2 px-2 sm:px-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 hover:text-blue-900 text-[10px] sm:text-xs font-semibold flex items-center justify-center gap-1 transition-colors border border-blue-200 shrink-0"
            title={`Open ${property.address} on Zillow.com in a new tab`}
          >
            <ExternalLink className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            <span className="hidden sm:inline">Zillow</span>
          </a>
        </div>

        <div className="text-[10px] text-[#9A9488] flex items-center justify-between px-1">
          <span>Snapshot in time</span>
          <a 
            href={getZillowUrl(property)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline font-semibold"
          >
            Live on Zillow ↗
          </a>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 mt-2">
          {property.priceDropAmount && property.priceDropAmount > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenPriceDropAlertOutreach?.(property);
              }}
              className="flex-1 py-2 px-1 sm:px-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-colors border border-red-500 shadow-sm cursor-pointer"
              title="Generate and send dual-agent price drop alert draft for this specific property address"
            >
              <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
              <span className="truncate">Price Drop Alert</span>
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const payload = {
                targetLoUid: loanOfficer?.id || "lo_default",
                source: "First-Time Homebuyer GeoSphere",
                batchId: "batch_" + Date.now(),
                properties: [{
                  propertyId: property.id,
                  address: property.address,
                  city: property.city,
                  price: property.price,
                  beds: property.bedrooms || 0,
                  baths: property.bathrooms || 0,
                  squareFeet: property.sqft || 0,
                  daysOnMarket: property.daysOnMarket || 0,
                  rentcastEstRent: property.estimatedRent || 0,
                  agentName: agent?.name || "Unknown",
                  agentPhone: agent?.phone || "",
                  agentEmail: agent?.email || "",
                  tags: [
                    ...(property.isUsdaEligible ? ["USDA", "Zero Down"] : []),
                    ...(property.isOhcsEligible ? ["OHCS Eligible"] : [])
                  ]
                }]
              };
              
              fetch("https://ais-pre-tnbidd2z2dclvambkyz3vi-427099073161.us-east5.run.app/api/webhooks/property-sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
              }).then(() => {
                alert("Property data successfully sent to Vantage AI Ads Engine!");
              }).catch(err => {
                console.error("Ads Engine Sync Error:", err);
                alert("Error sending to Ads Engine. See console.");
              });
            }}
            className="flex-1 py-2 px-1 sm:px-2.5 rounded-xl bg-pink-50 dark:bg-pink-900/30 hover:bg-pink-100 text-pink-700 dark:text-pink-400 hover:text-pink-900 text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-colors border border-pink-200 shadow-sm"
            title="Send property data to Vantage AI Ads Engine to generate targeted video ads"
          >
            <Megaphone className="w-3 sm:w-3.5 h-3 sm:h-3.5 shrink-0" />
            <span className="truncate">Send to Ads Engine</span>
          </button>
        </div>
      </div>
    </div>
  );
};
