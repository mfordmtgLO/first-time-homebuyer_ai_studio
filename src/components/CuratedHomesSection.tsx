import React, { useState, useMemo } from "react";
import { 
  Building, 
  MapPin, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  DollarSign, 
  Calendar, 
  ChevronRight,
  Home,
  Check,
  Search,
  SlidersHorizontal,
  X,
  Star,
  ExternalLink,
  AlertCircle,
  Info
} from "lucide-react";
import { PropertyListing, LoanOfficerProfile, RealEstateAgentProfile } from "../types";
import { formatUSD, calculateMonthlyPI } from "../utils/mortgageMath";
import { 
  isUsdaEligible, 
  isLmiEligible, 
  isLmiUsdaDual, 
  isTargetedArea, 
  isNonTargetedArea,
  isFirstHomePriceEligible, 
  isTargetedPriceEligible,
  isNonTargetedPriceEligible,
  calculateOverlayCounts, 
  getListingOverlayBadges,
  hasAuthenticPropertyPhoto,
  filterListings,
  getZillowUrl
} from "../utils/overlayClassification";
import { OREGON_COUNTY_PRICE_LIMITS, normalizeOregonCounty, getPropertyOhcsPriceLimit } from "../utils/ohcsPurchaseLimits";
import { ScreeningDisclaimerBanner } from "./ScreeningDisclaimerBanner";
import { AffordabilityComparisonModal } from "./AffordabilityComparisonModal";

interface CuratedHomesSectionProps {
  properties: PropertyListing[];
  onOpenDashboard: () => void;
  onOpenLeadBot?: () => void;
  loanOfficer?: LoanOfficerProfile;
  activeAgent?: RealEstateAgentProfile;
}

