import { PropertyListing, OverlayEligibility } from "../types";
import { 
  getPropertyOhcsPriceLimit, 
  normalizeOregonCounty, 
  OREGON_COUNTY_PRICE_LIMITS,
  CountyPriceLimitInfo 
} from "./ohcsPurchaseLimits";

/**
 * Checks whether a property has an authentic photo from an active MLS/RentCast feed or real upload,
 * rather than a generic stock photo placeholder.
 */
export function hasAuthenticPropertyPhoto(listing?: PropertyListing | null): boolean {
  if (!listing || !listing.imageUrl) return false;
  const url = String(listing.imageUrl).trim().toLowerCase();
  if (!url) return false;
  if (url.includes("unsplash.com") || url.includes("placeholder") || url.includes("images.unsplash")) {
    return false;
  }
  return true;
}

/**
 * Checks whether a property is eligible for USDA Rural Development 100% (0% down) financing.
 * In GeoSphere Oregon GIS, USDA source polygons represent ineligible urban areas,
 * so listings situated outside those boundaries are classified as USDA RD eligible.
 */
export function isUsdaEligible(listing: PropertyListing): boolean {
  if (!listing || !listing.overlayEligibility) return false;
  const el = listing.overlayEligibility;
  return Boolean(
    el.usda === true ||
    el.usdaEligible === true ||
    el.usdaInterpretation === "outside-ineligible-v1"
  );
}

/**
 * Checks whether a property is situated within an OHCS / FFIEC Low-to-Moderate Income (LMI) Census Tract
 * (qualifying for enhanced OHCS Flex Lending 3% or 5% cash assistance grants).
 */
export function isLmiEligible(listing: PropertyListing): boolean {
  if (!listing || !listing.overlayEligibility) return false;
  const el = listing.overlayEligibility;
  return Boolean(
    el.lmi === true ||
    el.lmiEligible === true ||
    el.firstHome?.lmiEligible === true ||
    (typeof el.lmiPercentage === "number" && el.lmiPercentage <= 80)
  );
}

/**
 * Checks whether a property achieves Dual Overlay Qualification:
 * Qualifying for BOTH USDA 100% 0% Down financing AND OHCS Flex Lending LMI Assistance grants.
 */
export function isLmiUsdaDual(listing: PropertyListing): boolean {
  return isUsdaEligible(listing) && isLmiEligible(listing);
}

/**
 * Checks whether a property is situated in an OHCS Designated Targeted Area
 * (e.g. Entire Coos County, Clatsop County, Baker County, or specific census tracts/cities).
 * Targeted areas offer higher purchase price caps ($692k-$789k) and higher household income limits.
 */
export function isTargetedArea(listing: PropertyListing): boolean {
  if (!listing || !listing.overlayEligibility) return false;
  const el = listing.overlayEligibility;
  
  if (el.firstHome?.areaType === "targeted") return true;
  if (el.targetedArea === true) return true;

  const details = el.firstHome?.targetedAreaDetails || "";
  if (/entire county is targeted/i.test(details)) return true;
  if (/within the city limits/i.test(details) && details.toLowerCase().includes(String(listing.city || "").toLowerCase())) {
    return true;
  }

  // Cross-reference authoritative Oregon county price limits
  const limitInfo = getPropertyOhcsPriceLimit(
    listing.price, 
    el.countyName || listing.city, 
    listing.city, 
    el.lmiCensusTract || el.geoid
  );
  return limitInfo.isTargeted;
}

/**
 * Checks whether a property is in an OHCS Non-Targeted Area.
 */
export function isNonTargetedArea(listing: PropertyListing): boolean {
  return !isTargetedArea(listing);
}

/**
 * Checks whether the listing price falls within the official OHCS FirstHome / Flex Lending purchase price cap
 * for the respective county, targeted / non-targeted status, and census tract.
 */
