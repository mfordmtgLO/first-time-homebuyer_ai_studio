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
  ExternalLink
} from "lucide-react";
import { PropertyListing, FinancialProfile } from "../types";
import { calculateMonthlyPI, formatUSD } from "../utils/mortgageMath";
import { 
  hasAuthenticPropertyPhoto, 
  getListingOverlayBadges,
  calculateOverlayCounts,
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

interface PropertyTrackerProps {
  properties: PropertyListing[];
  setProperties: React.Dispatch<React.SetStateAction<PropertyListing[]>>;
  profile: FinancialProfile;
  onOpenScorecard: (property: PropertyListing) => void;
  onOpenNewModal: () => void;
  onAskAiAboutProperty: (property: PropertyListing) => void;
}

export const PropertyTracker: React.FC<PropertyTrackerProps> = ({
  properties,
  setProperties,
  profile,
  onOpenScorecard,
  onOpenNewModal,
  onAskAiAboutProperty,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [overlayFilter, setOverlayFilter] = useState<string>("all");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProperties(prev =>
      prev.map(p => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

  const deleteProperty = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to remove this property from your pipeline?")) {
      setProperties(prev => prev.filter(p => p.id !== id));
      setCompareIds(prev => prev.filter(cid => cid !== id));
    }
  };

  const toggleCompare = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
    if (filterStatus !== "all" && p.status !== filterStatus) {
      if (filterStatus === "offered" && p.status !== "under_contract") return false;
      if (filterStatus !== "offered") return false;
    }

    // 2. Overlay Filter
    if (overlayFilter === "usda" && !isUsdaEligible(p)) return false;
    if (overlayFilter === "lmi" && !isLmiEligible(p)) return false;
    if (overlayFilter === "lmi_usda" && !isLmiUsdaDual(p)) return false;
    if (overlayFilter === "targeted" && !isTargetedArea(p)) return false;
    if (overlayFilter === "non_targeted" && !isNonTargetedArea(p)) return false;
    if (overlayFilter === "price_eligible" && !isFirstHomePriceEligible(p)) return false;

    return true;
  });

  const comparedProperties = properties.filter(p => compareIds.includes(p.id));

  return (
    <div className="space-y-8">
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

          <div className="flex items-center gap-3">
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

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#EAE7E0]">
          {[
            { id: "all", label: `All Pipeline (${properties.length})` },
            { id: "touring", label: `Touring / Open House (${properties.filter(p => p.status === "touring").length})` },
            { id: "saved", label: `Saved (${properties.filter(p => p.status === "saved").length})` },
            { id: "offered", label: `Offered / Under Contract (${properties.filter(p => p.status === "offered" || p.status === "under_contract").length})` },
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

        {/* Screening Aid Disclaimer Banner */}
        <ScreeningDisclaimerBanner variant="compact" />
      </div>

      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((property) => {
          const loanAmt = Math.max(0, property.price - profile.downPaymentSavings);
          const estPI = calculateMonthlyPI(loanAmt, profile.interestRate, profile.loanTermYears);
          const estMonthly = estPI + Math.round(property.propertyTaxAnnual / 12) + Math.round(profile.annualHomeInsurance / 12) + property.hoaMonthly;
          const isSelectedForCompare = compareIds.includes(property.id);
          const hasPhoto = hasAuthenticPropertyPhoto(property);

          return (
            <div
              key={property.id}
              className="bg-white rounded-2xl border border-[#EAE7E0] overflow-hidden flex flex-col justify-between hover:border-[#4A5D4E] transition-all shadow-sm group"
            >
              <div>
                {hasPhoto ? (
                  /* Real Photo Header (Only rendered when authentic photo exists) */
                  <div className="relative h-48 w-full overflow-hidden bg-[#F1EFE9]">
                    <img
                      src={property.imageUrl}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                    {/* Status badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase shadow-sm ${
                        property.status === "offered"
                          ? "bg-[#C18C5D] text-white"
                          : property.status === "touring"
                          ? "bg-[#4A5D4E] text-white"
                          : "bg-white/90 text-[#2D362E] backdrop-blur-md"
                      }`}>
                        {property.status}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/90 text-[#606C5D] backdrop-blur-md">
                        {property.propertyType}
                      </span>
                    </div>

                    {/* Top Right Action Buttons */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        onClick={(e) => toggleFavorite(property.id, e)}
                        className={`p-2 rounded-xl backdrop-blur-md border transition-colors ${
                          property.isFavorite
                            ? "bg-white text-[#C18C5D] border-[#C18C5D]"
                            : "bg-white/80 text-[#606C5D] border-white/60 hover:text-[#2D362E]"
                        }`}
                      >
                        <Star className={`w-4 h-4 ${property.isFavorite ? "fill-[#C18C5D]" : ""}`} />
                      </button>
                      <button
                        onClick={(e) => deleteProperty(property.id, e)}
                        className="p-2 rounded-xl bg-white/80 text-[#606C5D] hover:text-rose-600 border border-white/60 backdrop-blur-md transition-colors"
                        title="Remove property"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price overlay at bottom of photo */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-baseline justify-between text-white">
                      <div>
                        <span className="text-xl font-bold">{formatUSD(property.price)}</span>
                        <span className="text-[11px] text-white/80 ml-1.5">(${Math.round(property.price / property.sqft)}/sqft)</span>
                      </div>
                      <span className="text-xs font-semibold text-white bg-[#4A5D4E]/90 px-2 py-0.5 rounded-md shadow-2xs backdrop-blur-xs">
                        Est. {formatUSD(estMonthly)}/mo
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Architectural Header (No Stock Photos - High-Craft Data Card) */
                  <div className="bg-[#FAF9F5] border-b border-[#EAE7E0] p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase shadow-xs ${
                          property.status === "offered"
                            ? "bg-[#C18C5D] text-white"
                            : property.status === "touring"
                            ? "bg-[#4A5D4E] text-white"
                            : "bg-white text-[#4A5D4E] border border-[#EAE7E0]"
                        }`}>
                          {property.status}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-[#606C5D] border border-[#EAE7E0]">
                          {property.propertyType}
                        </span>
                      </div>

                      {/* Top Right Action Buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => toggleFavorite(property.id, e)}
                          className={`p-1.5 rounded-xl border transition-colors ${
                            property.isFavorite
                              ? "bg-white text-[#C18C5D] border-[#C18C5D]"
                              : "bg-white text-[#606C5D] border-[#EAE7E0] hover:text-[#2D362E]"
                          }`}
                          title="Save favorite"
                        >
                          <Star className={`w-3.5 h-3.5 ${property.isFavorite ? "fill-[#C18C5D]" : ""}`} />
                        </button>
                        <button
                          onClick={(e) => deleteProperty(property.id, e)}
                          className="p-1.5 rounded-xl bg-white text-[#606C5D] hover:text-rose-600 border border-[#EAE7E0] transition-colors"
                          title="Remove property"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Price and Est Monthly Badge */}
                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <span className="text-2xl font-bold font-serif text-[#2D362E]">{formatUSD(property.price)}</span>
                        <span className="text-xs text-[#9A9488] ml-1.5">(${Math.round(property.price / property.sqft)}/sqft)</span>
                      </div>
                      <span className="text-xs font-bold text-[#4A5D4E] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg shadow-2xs">
                        Est. {formatUSD(estMonthly)}/mo
                      </span>
                    </div>
                  </div>
                )}

                {/* Body Content */}
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="font-bold text-base text-[#2D362E] group-hover:text-[#4A5D4E] transition-colors truncate">
                      {property.title}
                    </h3>
                    <p className="text-xs text-[#606C5D] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#9A9488] shrink-0" />
                      <span className="truncate">{property.address}, {property.city}, {property.state} {property.zip}</span>
                    </p>
                  </div>

                  {/* Specs Pill Grid */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#EAE7E0] text-xs text-center">
                    <div>
                      <span className="text-[#9A9488] block text-[10px]">Bedrooms</span>
                      <span className="font-bold text-[#2D362E]">{property.beds} Beds</span>
                    </div>
                    <div>
                      <span className="text-[#9A9488] block text-[10px]">Bathrooms</span>
                      <span className="font-bold text-[#2D362E]">{property.baths} Baths</span>
                    </div>
                    <div>
                      <span className="text-[#9A9488] block text-[10px]">Living Area</span>
                      <span className="font-bold text-[#2D362E]">{property.sqft} sqft</span>
                    </div>
                  </div>

                  {/* GeoSphere GIS Overlay Eligibility Badges */}
                  {(() => {
                    const badges = getListingOverlayBadges(property);
                    const priceInfo = getPropertyOhcsPriceLimit(
                      property.price,
                      property.overlayEligibility?.countyName || property.county,
                      property.city,
                      property.overlayEligibility?.lmiCensusTract || property.overlayEligibility?.geoid,
                      property.overlayEligibility?.targetedArea
                    );

                    return (
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
                    );
                  })()}

                  {/* Tour Scorecard Grade Banner */}
                  {property.scorecard ? (
                    <div className="bg-[#F1EFE9] p-3 rounded-xl border border-[#EAE7E0] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#606C5D]">On-Site Tour Grade:</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white text-[#4A5D4E] border border-[#EAE7E0]">
                          Grade {property.scorecard.grade} ({property.scorecard.overallRating}/10)
                        </span>
                      </div>
                      {property.scorecard.redFlags.length > 0 ? (
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

              {/* Action Buttons Footer */}
              <div className="p-3 bg-[#F1EFE9]/60 border-t border-[#EAE7E0] space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenScorecard(property)}
                    className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-[#F1EFE9] text-[#2D362E] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-[#EAE7E0]"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#4A5D4E]" />
                    <span>{property.scorecard ? "Scorecard" : "Tour Scorecard"}</span>
                  </button>

                  <button
                    onClick={() => onAskAiAboutProperty(property)}
                    className="py-2 px-2.5 rounded-xl bg-[#4A5D4E]/10 hover:bg-[#4A5D4E]/20 text-[#4A5D4E] text-xs font-semibold flex items-center justify-center gap-1 transition-colors border border-[#4A5D4E]/20"
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
                    onClick={(e) => toggleCompare(property.id, e)}
                    className={`p-2 rounded-xl border text-xs font-semibold transition-colors ${
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
        })}
      </div>

      {/* Side-by-Side Property Comparison Modal */}
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
    </div>
  );
};
