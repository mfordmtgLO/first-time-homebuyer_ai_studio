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
  Check
} from "lucide-react";
import { PropertyListing, LoanOfficerProfile, RealEstateAgentProfile } from "../types";
import { formatUSD, calculateMonthlyPI } from "../utils/mortgageMath";
import { 
  isUsdaEligible, 
  isLmiEligible, 
  isLmiUsdaDual, 
  isTargetedArea, 
  isFirstHomePriceEligible, 
  calculateOverlayCounts, 
  getListingOverlayBadges,
  hasAuthenticPropertyPhoto
} from "../utils/overlayClassification";

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
  const [displayCount, setDisplayCount] = useState<number>(6);

  // Accurate overlay counts for published homes
  const counts = useMemo(() => {
    return calculateOverlayCounts(publishedHomes);
  }, [publishedHomes]);

  const filtered = useMemo(() => {
    return publishedHomes.filter(p => {
      if (activeFilter === "all") return true;
      if (activeFilter === "usda") return isUsdaEligible(p);
      if (activeFilter === "lmi") return isLmiEligible(p);
      if (activeFilter === "lmi_usda") return isLmiUsdaDual(p);
      if (activeFilter === "targeted") return isTargetedArea(p);
      if (activeFilter === "price_eligible") return isFirstHomePriceEligible(p);
      return true;
    });
  }, [publishedHomes, activeFilter]);

  const visibleProperties = filtered.slice(0, displayCount);

  if (publishedHomes.length === 0) {
    return null; // Don't display empty section if LO has not published any listings
  }

  return (
    <section className="bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-10 space-y-8 shadow-sm">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF9F5] text-[#4A5D4E] text-xs font-bold border border-[#EAE7E0]">
            <Sparkles className="w-3.5 h-3.5 text-[#C18C5D]" />
            <span>Pre-Screened Grant & Program Qualified Listings</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D362E] tracking-tight">
            Curated Eligible Homes in Oregon
          </h3>
          <p className="text-xs sm:text-sm text-[#606C5D] leading-relaxed">
            Every home below is pre-audited by your local advisory team against official GIS overlays for USDA 0% Down rural zones, OHCS Flex Lending census tracts, and FirstHome price caps.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: "all", label: `All Homes (${publishedHomes.length})` },
            { id: "usda", label: `USDA 0% Down (${counts.usda})` },
            { id: "lmi", label: `OHCS LMI Tracts (${counts.lmi})` },
            { id: "lmi_usda", label: `Dual USDA + LMI (${counts.lmiUsda})` },
            { id: "targeted", label: `Targeted Area Cap (${counts.targeted})` },
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => {
                setActiveFilter(filter.id);
                setDisplayCount(6);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === filter.id
                  ? "bg-[#4A5D4E] text-white shadow-2xs font-bold"
                  : "bg-[#F9F8F4] text-[#606C5D] hover:bg-[#F1EFE9] border border-[#EAE7E0]"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleProperties.map(property => {
          // Estimated monthly payment with 3.5% down & 6.5% interest rate
          const loanAmount = property.price * 0.965;
          const monthlyPI = calculateMonthlyPI(loanAmount, 6.5, 30);
          const totalEstimatedMonthly = monthlyPI + (property.propertyTaxAnnual / 12) + (property.hoaMonthly || 0) + 120; // +$120 ins/PMI
          const badges = getListingOverlayBadges(property);
          const hasPhoto = hasAuthenticPropertyPhoto(property);

          return (
            <div
              key={property.id}
              onClick={onOpenDashboard}
              className="group cursor-pointer rounded-2xl border border-[#EAE7E0] hover:border-[#4A5D4E] bg-white hover:bg-[#FAF9F5]/60 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden"
            >
              {hasPhoto ? (
                /* Authentic Real Photo Header (Only rendered when a genuine photo exists) */
                <div className="relative h-48 bg-stone-100 overflow-hidden">
                  <img
                    src={property.imageUrl}
                    alt={property.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

                  {/* Overlay Eligibility Chips */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {badges.map(badge => (
                        <span 
                          key={badge.id}
                          className={`${badge.bgClass} ${badge.textClass} text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1`}
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
                /* Architectural Header (No Stock Photos - Clean Data Layout) */
                <div className="bg-[#FAF9F5] border-b border-[#EAE7E0] p-5 space-y-3">
                  {/* Top classification chips */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E] border border-[#4A5D4E]/20">
                        {property.propertyType}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white text-[#606C5D] border border-[#EAE7E0]">
                        {property.county || property.overlayEligibility?.countyName || "Oregon"}
                      </span>
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

                  {/* GIS Badges (Rendered cleanly below address in architectural mode) */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {badges.map(badge => (
                      <span 
                        key={badge.id}
                        className={`${badge.bgClass} ${badge.textClass} text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1`}
                      >
                        <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
                        <span>{badge.label}</span>
                      </span>
                    ))}
                  </div>

                  <p className="text-[11px] text-[#606C5D] line-clamp-2 pt-2 border-t border-[#EAE7E0]/70 leading-relaxed">
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

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-xs font-bold text-[#4A5D4E] group-hover:underline flex items-center gap-1.5">
                      <span>Calculate Down Payment Aid</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show More Button */}
      {filtered.length > displayCount && (
        <div className="text-center pt-2">
          <button
            onClick={() => setDisplayCount(prev => prev + 6)}
            className="px-6 py-3 rounded-xl bg-[#FAF9F5] hover:bg-[#F1EFE9] border border-[#EAE7E0] text-[#2D362E] font-bold text-xs shadow-2xs transition-colors cursor-pointer"
          >
            Show More Homes ({filtered.length - displayCount} remaining)
          </button>
        </div>
      )}
    </section>
  );
};