export function isFirstHomePriceEligible(listing: PropertyListing): boolean {
  if (!listing) return false;
  const el = listing.overlayEligibility;

  // Direct calculation from authoritative Oregon County limits
  const limitInfo = getPropertyOhcsPriceLimit(
    listing.price,
    el?.countyName || listing.city,
    listing.city,
    el?.lmiCensusTract || el?.geoid,
    el?.targetedArea
  );

  return limitInfo.isPriceEligible;
}

/**
 * Checks whether listing price specifically meets the NON-TARGETED maximum purchase price limit
 * for its county and census tract.
 */
export function isNonTargetedPriceEligible(listing: PropertyListing): boolean {
  if (!listing) return false;
  const el = listing.overlayEligibility;
  const limitInfo = getPropertyOhcsPriceLimit(
    listing.price,
    el?.countyName || listing.city,
    listing.city,
    el?.lmiCensusTract || el?.geoid
  );
  return listing.price <= limitInfo.nonTargetedLimit;
}

/**
 * Checks whether listing price specifically meets the TARGETED AREA maximum purchase price limit
 * for its county and census tract.
 */
export function isTargetedPriceEligible(listing: PropertyListing): boolean {
  if (!listing) return false;
  const el = listing.overlayEligibility;
  const limitInfo = getPropertyOhcsPriceLimit(
    listing.price,
    el?.countyName || listing.city,
    listing.city,
    el?.lmiCensusTract || el?.geoid,
    true // evaluate against targeted limit
  );
  return listing.price <= limitInfo.targetedLimit;
}

export interface OverlayBadgeInfo {
  id: string;
  label: string;
  shortLabel: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  description: string;
}

/**
 * Returns complete badge configurations for any property listing matching user specifications:
 * "USDA RD", "Flex Lending/LMI", "USDA RD+Flex", "Targeted Area Cap", "Non-Targeted Cap", etc.
 */
export function getListingOverlayBadges(listing: PropertyListing): OverlayBadgeInfo[] {
  const badges: OverlayBadgeInfo[] = [];

  const usda = isUsdaEligible(listing);
  const lmi = isLmiEligible(listing);
  const dual = usda && lmi;
  const targeted = isTargetedArea(listing);
  const priceEligible = isFirstHomePriceEligible(listing);
  const limitInfo = getPropertyOhcsPriceLimit(
    listing.price,
    listing.overlayEligibility?.countyName || listing.city,
    listing.city,
    listing.overlayEligibility?.lmiCensusTract || listing.overlayEligibility?.geoid,
    listing.overlayEligibility?.targetedArea
  );

  // 1. Primary Financing & DPA Badges
  if (dual) {
    badges.push({
      id: "dual_usda_lmi",
      label: "USDA RD + Flex Lending (0% Down + Grant)",
      shortLabel: "USDA RD+Flex",
      bgClass: "bg-emerald-900 text-emerald-100 border-emerald-500/40",
      textClass: "text-emerald-100",
      borderClass: "border-emerald-500/40",
      description: "Dual Qualified: USDA 100% (0% down) financing + OHCS Flex Lending cash assistance grant",
    });
  } else {
    if (usda) {
      badges.push({
        id: "usda",
        label: "USDA Rural Development (0% Down)",
        shortLabel: "USDA RD",
        bgClass: "bg-emerald-800 text-emerald-100 border-emerald-400/40",
        textClass: "text-emerald-100",
        borderClass: "border-emerald-400/40",
        description: "Outside USDA ineligible urban boundary — 100% financing with zero down payment",
      });
    }

    if (lmi) {
      badges.push({
        id: "lmi",
        label: "OHCS Flex Lending / LMI Tract Approved",
        shortLabel: "Flex Lending/LMI",
        bgClass: "bg-[#C18C5D] text-white border-amber-400/40",
        textClass: "text-white",
        borderClass: "border-amber-400/40",
        description: "Low-to-Moderate income census tract eligible for enhanced Flex Lending 3%-5% grant assistance",
      });
    }
  }

  // 2. Targeted vs Non-Targeted Area Cap Badges
  if (targeted) {
    badges.push({
      id: "targeted",
      label: `Targeted Area ($${(limitInfo.targetedLimit).toLocaleString()} Cap)`,
      shortLabel: "Targeted Area Cap",
      bgClass: "bg-teal-800 text-teal-100 border-teal-400/40",
      textClass: "text-teal-100",
      borderClass: "border-teal-400/40",
      description: `${limitInfo.county} County Targeted Area with elevated purchase price limit ($${limitInfo.targetedLimit.toLocaleString()})`,
    });
  } else if (priceEligible) {
    badges.push({
      id: "non_targeted_cap",
      label: `Non-Targeted Cap ($${(limitInfo.nonTargetedLimit).toLocaleString()})`,
      shortLabel: "Non-Targeted Cap",
      bgClass: "bg-blue-900 text-blue-100 border-blue-400/40",
      textClass: "text-blue-100",
      borderClass: "border-blue-400/40",
      description: `Within standard non-targeted price limit of $${limitInfo.nonTargetedLimit.toLocaleString()}`,
    });
  }

  // 3. Price Cap Compliance Badge (if price is under applicable cap)
  if (priceEligible && !badges.some(b => b.id === "targeted" || b.id === "non_targeted_cap")) {
    badges.push({
      id: "firsthome_price",
      label: "FirstHome Cap Eligible",
      shortLabel: "Under Price Cap",
      bgClass: "bg-[#4A5D4E] text-stone-100 border-[#4A5D4E]/40",
      textClass: "text-stone-100",
      borderClass: "border-[#4A5D4E]/40",
      description: limitInfo.qualificationReason,
    });
  }

  return badges;
}

