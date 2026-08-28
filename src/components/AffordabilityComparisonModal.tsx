import React from "react";
import { X, CheckCircle2, DollarSign, Calculator, MapPin, Building, AlertCircle } from "lucide-react";
import { PropertyListing } from "../types";
import { formatUSD, calculateMonthlyPI } from "../utils/mortgageMath";
import { getPropertyOhcsPriceLimit } from "../utils/ohcsPurchaseLimits";
import { isUsdaEligible, isLmiEligible, getListingOverlayBadges } from "../utils/overlayClassification";

interface AffordabilityComparisonModalProps {
  properties: PropertyListing[];
  onClose: () => void;
}

export const AffordabilityComparisonModal: React.FC<AffordabilityComparisonModalProps> = ({
  properties,
  onClose
}) => {
  if (!properties || properties.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#EAE7E0] flex items-center justify-between bg-[#FAF9F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4A5D4E]/10 text-[#4A5D4E] flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#2D362E] font-serif">Side-by-Side Affordability Comparison</h3>
              <p className="text-xs text-[#606C5D]">Comparing {properties.length} selected properties</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-2 rounded-xl hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
          <div className="flex gap-6 min-w-max">
            {properties.map(property => {
              const loanAmount = property.price * 0.965;
              const monthlyPI = calculateMonthlyPI(loanAmount, 6.5, 30);
              const monthlyTax = property.propertyTaxAnnual / 12;
              const monthlyHOA = property.hoaMonthly || 0;
              const monthlyInsurance = 120; // Estimated
              const totalEstimatedMonthly = monthlyPI + monthlyTax + monthlyHOA + monthlyInsurance;
              
              const badges = getListingOverlayBadges(property);
              const priceLimitInfo = getPropertyOhcsPriceLimit(
                property.price,
                property.overlayEligibility?.countyName || property.county,
                property.city,
                property.overlayEligibility?.lmiCensusTract || property.overlayEligibility?.geoid,
                property.overlayEligibility?.targetedArea
              );
              
              const usdaEligible = isUsdaEligible(property);
              const lmiEligible = isLmiEligible(property);

              return (
                <div key={property.id} className="w-[320px] border border-[#EAE7E0] rounded-2xl overflow-hidden flex flex-col shadow-sm bg-white shrink-0">
                  <div className="h-40 bg-stone-100 relative">
                    {property.imageUrl && !property.imageUrl.includes('placeholder') ? (
                      <img src={property.imageUrl} alt={property.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300">
                        <Building className="w-10 h-10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="text-xl font-bold font-serif">{formatUSD(property.price)}</div>
                      <div className="text-xs truncate flex items-center gap-1 opacity-90">
                        <MapPin className="w-3 h-3" /> {property.address}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-4 flex-1">
                    {/* Basic Specs */}
                    <div className="flex justify-between items-center text-xs font-bold text-[#606C5D] border-b border-[#EAE7E0] pb-3">
                      <span>{property.beds} Bed</span>
                      <span>{property.baths} Bath</span>
                      <span>{property.sqft} SQFT</span>
                    </div>

                    {/* Affordability Breakdown */}
                    <div className="space-y-2.5">
                      <div className="text-[10px] font-bold text-[#9A9488] uppercase tracking-wider">Est. Monthly Cost Breakdown</div>
                      
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[#606C5D]">Principal & Interest (6.5%)</span>
                          <span className="font-medium text-[#2D362E]">{formatUSD(monthlyPI)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#606C5D]">Property Taxes</span>
                          <span className="font-medium text-[#2D362E]">{formatUSD(monthlyTax)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#606C5D]">Home Insurance (Est)</span>
                          <span className="font-medium text-[#2D362E]">{formatUSD(monthlyInsurance)}</span>
                        </div>
                        {monthlyHOA > 0 && (
                          <div className="flex justify-between">
                            <span className="text-[#606C5D]">HOA Dues</span>
                            <span className="font-medium text-[#2D362E]">{formatUSD(monthlyHOA)}</span>
                          </div>
                        )}
                        <div className="flex justify-between pt-2 border-t border-stone-100 font-bold text-sm">
                          <span className="text-[#2D362E]">Total Est. Payment</span>
                          <span className="text-[#4A5D4E]">{formatUSD(totalEstimatedMonthly)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Eligibility & Grants */}
                    <div className="space-y-2.5 pt-3 border-t border-[#EAE7E0]">
                      <div className="text-[10px] font-bold text-[#9A9488] uppercase tracking-wider">Program Eligibility</div>
                      
                      <div className="space-y-2">
                        <div className={`p-2 rounded-lg text-[11px] font-medium flex items-center justify-between ${usdaEligible ? 'bg-emerald-50 text-emerald-900 border border-emerald-100' : 'bg-stone-50 text-stone-500 border border-stone-100'}`}>
                          <span>USDA 0% Down</span>
                          {usdaEligible ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertCircle className="w-3.5 h-3.5" />}
                        </div>
                        
                        <div className={`p-2 rounded-lg text-[11px] font-medium flex items-center justify-between ${lmiEligible ? 'bg-amber-50 text-amber-900 border border-amber-100' : 'bg-stone-50 text-stone-500 border border-stone-100'}`}>
                          <span>LMI Flex Lending Tract</span>
                          {lmiEligible ? <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> : <AlertCircle className="w-3.5 h-3.5" />}
                        </div>

                        <div className={`p-2 rounded-lg text-[11px] font-medium flex items-center justify-between ${priceLimitInfo.isPriceEligible ? 'bg-teal-50 text-teal-900 border border-teal-100' : 'bg-red-50 text-red-900 border border-red-100'}`}>
                          <span>Price Cap Eligible</span>
                          {priceLimitInfo.isPriceEligible ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> : <AlertCircle className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
