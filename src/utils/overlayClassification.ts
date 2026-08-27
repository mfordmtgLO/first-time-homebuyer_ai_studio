import { PropertyListing, OverlayEligibility } from "../types";

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
 * Qualifying for BOTH USDA 100% 0% Down financing AND OHCS LMI Assistance grants.
 */
export function isLmiUsdaDual(listing: PropertyListing): boolean {
  return isUsdaEligible(listing) && isLmiEligible(listing);
}

/**
 * Checks whether the listing price falls within the official OHCS FirstHome purchase price cap
 * for the respective county and targeted / non-targeted status.
 */
export function isFirstHomePriceEligible(listing: PropertyListing): boolean {
  if (!listing) return false;
  const el = listing.overlayEligibility;
  if (!el) return true;

  if (el.firstHome?.priceEligible !== undefined && el.firstHome?.priceEligible !== null) {
    return Boolean(el.firstHome.priceEligible);
  }

  const priceLimit = el.firstHomePriceCap || el.firstHome?.priceLimit;
  if (typeof priceLimit === "number" && priceLimit > 0) {
    return Number(listing.price) <= priceLimit;
  }

  return true;
}

/**
 * Checks whether a property is situated in an OHCS Designated Targeted Area
 * (e.g. Entire Coos County, Clatsop County, Baker County, or specific census tracts/cities).
 * Targeted areas offer higher purchase price caps and higher household income limits.
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

  return false;
}

/**
 * Checks whether a property is in an OHCS Non-Targeted Area.
 */
export function isNonTargetedArea(listing: PropertyListing): boolean {
  if (!listing || !listing.overlayEligibility) return false;
  const el = listing.overlayEligibility;

  if (el.firstHome?.areaType === "non_targeted" || el.firstHome?.areaType === "non-targeted") {
    return true;
  }
  if (el.targetedArea === false) return true;

  return !isTargetedArea(listing);
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
 * Returns complete badge configurations for any property listing.
 */
export function getListingOverlayBadges(listing: PropertyListing): OverlayBadgeInfo[] {
  const badges: OverlayBadgeInfo[] = [];

  const usda = isUsdaEligible(listing);
  const lmi = isLmiEligible(listing);
  const dual = usda && lmi;
  const targeted = isTargetedArea(listing);
  const priceEligible = isFirstHomePriceEligible(listing);

  if (dual) {
    badges.push({
      id: "dual_usda_lmi",
      label: "Dual USDA + LMI Qualified",
      shortLabel: "USDA + LMI",
      bgClass: "bg-emerald-900/90",
      textClass: "text-emerald-100",
      borderClass: "border-emerald-500/30",
      description: "Qualifies for both USDA 100% (0% down) financing and OHCS LMI DPA grants",
    });
  } else {
    if (usda) {
      badges.push({
        id: "usda",
        label: "USDA 0% Down Eligible",
        shortLabel: "USDA 0% Down",
        bgClass: "bg-emerald-800/90",
        textClass: "text-emerald-100",
        borderClass: "border-emerald-400/30",
        description: "Outside USDA ineligible urban boundary — 100% financing with zero down payment",
      });
    }

    if (lmi) {
      badges.push({
        id: "lmi",
        label: "OHCS LMI Tract Approved",
        shortLabel: "LMI Tract",
        bgClass: "bg-[#C18C5D]/90",
        textClass: "text-white",
        borderClass: "border-amber-400/30",
        description: "Low-to-Moderate income census tract eligible for enhanced Flex Lending assistance",
      });
    }
  }

  if (targeted) {
    badges.push({
      id: "targeted",
      label: "Targeted Area Cap",
      shortLabel: "Targeted Area",
      bgClass: "bg-teal-800/90",
      textClass: "text-teal-100",
      borderClass: "border-teal-400/30",
      description: `Targeted area benefit with elevated purchase price limit ($${(listing.overlayEligibility?.firstHomePriceCap || listing.overlayEligibility?.firstHome?.priceLimit || 692211).toLocaleString()})`,
    });
  }

  if (priceEligible) {
    badges.push({
      id: "firsthome_price",
      label: "FirstHome Cap Eligible",
      shortLabel: "Under Price Cap",
      bgClass: "bg-[#4A5D4E]/90",
      textClass: "text-stone-100",
      borderClass: "border-[#4A5D4E]/40",
      description: "Listing price is within official OHCS FirstHome purchase price limits",
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

    if (usda) counts.usda++;
    if (lmi) counts.lmi++;
    if (dual) counts.lmiUsda++;
    if (targeted) counts.targeted++;
    else counts.nonTargeted++;
    if (priceEligible) counts.firstHomePriceEligible++;

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
 * search term, property type, price range, and published status.
 */
export function filterListings(
  listings: PropertyListing[],
  options: {
    overlayFilter?: string; // 'all' | 'usda' | 'lmi' | 'lmi_usda' | 'targeted' | 'non_targeted' | 'price_eligible' | 'published' | 'draft'
    searchQuery?: string;
    propertyType?: string; // 'all' | 'Single Family' | 'Manufactured' | 'Condo' | 'Townhouse' | 'Multi-Family'
    county?: string;
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
    minPrice,
    maxPrice,
    minBeds,
  } = options;

  return listings.filter((listing) => {
    // 1. Overlay Filter Logic
    if (overlayFilter === "usda" && !isUsdaEligible(listing)) return false;
    if (overlayFilter === "lmi" && !isLmiEligible(listing)) return false;
    if (overlayFilter === "lmi_usda" && !isLmiUsdaDual(listing)) return false;
    if (overlayFilter === "targeted" && !isTargetedArea(listing)) return false;
    if (overlayFilter === "non_targeted" && !isNonTargetedArea(listing)) return false;
    if (overlayFilter === "price_eligible" && !isFirstHomePriceEligible(listing)) return false;
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
      const listingCounty = String(listing.overlayEligibility?.countyName || listing.city || "").toLowerCase();
      if (!listingCounty.includes(county.toLowerCase())) return false;
    }

    // 4. Price Boundaries
    if (typeof minPrice === "number" && listing.price < minPrice) return false;
    if (typeof maxPrice === "number" && listing.price > maxPrice) return false;

    // 5. Min Bedrooms
    if (typeof minBeds === "number" && (listing.beds || 0) < minBeds) return false;

    // 6. Text Search Query
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = listing.title?.toLowerCase().includes(q);
      const matchAddress = listing.address?.toLowerCase().includes(q);
      const matchCity = listing.city?.toLowerCase().includes(q);
      const matchZip = listing.zip?.toLowerCase().includes(q);
      const matchCounty = listing.overlayEligibility?.countyName?.toLowerCase().includes(q);
      const matchMls = listing.mlsNumber?.toLowerCase().includes(q);
      const matchNotes = listing.notes?.toLowerCase().includes(q);
      const matchAgent = listing.listingAgent?.name?.toLowerCase().includes(q);

      if (!matchTitle && !matchAddress && !matchCity && !matchZip && !matchCounty && !matchMls && !matchNotes && !matchAgent) {
        return false;
      }
    }

    return true;
  });
}