export interface OverlaySummaryCounts {
  total: number;
  usda: number;
  lmi: number;
  lmiUsda: number;
  firstHomePriceEligible: number;
  targeted: number;
  nonTargeted: number;
  targetedPriceEligible: number;
  nonTargetedPriceEligible: number;
  published: number;
  draft: number;
  singleFamily: number;
  manufactured: number;
  condo: number;
  townhouse: number;
}

/**
 * Calculates comprehensive statistical overlay metrics across any dataset of listings.
 */
export function calculateOverlayCounts(listings: PropertyListing[]): OverlaySummaryCounts {
  const counts: OverlaySummaryCounts = {
    total: listings.length,
    usda: 0,
    lmi: 0,
    lmiUsda: 0,
    firstHomePriceEligible: 0,
    targeted: 0,
    nonTargeted: 0,
    targetedPriceEligible: 0,
    nonTargetedPriceEligible: 0,
    published: 0,
    draft: 0,
    singleFamily: 0,
    manufactured: 0,
    condo: 0,
    townhouse: 0,
  };

  listings.forEach((l) => {
    const usda = isUsdaEligible(l);
    const lmi = isLmiEligible(l);
    const dual = usda && lmi;
    const targeted = isTargetedArea(l);
    const priceEligible = isFirstHomePriceEligible(l);
    const nonTargetedPriceEligible = isNonTargetedPriceEligible(l);
    const targetedPriceEligible = isTargetedPriceEligible(l);

    if (usda) counts.usda++;
    if (lmi) counts.lmi++;
    if (dual) counts.lmiUsda++;
    if (targeted) counts.targeted++;
    else counts.nonTargeted++;
    if (priceEligible) counts.firstHomePriceEligible++;
    if (targetedPriceEligible) counts.targetedPriceEligible++;
    if (nonTargetedPriceEligible) counts.nonTargetedPriceEligible++;

    if (l.isPubliclyPublished) counts.published++;
    else counts.draft++;

    const ptype = String(l.propertyType || "").toLowerCase();
    if (ptype.includes("single")) counts.singleFamily++;
    else if (ptype.includes("manufactured") || ptype.includes("mobile")) counts.manufactured++;
    else if (ptype.includes("condo")) counts.condo++;
    else if (ptype.includes("townhouse")) counts.townhouse++;
  });

  return counts;
}

/**
 * Accurately filters an array of PropertyListings based on the active overlay filter,
 * search term, property type, price range, targeted/non-targeted price limits, and published status.
 */
