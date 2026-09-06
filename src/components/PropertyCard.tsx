import React, { useState, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "motion/react";
import { 
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
  Camera
} from "lucide-react";
import { PropertyListing, FinancialProfile } from "../types";
import { calculateMonthlyPI, formatUSD } from "../utils/mortgageMath";
import { calculateMockWalkScore } from "../utils/walkScoreUtils";
import { 
  getListingOverlayBadges,
  getZillowUrl
} from "../utils/overlayClassification";
import { getPropertyOhcsPriceLimit } from "../utils/ohcsPurchaseLimits";

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
  onDeleteProperty: (id: string, e: React.MouseEvent) => void;
  onOpenScorecard: (property: PropertyListing) => void;
  onAskAiAboutProperty: (property: PropertyListing) => void;
  onToggleCompare: (id: string, e?: React.MouseEvent) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  profile,
  isSelectedForCompare,
  isSelected,
  onToggleSelect,
  onToggleFavorite,
  onTogglePriceAlert,
  onDeleteProperty,
  onOpenScorecard,
  onAskAiAboutProperty,
  onToggleCompare
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
  const priceInfo = getPropertyOhcsPriceLimit(
    property.price,
    property.overlayEligibility?.countyName || property.county,
    property.city,
    property.overlayEligibility?.lmiCensusTract || property.overlayEligibility?.geoid,
    property.overlayEligibility?.targetedArea
  );

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
      className="bg-white rounded-2xl border border-[#EAE7E0] overflow-hidden flex flex-col justify-between hover:border-[#4A5D4E] transition-all shadow-sm group"
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
          <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase shadow-xs backdrop-blur-md ${
                property.status === "offered"
                  ? "bg-[#C18C5D] text-white"
                  : property.status === "touring"
                  ? "bg-[#4A5D4E] text-white"
                  : "bg-white/95 text-[#2D362E]"
              }`}
            >
              {property.status}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/95 text-[#606C5D] backdrop-blur-md shadow-xs">
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
              className="w-5 h-5 rounded text-[#4A5D4E] focus:ring-[#4A5D4E]/20 bg-white/90 border-white/60 cursor-pointer backdrop-blur-md shadow-sm"
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
                  ? "bg-white text-emerald-600 border-emerald-500"
                  : "bg-white/90 text-[#606C5D] border-white/60 hover:text-[#2D362E]"
              }`}
              title={property.priceAlertEnabled ? "Price alerts active" : "Enable price alerts"}
              aria-label="Toggle price alert"
            >
              {property.priceAlertEnabled ? (
                <BellRing className="w-4 h-4 text-emerald-500" />
              ) : (
                <Bell className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              onClick={(e) => onToggleFavorite(property.id, e)}
              className={`p-2 rounded-xl backdrop-blur-md border transition-colors shadow-xs ${
                property.isFavorite
                  ? "bg-white text-[#C18C5D] border-[#C18C5D]"
                  : "bg-white/90 text-[#606C5D] border-white/60 hover:text-[#2D362E]"
              }`}
              title={property.isFavorite ? "Remove favorite" : "Save favorite"}
              aria-label="Toggle favorite"
            >
              <Star className={`w-4 h-4 ${property.isFavorite ? "fill-[#C18C5D]" : ""}`} />
            </button>
            <button
              type="button"
              onClick={(e) => onDeleteProperty(property.id, e)}
              className="p-2 rounded-xl bg-white/90 text-[#606C5D] hover:text-rose-600 border border-white/60 backdrop-blur-md transition-colors shadow-xs"
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
              <span className="text-xl font-bold drop-shadow-sm font-serif">{formatUSD(property.price)}</span>
              <span className="text-[11px] text-white/90 ml-1.5">(${Math.round(property.price / property.sqft)}/sqft)</span>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className="text-xs font-semibold text-white bg-[#4A5D4E]/90 px-2.5 py-0.5 rounded-md shadow-2xs backdrop-blur-xs">
                Est. {formatUSD(estMonthly)}/mo
              </span>

              {/* Pagination Dots */}
              {images.length > 1 && (
                <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-full backdrop-blur-xs pointer-events-auto">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => handleDotClick(idx, e)}
                      className={`transition-all rounded-full ${
                        idx === currentIdx
                          ? "w-4 h-1.5 bg-white shadow-xs"
                          : "w-1.5 h-1.5 bg-white/60 hover:bg-white"
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
        <div className="p-5 space-y-4">
          <div>
            <h3 className="font-bold text-base text-[#2D362E] group-hover:text-[#4A5D4E] transition-colors truncate">
              {property.title}
            </h3>
            <p className="text-xs text-[#606C5D] flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#9A9488] shrink-0" />
              <span className="truncate">{property.address}, {property.city}, {property.state} {property.zip}</span>
            </p>

            {/* Walk Score Quick Badge */}
            <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-[#EAE7E0]/60">
              <div className="flex items-center gap-1.5 text-xs text-[#606C5D]">
                <Footprints className="w-3.5 h-3.5 text-[#4A5D4E] shrink-0" />
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
          </div>

          {/* Specs Pill Grid */}
          <div className="grid grid-cols-4 gap-2 py-2 border-y border-[#EAE7E0] text-xs text-center">
            <div>
              <span className="text-[#9A9488] block text-[10px]">Bedrooms</span>
              <span className="font-bold text-[#2D362E]">{property.beds}</span>
            </div>
            <div>
              <span className="text-[#9A9488] block text-[10px]">Bathrooms</span>
              <span className="font-bold text-[#2D362E]">{property.baths}</span>
            </div>
            <div>
              <span className="text-[#9A9488] block text-[10px]">Living Area</span>
              <span className="font-bold text-[#2D362E]">{property.sqft} sqft</span>
            </div>
            <div className="relative group cursor-help">
              <span className="text-[#9A9488] block text-[10px] flex items-center justify-center gap-0.5">
                DOM <AlertCircle className="w-2.5 h-2.5" title="Days on Market" />
              </span>
              <span className="font-bold text-[#2D362E]">{property.daysOnMarket !== undefined ? property.daysOnMarket : "N/A"}</span>
            </div>
          </div>

          {/* GeoSphere GIS Overlay Eligibility Badges */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {badges.map(b => (
                <span 
                  key={b.id}
                  className={`${b.bgClass} text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 shadow-2xs`}
                  title={b.description}
                >
                  <CheckCircle2 className="w-2.5 h-2.5 shrink-0 opacity-80" />
                  <span>{b.shortLabel}</span>
                </span>
              ))}
              <span 
                className={`${walk.badgeBg} ${walk.badgeText} ${walk.badgeBorder} text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 shadow-2xs cursor-help`}
                title={`Walk Score® ${walk.score}/100: ${walk.description}`}
              >
                <Footprints className="w-2.5 h-2.5 shrink-0 opacity-80" />
                <span>Walk Score {walk.score}</span>
              </span>
            </div>

            {/* OHCS Purchase Price Cap Status */}
            <div className="p-2 rounded-lg bg-[#FAF9F5] border border-[#EAE7E0] text-[11px] text-[#606C5D] space-y-0.5">
              <div className="flex items-center justify-between font-semibold text-[#2D362E]">
                <span>{priceInfo.isTargeted ? "Targeted Area Cap" : "Non-Targeted Cap"}:</span>
                <span className="font-mono text-[#4A5D4E]">${priceInfo.applicablePriceLimit.toLocaleString()}</span>
              </div>
              <div className="text-[10px] text-[#9A9488]">
                {priceInfo.qualificationReason}
              </div>
            </div>
          </div>

          {/* Tour Scorecard Grade Banner */}
          {property.scorecard ? (
            <div className="bg-[#F1EFE9] p-3 rounded-xl border border-[#EAE7E0] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#606C5D]">On-Site Tour Grade:</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white text-[#4A5D4E] border border-[#EAE7E0]">
                  Grade {property.scorecard.grade} ({property.scorecard.overallRating}/10)
                </span>
              </div>
              {property.scorecard.redFlags && property.scorecard.redFlags.length > 0 ? (
                <div className="text-[11px] text-[#C18C5D] flex items-center gap-1 truncate font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>Flag: {property.scorecard.redFlags[0]}</span>
                </div>
              ) : (
                <div className="text-[11px] text-[#4A5D4E] flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>No major structural red flags noted</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#F9F8F4] p-3 rounded-xl border border-dashed border-[#DEDAD2] text-center">
              <span className="text-xs text-[#9A9488] block">No tour scorecard recorded yet</span>
            </div>
          )}

          {/* Notes snippet */}
          {property.notes && (
            <p className="text-xs text-[#606C5D] italic line-clamp-2">
              "{property.notes}"
            </p>
          )}
        </div>
      </div>

      {/* ACTION BUTTONS FOOTER */}
      <div className="p-3 bg-[#F1EFE9]/60 border-t border-[#EAE7E0] space-y-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenScorecard(property)}
            className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-[#F1EFE9] text-[#2D362E] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-[#EAE7E0] cursor-pointer shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#4A5D4E]" />
            <span>{property.scorecard ? "Scorecard" : "Tour Scorecard"}</span>
          </button>

          <button
            type="button"
            onClick={() => onAskAiAboutProperty(property)}
            className="py-2 px-2.5 rounded-xl bg-[#4A5D4E]/10 hover:bg-[#4A5D4E]/20 text-[#4A5D4E] text-xs font-semibold flex items-center justify-center gap-1 transition-colors border border-[#4A5D4E]/20 cursor-pointer"
            title="Generate offer strategy with Gemini"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C18C5D]" />
            <span className="hidden sm:inline">Offer AI</span>
          </button>

          <a
            href={getZillowUrl(property)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="py-2 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-900 text-xs font-semibold flex items-center justify-center gap-1 transition-colors border border-blue-200"
            title={`Open ${property.address} on Zillow.com in a new tab`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Zillow</span>
          </a>

          <button
            type="button"
            onClick={(e) => onToggleCompare(property.id, e)}
            className={`p-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              isSelectedForCompare
                ? "bg-[#C18C5D] text-white border-[#C18C5D]"
                : "bg-white text-[#606C5D] border-[#EAE7E0] hover:text-[#2D362E]"
            }`}
            title={isSelectedForCompare ? "Remove from comparison" : "Add to comparison"}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
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
      </div>
    </div>
  );
};
