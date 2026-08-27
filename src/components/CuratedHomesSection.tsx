import React, { useState } from "react";
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
  const publishedHomes = properties.filter(p => p.isPubliclyPublished !== false);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filtered = publishedHomes.filter(p => {
    if (activeFilter === "all") return true;
    if (activeFilter === "usda") return Boolean(p.overlayEligibility?.usdaEligible);
    if (activeFilter === "lmi") return Boolean(p.overlayEligibility?.lmiEligible);
    if (activeFilter === "targeted") return Boolean(p.overlayEligibility?.targetedArea);
    return true;
  });

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
            { id: "usda", label: `USDA 0% Down (${publishedHomes.filter(p => p.overlayEligibility?.usdaEligible).length})` },
            { id: "lmi", label: `OHCS LMI Tracts (${publishedHomes.filter(p => p.overlayEligibility?.lmiEligible).length})` },
            { id: "targeted", label: `Targeted Area Cap (${publishedHomes.filter(p => p.overlayEligibility?.targetedArea).length})` },
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
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
        {filtered.map(property => {
          // Estimated monthly payment with 3.5% down & 6.5% interest rate
          const loanAmount = property.price * 0.965;
          const monthlyPI = calculateMonthlyPI(loanAmount, 6.5, 30);
          const totalEstimatedMonthly = monthlyPI + (property.propertyTaxAnnual / 12) + (property.hoaMonthly || 0) + 120; // +$120 ins/PMI

          return (
            <div
              key={property.id}
              onClick={onOpenDashboard}
              className="group cursor-pointer rounded-2xl border border-[#EAE7E0] hover:border-[#4A5D4E] bg-white hover:bg-[#FAF9F5]/40 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden"
            >
              {/* Photo & GIS Badges */}
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
                    {property.overlayEligibility?.usdaEligible && (
                      <span className="bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" />
                        <span>USDA 0% Down</span>
                      </span>
                    )}
                    {property.overlayEligibility?.lmiEligible && (
                      <span className="bg-[#C18C5D] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                        OHCS LMI Qualified
                      </span>
                    )}
                    {property.overlayEligibility?.targetedArea && (
                      <span className="bg-amber-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                        Targeted Area
                      </span>
                    )}
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
                    {property.beds} bed • {property.baths} bath • {property.sqft.toLocaleString()} sqft
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h4 className="font-serif font-bold text-base text-[#2D362E] group-hover:text-[#4A5D4E] transition-colors leading-snug">
                    {property.title}
                  </h4>
                  <p className="text-xs text-[#606C5D] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#4A5D4E] shrink-0" />
                    <span>{property.address}, {property.city}, {property.state} {property.zip}</span>
                  </p>
                  {property.notes && (
                    <p className="text-xs text-[#606C5D] line-clamp-2 leading-relaxed bg-[#FAF9F5] p-2.5 rounded-xl border border-[#EAE7E0]/70">
                      {property.notes}
                    </p>
                  )}
                </div>

                {/* Monthly Cost & CTA */}
                <div className="pt-3 border-t border-[#EAE7E0] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#606C5D]">Est. Total Monthly:</span>
                    <span className="font-bold text-[#4A5D4E] text-sm">
                      {formatUSD(totalEstimatedMonthly)}/mo
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenLeadBot) {
                          onOpenLeadBot();
                        } else {
                          onOpenDashboard();
                        }
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <span>Inquire About This Home</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Banner */}
      <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#EAE7E0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#4A5D4E]/10 text-[#4A5D4E] flex items-center justify-center font-bold shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-bold text-sm text-[#2D362E]">Looking for homes in another Oregon county?</h5>
            <p className="text-xs text-[#606C5D]">
              Our GIS engine tracks all 36 Oregon counties with automated down payment assistance qualification.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenDashboard}
          className="px-4 py-2 bg-white hover:bg-[#F1EFE9] border border-[#EAE7E0] text-[#2D362E] font-bold text-xs rounded-xl shadow-2xs transition-colors shrink-0 flex items-center gap-1.5"
        >
          <span>Open Full Homebuyer Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#4A5D4E]" />
        </button>
      </div>
    </section>
  );
};