export function filterListings(
  listings: PropertyListing[],
  options: {
    overlayFilter?: string; // 'all' | 'usda' | 'lmi' | 'lmi_usda' | 'targeted' | 'non_targeted' | 'price_eligible' | 'targeted_price' | 'non_targeted_price' | 'published' | 'draft'
    searchQuery?: string;
    propertyType?: string; // 'all' | 'Single Family' | 'Manufactured' | 'Condo' | 'Townhouse' | 'Multi-Family'
    county?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    minBeds?: number;
  }
): PropertyListing[] {
  const {
    overlayFilter = "all",
    searchQuery = "",
    propertyType = "all",
    county = "all",
    city = "all",
    minPrice,
    maxPrice,
    minBeds,
  } = options;

  return listings.filter((listing) => {
    // 1. Overlay & Price Cap Filter Logic
    if (overlayFilter === "usda" && !isUsdaEligible(listing)) return false;
    if (overlayFilter === "lmi" && !isLmiEligible(listing)) return false;
    if (overlayFilter === "lmi_usda" && !isLmiUsdaDual(listing)) return false;
    if (overlayFilter === "targeted" && !isTargetedArea(listing)) return false;
    if (overlayFilter === "non_targeted" && !isNonTargetedArea(listing)) return false;
    if (overlayFilter === "price_eligible" && !isFirstHomePriceEligible(listing)) return false;
    if (overlayFilter === "targeted_price" && !isTargetedPriceEligible(listing)) return false;
    if (overlayFilter === "non_targeted_price" && !isNonTargetedPriceEligible(listing)) return false;
    if (overlayFilter === "published" && !listing.isPubliclyPublished) return false;
    if (overlayFilter === "draft" && listing.isPubliclyPublished) return false;

    // 2. Property Type Filter
    if (propertyType !== "all" && propertyType) {
      const ptype = String(listing.propertyType || "").toLowerCase();
      const targetPtype = propertyType.toLowerCase();
      if (!ptype.includes(targetPtype)) return false;
    }

    // 3. County Filter
    if (county !== "all" && county) {
      const normListingCounty = normalizeOregonCounty(
        listing.overlayEligibility?.countyName || listing.county,
        listing.city
      ).toLowerCase();
      const normTargetCounty = county.toLowerCase().replace(/\s*county\s*/i, "").trim();
      if (!normListingCounty.includes(normTargetCounty) && !String(listing.city || "").toLowerCase().includes(normTargetCounty)) {
        return false;
      }
    }

    // 4. City Filter
    if (city !== "all" && city) {
      const listingCity = String(listing.city || "").toLowerCase();
      if (!listingCity.includes(city.toLowerCase().trim())) return false;
    }

    // 5. Price Boundaries
    if (typeof minPrice === "number" && listing.price < minPrice) return false;
    if (typeof maxPrice === "number" && listing.price > maxPrice) return false;

    // 6. Min Bedrooms
    if (typeof minBeds === "number" && (listing.beds || 0) < minBeds) return false;

    // 7. Text Search Query (City, County, Address, Zip, MLS, Census Tract)
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = listing.title?.toLowerCase().includes(q);
      const matchAddress = listing.address?.toLowerCase().includes(q);
      const matchCity = listing.city?.toLowerCase().includes(q);
      const matchZip = listing.zip?.toLowerCase().includes(q);
      const matchCounty = listing.overlayEligibility?.countyName?.toLowerCase().includes(q) || listing.county?.toLowerCase().includes(q);
      const matchTract = listing.overlayEligibility?.lmiCensusTract?.toLowerCase().includes(q) || listing.overlayEligibility?.geoid?.toLowerCase().includes(q);
      const matchMls = listing.mlsNumber?.toLowerCase().includes(q);
      const matchNotes = listing.notes?.toLowerCase().includes(q);
      const matchAgent = listing.listingAgent?.name?.toLowerCase().includes(q);

      if (!matchTitle && !matchAddress && !matchCity && !matchZip && !matchCounty && !matchTract && !matchMls && !matchNotes && !matchAgent) {
        return false;
      }
    }

    return true;
  });
}