export const CuratedHomesSection: React.FC<CuratedHomesSectionProps> = ({
  properties,
  onOpenDashboard,
  onOpenLeadBot,
  loanOfficer,
  activeAgent,
}) => {
  // Only display listings that the Loan Officer has approved/published
  const publishedHomes = useMemo(() => {
    return properties.filter(p => p.isPubliclyPublished !== false);
  }, [properties]);

  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedCounty, setSelectedCounty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [displayCount, setDisplayCount] = useState<number>(12);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Extract all unique Oregon counties present in published listings
  const availableCounties = useMemo(() => {
    const set = new Set<string>();
    publishedHomes.forEach(p => {
      const c = normalizeOregonCounty(p.overlayEligibility?.countyName || p.county, p.city);
      if (c) set.add(c);
    });
    return Array.from(set).sort();
  }, [publishedHomes]);

  // Accurate overlay counts for published homes
  const counts = useMemo(() => {
    return calculateOverlayCounts(publishedHomes);
  }, [publishedHomes]);

  const filtered = useMemo(() => {
    return filterListings(publishedHomes, {
      overlayFilter: activeFilter,
      county: selectedCounty,
      searchQuery: searchQuery,
    });
  }, [publishedHomes, activeFilter, selectedCounty, searchQuery]);

  const visibleProperties = filtered.slice(0, displayCount);

  if (publishedHomes.length === 0) {
    return null;
  }

  return (
    <section className="bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-10 space-y-8 shadow-sm">
      {/* Header & Filter Controls */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF9F5] text-[#4A5D4E] text-xs font-bold border border-[#EAE7E0]">
              <Sparkles className="w-3.5 h-3.5 text-[#C18C5D]" />
              <span>Pre-Screened Grant & Program Qualified Listings</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D362E] tracking-tight">
              Curated Eligible Homes & GIS Overlays
            </h3>
            <p className="text-xs sm:text-sm text-[#606C5D] leading-relaxed">
              Every home below is pre-screened against official GIS overlays for USDA 0% Down rural zones, State HFA DPA cash grants, FFIEC CRA census tracts, and county purchase price caps.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-4 flex items-center gap-4 text-xs shrink-0">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#606C5D] block">Published Homes</span>
              <strong className="text-lg font-serif font-bold text-[#2D362E]">{publishedHomes.length}</strong>
            </div>
            <div className="h-8 w-px bg-[#EAE7E0]" />
            <div>
              <span className="text-[10px] uppercase font-bold text-[#606C5D] block">Dual USDA+Flex</span>
              <strong className="text-lg font-serif font-bold text-emerald-800">{counts.lmiUsda}</strong>
            </div>
          </div>
        </div>

        {/* Search & County Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-7 relative">
            <Search className="w-4 h-4 text-[#9A9488] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by city, zip, address, or 11-digit GEOID tract code..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDisplayCount(12);
              }}
              className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl pl-9 pr-8 py-2.5 text-xs text-[#2D362E] placeholder-[#9A9488] focus:outline-none focus:border-[#4A5D4E]"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="sm:col-span-5">
            <select
              value={selectedCounty}
              onChange={(e) => {
                setSelectedCounty(e.target.value);
                setDisplayCount(12);
              }}
              className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#2D362E] focus:outline-none focus:border-[#4A5D4E] cursor-pointer"
            >
              <option value="all">All Oregon Counties ({publishedHomes.length})</option>
              {availableCounties.map(c => {
                const limitInfo = OREGON_COUNTY_PRICE_LIMITS[c];
                return (
                  <option key={c} value={c}>
                    {c} County {limitInfo?.isEntireCountyTargeted ? "(Targeted Cap: $" + (limitInfo.targetedLimit / 1000).toFixed(0) + "k)" : "(Cap: $" + ((limitInfo?.nonTargetedLimit || 566354) / 1000).toFixed(0) + "k)"}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Screening Aid & Point-in-Time Snapshot Disclaimer Banner */}
        <ScreeningDisclaimerBanner variant="compact" />

        {/* Overlay Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          {[
            { id: "all", label: `All Homes (${publishedHomes.length})`, short: "All" },
            { id: "lakeviewNational", label: `Lakeview (${counts.lakeviewNational})`, short: "Lakeview" },
            { id: "usda", label: `USDA RD (${counts.usda})`, short: "USDA RD" },
            { id: "lmi", label: `Flex Lending/LMI (${counts.lmi})`, short: "Flex Lending/LMI" },
            { id: "lmi_usda", label: `USDA RD+Flex (${counts.lmiUsda})`, short: "USDA RD+Flex" },
            { id: "targeted", label: `Targeted Area Cap (${counts.targeted})`, short: "Targeted Cap" },
            { id: "non_targeted", label: `Non-Targeted Cap (${counts.nonTargeted})`, short: "Non-Targeted" },
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => {
                setActiveFilter(filter.id);
                setDisplayCount(12);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === filter.id
                  ? "bg-[#4A5D4E] text-white shadow-2xs font-bold ring-2 ring-[#4A5D4E]/20"
                  : "bg-[#F9F8F4] text-[#606C5D] hover:bg-[#F1EFE9] border border-[#EAE7E0]"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* No listings matched state */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center rounded-2xl bg-[#FAF9F5] border border-dashed border-[#EAE7E0] space-y-3">
          <Building className="w-8 h-8 text-[#9A9488] mx-auto" />
          <h4 className="font-serif font-bold text-base text-[#2D362E]">No properties match your filter</h4>
          <p className="text-xs text-[#606C5D] max-w-md mx-auto">
            Try adjusting your county or overlay program selection to see available pre-screened homes.
          </p>
          <button
            onClick={() => {
              setActiveFilter("all");
              setSelectedCounty("all");
              setSearchQuery("");
            }}
            className="px-4 py-2 rounded-xl bg-[#4A5D4E] text-white text-xs font-bold cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        /* Property Cards Grid */
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible hide-scrollbar">
          {visibleProperties.map(property => {
            const loanAmount = property.price * 0.965;
            const monthlyPI = calculateMonthlyPI(loanAmount, 6.5, 30);
            const totalEstimatedMonthly = monthlyPI + (property.propertyTaxAnnual / 12) + (property.hoaMonthly || 0) + 120;
            const badges = getListingOverlayBadges(property);
            const hasPhoto = hasAuthenticPropertyPhoto(property);
            const priceLimitInfo = getPropertyOhcsPriceLimit(
              property.price,
              property.overlayEligibility?.countyName || property.county,
              property.city,
              property.overlayEligibility?.lmiCensusTract || property.overlayEligibility?.geoid,
              property.overlayEligibility?.targetedArea
            );

            return (
              <div
                key={property.id}
                onClick={onOpenDashboard}
                className="group cursor-pointer rounded-2xl border border-[#EAE7E0] hover:border-[#4A5D4E] bg-white hover:bg-[#FAF9F5]/60 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden"
              >
                {hasPhoto ? (
                  /* Authentic Real Photo Header */
                  <div className="relative h-48 bg-stone-100 overflow-hidden">
                    <img
                      src={property.imageUrl}
                      alt={property.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30 pointer-events-none" />

                    {/* Overlay Eligibility Badges */}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFavorites(prev => 
                          prev.includes(property.id) 
                            ? prev.filter(id => id !== property.id)
                            : [...prev, property.id]
                        );
                      }}
                      className="absolute top-2.5 right-2.5 z-10 p-2 rounded-xl bg-white/90 shadow-md hover:bg-white transition-colors border border-stone-200"
                    >
                      <Star className={`w-4 h-4 ${favorites.includes(property.id) ? "fill-[#C18C5D] text-[#C18C5D]" : "text-stone-400"}`} />
                    </button>

                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {badges.map(badge => (
                          <span 
                            key={badge.id}
                            className={`${badge.bgClass} text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs border flex items-center gap-1`}
                          >
                            <span>{badge.shortLabel}</span>
                          </span>
                        ))}
                      </div>

                      {property.scorecard && (
                        <span className="bg-white/95 text-[#2D362E] text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                          ★ {property.scorecard.overallRating}/10 Grade {property.scorecard.grade}
                        </span>
                      )}
                    </div>

                    {/* Price and Specs */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-baseline justify-between text-white">
                      <span className="text-2xl font-bold font-serif drop-shadow-sm">
                        {formatUSD(property.price)}
                      </span>
                      <span className="text-xs font-semibold drop-shadow-sm text-stone-200">
                        {property.beds}b • {property.baths}ba • {property.sqft} sqft
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Architectural Header (Clean Data Layout with Badges & Price Cap Status) */
                  <div className="bg-[#FAF9F5] border-b border-[#EAE7E0] p-5 space-y-3">
                    {/* Top classification chips */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E] border border-[#4A5D4E]/20">
                          {property.propertyType}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white text-[#606C5D] border border-[#EAE7E0]">
                          {priceLimitInfo.county} County
                        </span>
                      
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFavorites(prev => 
                              prev.includes(property.id) 
                                ? prev.filter(id => id !== property.id)
                                : [...prev, property.id]
                            );
                          }}
                          className="p-1.5 rounded-lg hover:bg-stone-200 transition-colors shrink-0"
                        >
                          <Star className={`w-4 h-4 ${favorites.includes(property.id) ? "fill-[#C18C5D] text-[#C18C5D]" : "text-stone-400"}`} />
                        </button>
                      </div>
                      
                      {property.scorecard ? (
  
                        <span className="bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-black px-2 py-0.5 rounded-md">
                          ★ {property.scorecard.overallRating}/10 Grade {property.scorecard.grade}
                        </span>
                      ) : property.mlsNumber ? (
                        <span className="text-[10px] text-[#9A9488] font-mono">
                          MLS #{property.mlsNumber}
                        </span>
                      ) : null}
                    </div>

                    {/* Prominent Price & $/sqft */}
                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <span className="text-2xl sm:text-3xl font-bold font-serif text-[#2D362E] tracking-tight">
                          {formatUSD(property.price)}
                        </span>
                        <span className="text-xs text-[#9A9488] ml-2 font-medium">
                          ${Math.round(property.price / (property.sqft || 1))}/sqft
                        </span>
                      </div>
                    </div>

                    {/* Key specs pill row */}
                    <div className="flex items-center gap-3 text-xs text-[#606C5D] font-medium pt-1">
                      <span className="font-bold text-[#2D362E]">{property.beds} Beds</span>
                      <span>•</span>
                      <span className="font-bold text-[#2D362E]">{property.baths} Baths</span>
                      <span>•</span>
                      <span className="font-bold text-[#2D362E]">{property.sqft?.toLocaleString()} sq ft</span>
                      {property.yearBuilt ? (
                        <>
                          <span>•</span>
                          <span>Built {property.yearBuilt}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                )}

                {/* Card Details */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div>
                      <h4 className="font-serif font-bold text-base text-[#2D362E] line-clamp-1 group-hover:text-[#4A5D4E] transition-colors">
                        {property.title}
                      </h4>
                      <p className="text-xs text-[#606C5D] flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#4A5D4E] shrink-0" />
                        <span className="line-clamp-1 font-medium">{property.address}, {property.city}, {property.state} {property.zip}</span>
                      </p>
                    </div>

                    {/* GIS Overlay Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {badges.map(badge => (
                        <span 
                          key={badge.id}
                          className={`${badge.bgClass} text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 shadow-2xs`}
                          title={badge.description}
                        >
                          <CheckCircle2 className="w-2.5 h-2.5 shrink-0 opacity-80" />
                          <span>{badge.shortLabel}</span>
                        </span>
                      ))}
                    </div>

                    {/* OHCS Purchase Price Cap Qualification Banner */}
                    <div className="p-2 rounded-lg bg-[#FAF9F5] border border-[#EAE7E0] text-[11px] text-[#606C5D] space-y-0.5">
                      <div className="flex items-center justify-between font-semibold text-[#2D362E]">
                        <span>{priceLimitInfo.isTargeted ? "Targeted Area Cap" : "Non-Targeted Cap"}:</span>
                        <span className="font-mono text-[#4A5D4E]">${priceLimitInfo.applicablePriceLimit.toLocaleString()}</span>
                      </div>
                      <div className="text-[10px] text-[#9A9488]">
                        {priceLimitInfo.qualificationReason}
                      </div>
                    </div>

                    <p className="text-[11px] text-[#606C5D] line-clamp-2 pt-1 border-t border-[#EAE7E0]/70 leading-relaxed">
                      {property.notes || "Turnkey residence pre-vetted for Oregon state grant assistance and low-rate financing."}
                    </p>
                  </div>

                  {/* Financial Overview & Action CTA */}
                  <div className="pt-3 border-t border-[#EAE7E0] space-y-3">
                    <div className="flex items-center justify-between text-xs bg-[#FAF9F5] p-2.5 rounded-xl border border-[#EAE7E0]/60">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#606C5D] block">Est. Monthly</span>
                        <strong className="text-[#2D362E] font-serif font-bold text-sm">
                          {formatUSD(Math.round(totalEstimatedMonthly))}<span className="text-[10px] font-normal text-[#606C5D]">/mo</span>
                        </strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[#606C5D] block">Annual Tax</span>
                        <span className="text-[#2D362E] font-bold">{formatUSD(property.propertyTaxAnnual)}/yr</span>
                      </div>
                    </div>

                    {/* 1-Click Zillow & Down Payment Aid Action Row */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="text-xs font-bold text-[#4A5D4E] group-hover:underline flex items-center gap-1.5">
                        <span>Calculate DPA Aid</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>

                      <a
                        href={getZillowUrl(property)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-900 border border-blue-200 text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0"
                        title={`Open ${property.address} live listing on Zillow.com`}
                      >
                        <span>View on Zillow</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="text-[10px] text-[#9A9488] flex items-center gap-1 justify-between pt-0.5 border-t border-[#EAE7E0]/40">
                      <span className="truncate">Screening snapshot • Not a loan approval</span>
                      <span className="text-blue-600 font-semibold shrink-0">Verify on Zillow ↗</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Show More Button */}
      {filtered.length > displayCount && (
        <div className="text-center pt-2">
          <button
            onClick={() => setDisplayCount(prev => prev + 12)}
            className="px-6 py-3 rounded-xl bg-[#FAF9F5] hover:bg-[#F1EFE9] border border-[#EAE7E0] text-[#2D362E] font-bold text-xs shadow-2xs transition-colors cursor-pointer"
          >
            Show More Homes ({filtered.length - displayCount} remaining)
          </button>
        </div>
      )}
    
      {favorites.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-fade-in-up">
          <div className="bg-[#2D362E] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 border border-[#4A5D4E]/30">
            <span className="text-sm font-medium">
              <span className="font-bold text-[#C18C5D]">{favorites.length}</span> properties selected
            </span>
            <div className="w-px h-4 bg-white/20" />
            <button
              onClick={() => setShowComparison(true)}
              className="text-sm font-bold bg-[#C18C5D] hover:bg-[#b07d50] px-4 py-1.5 rounded-full transition-colors text-white"
            >
              Compare Affordability
            </button>
          </div>
        </div>
      )}

      {showComparison && (
        <AffordabilityComparisonModal 
          properties={publishedHomes.filter(p => favorites.includes(p.id))}
          onClose={() => setShowComparison(false)}
        />
      )}
    </section>

  );
};
