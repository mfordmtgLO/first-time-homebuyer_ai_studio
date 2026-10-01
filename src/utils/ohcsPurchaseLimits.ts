/**
 * @deprecated [P1-5 PROGRAM-RULE SOURCE OF TRUTH]
 * These hardcoded TypeScript reference tables are retained for backward-compatible
 * client UI rendering only. Runtime program screening and eligibility evaluation MUST NOT
 * consult these static tables; the canonical source of truth is GeoSphere's verbatim
 * `overlayEligibility` enrichment generated upstream and synced to the Firestore `curated_listings` store.
 * Canonical Source: `geosphere-map-oregon-ai-studio` repo JSON datasets & GeoSphere sync snapshots.
 *
 * Authoritative Oregon Housing and Community Services (OHCS) FirstHome & Flex Lending
 * Purchase Price Limits and Targeted Area Reference Table.
 * Covers all 36 Oregon counties with Targeted and Non-Targeted maximum purchase price caps.
 */

export interface CountyPriceLimitInfo {
  county: string;
  nonTargetedLimit: number;
  targetedLimit: number;
  isEntireCountyTargeted: boolean;
  targetedCitiesOrTracts?: string[];
  notes?: string;
}

export const OREGON_COUNTY_PRICE_LIMITS: Record<string, CountyPriceLimitInfo> = {
  "Baker": {
    county: "Baker",
    nonTargetedLimit: 566354,
    targetedLimit: 692211,
    isEntireCountyTargeted: true,
    notes: "Entire County is designated as an OHCS Targeted Area."
  },
  "Benton": {
    county: "Benton",
    nonTargetedLimit: 645712,
    targetedLimit: 789203,
    isEntireCountyTargeted: false,
    targetedCitiesOrTracts: ["Corvallis Tracts 010100, 010200, 010700"],
    notes: "High-cost county. Elevated non-targeted cap."
  },
  "Clackamas": {
    county: "Clackamas",
    nonTargetedLimit: 645712,
    targetedLimit: 789203,
    isEntireCountyTargeted: false,
    targetedCitiesOrTracts: ["Oregon City Tract 022100", "Sandy Tract 024300", "Molalla Tract 023800"],
    notes: "Portland MSA standard high-cost limits."
  },
  "Clatsop": {
    county: "Clatsop",
    nonTargetedLimit: 566354,
    targetedLimit: 692211,
    isEntireCountyTargeted: true,
    notes: "Entire County is designated as an OHCS Targeted Area."
  },
  "Columbia": {
    county: "Columbia",
    nonTargetedLimit: 645712,
    targetedLimit: 789203,
    isEntireCountyTargeted: false,
    targetedCitiesOrTracts: ["St. Helens Tract 970500", "Vernonia Tract 970100"],
    notes: "Portland MSA high-cost limits."
  },
  "Coos": {
    county: "Coos",
    nonTargetedLimit: 566354,
    targetedLimit: 692211,
    isEntireCountyTargeted: true,
    notes: "Entire County is designated as an OHCS Targeted Area (Coos Bay, North Bend, Bandon, Coquille, Myrtle Point)."
  },
  "Crook": {
    county: "Crook",
    nonTargetedLimit: 566354,
    targetedLimit: 692211,
    isEntireCountyTargeted: true,
    notes: "Entire County is designated as an OHCS Targeted Area."
  },
  "Curry": {
    county: "Curry",
    nonTargetedLimit: 566354,
    targetedLimit: 692211,
    isEntireCountyTargeted: false,
    targetedCitiesOrTracts: ["Brookings Tract 950400", "Gold Beach Tract 950200"],
    notes: "Coastal standard limits."
  },
  "Deschutes": {
    county: "Deschutes",
    nonTargetedLimit: 645712,
    targetedLimit: 789203,
    isEntireCountyTargeted: false,
    targetedCitiesOrTracts: ["Redmond Tract 000300", "La Pine Tract 002400", "Bend East Tract 001900"],
    notes: "Bend MSA high-cost limits."
  },
  "Douglas": {
    county: "Douglas",
    nonTargetedLimit: 566354,
    targetedLimit: 692211,
    isEntireCountyTargeted: true,
    notes: "Entire County is designated as an OHCS Targeted Area (Roseburg, Sutherlin, Winston, Reedsport)."
  },
  "Gilliam": {
    county: "Gilliam",
    nonTargetedLimit: 566354,
    targetedLimit: 692211,
    isEntireCountyTargeted: true,
    notes: "Entire County is designated as an OHCS Targeted Area."
  },
  "Grant": {
    county: "Grant",
    nonTargetedLimit: 566354,
    targetedLimit: 692211,
    isEntireCountyTargeted: true,
    notes: "Entire County is designated as an OHCS Targeted Area."
  },
  "Harney": {
    county: "Harney",
    nonTargetedLimit: 566354,
    targetedLimit: 692211,
    isEntireCountyTargeted: true,
    notes: "Entire County is designated as an OHCS Targeted Area (Burns, Hines)."
  },
  "Hood River": {
    county: "Hood River",
    nonTargetedLimit: 645712,
    targetedLimit: 789203,
    isEntireCountyTargeted: false,
    targetedCitiesOrTracts: ["Cascade Locks Tract 950100", "Hood River Tract 950200"],
    notes: "Columbia Gorge high-cost limits."
  },
  "Jackson": {
    county: "Jackson",
    nonTargetedLimit: 566354,
    targetedLimit: 692211,
    isEntireCountyTargeted: false,
    targetedCitiesOrTracts: ["Medford Tract 000100, 000200", "White City Tract 001200"],
    notes: "Medford MSA limits."
  },
  "Jefferson": {
    county: "Jefferson",
    nonTargetedLimit: 566354,
    targetedLimit: 692211,
    isEntireCountyTargeted: true,
    notes: "Entire County is designated as an OHCS Targeted Area (Madras, Culver)."
  },
  "Josephine": {
    county: "Josephine",
    nonTargetedLimit: 566354,
    targetedLimit: 692211,
    isEntireCountyTargeted: false,
    targetedCitiesOrTracts: ["Grants Pass Tract 360900", "Cave Junction Tract 361500"],
    notes: "Grants Pass MSA limits."
  },
  "Klamath": {
    county: "Klamath",
    nonTargetedLimit: 566354,
    targetedLimit: 692211,
    isEntireCountyTargeted: true,
    notes: "Entire County is designated as an OHCS Targeted Area (Klamath Falls, Altamont)."
  },
  "Lake": {
    county: "Lake",
    nonTargetedLimit: 566354,
    targetedLimit: 692211,
    isEntireCountyTargeted: true,
    notes: "Entire County is designated as an OHCS Targeted Area (Lakeview)."
  },
  "Lane": {
    county: "Lane",
    nonTargetedLimit: 566354,
    targetedLimit: 692211,
    isEntireCountyTargeted: false,
    targetedCitiesOrTracts: ["Eugene Downtown Tract 003100", "Springfield Tract 001800, 001900", "Oakridge Tract 006200", "Florence Tract 000700"],
    notes: "Eugene-Springfield MSA limits."
  },
  "Lincoln": {
    county: "Lincoln",
    nonTargetedLimit: 566354,
    targetedLimit: 692211,
    isEntireCountyTargeted: true,
    notes: "Entire County is designated as an OHCS Targeted Area (Newport, Lincoln City, Toledo, Waldport)."
  },
  "Linn": {
    county: "Linn",
    nonTargetedLimit: 566354,
    targetedLimit: 692211,
    isEntireCountyTargeted: false,
    targetedCitiesOrTracts: ["Albany Tract 020400", "Lebanon Tract 030300", "Sweet Home Tract 030800"],
    notes: "Albany MSA limits."
  },
  "Malheur": {
    county: "Malheur",
    nonTargetedLimit: 566354,
    targetedLimit: 692211,
    isEntireCountyTargeted: true,
    notes: "Entire County is designated as an OHCS Targeted Area (Ontario, Nyssa, Vale)."
  },
  "Marion": {
    county: "Marion",
    nonTargetedLimit: 566354,
    targetedLimit: 692211,
    isEntireCountyTargeted: false,
    targetedCitiesOrTracts: ["Salem Central Tract 000300, 000400", "Woodburn Tract 010700", "Keizer Tract 001600"],
    notes: "Salem MSA limits."
  },
  "Morrow": {
    county: "Morrow",
    nonTargetedLimit: 566354,
    targetedLimit: 692211,
    isEntireCountyTargeted: true,
    notes: "Entire County is designated as an OHCS Targeted Area."
  },
  "Multnomah": {
    county: "Multnomah",
    nonTargetedLimit: 645712,
    targetedLimit: 789203,
    isEntireCountyTargeted: false,
    targetedCitiesOrTracts: ["East Portland Tracts 008200, 009200", "Gresham Tract 009800", "Rockwood Tract 009600"],
    notes: "Portland MSA high-cost limits."
  },
  "Polk": {
    county: "Polk",
    nonTargetedLimit: 566354,
    targetedLimit: 692211,
    isEntireCountyTargeted: false,
    targetedCitiesOrTracts: ["Independence Tract 020100", "Dallas Tract 020300"],
    notes: "Salem MSA limits."
  },
  "Sherman": {
    county: "Sherman",
    nonTargetedLimit: 566354,
    targetedLimit: 692211,
    isEntireCountyTargeted: true,
    notes: "Entire County is designated as an OHCS Targeted Area."
  },
  "Tillamook": {
    county: "Tillamook",
    nonTargetedLimit: 566354,
    targetedLimit: 692211,
    isEntireCountyTargeted: true,
    notes: "Entire County is designated as an OHCS Targeted Area (Tillamook, Rockaway Beach, Pacific City)."
  },
  "Umatilla": {
    county: "Umatilla",
    nonTargetedLimit: 566354,
    targetedLimit: 692211,
    isEntireCountyTargeted: true,
    notes: "Entire County is designated as an OHCS Targeted Area (Hermiston, Pendleton, Umatilla, Milton-Freewater)."
  },
  "Union": {
    county: "Union",
    nonTargetedLimit: 566354,
    targetedLimit: 692211,
    isEntireCountyTargeted: true,
    notes: "Entire County is designated as an OHCS Targeted Area (La Grande, Union)."
  },
  "Wallowa": {
    county: "Wallowa",
    nonTargetedLimit: 566354,
    targetedLimit: 692211,
    isEntireCountyTargeted: true,
    notes: "Entire County is designated as an OHCS Targeted Area (Enterprise, Joseph)."
  },
  "Wasco": {
    county: "Wasco",
    nonTargetedLimit: 566354,
    targetedLimit: 692211,
    isEntireCountyTargeted: true,
    notes: "Entire County is designated as an OHCS Targeted Area (The Dalles)."
  },
  "Washington": {
    county: "Washington",
    nonTargetedLimit: 645712,
    targetedLimit: 789203,
    isEntireCountyTargeted: false,
    targetedCitiesOrTracts: ["Forest Grove Tract 031700", "Cornelius Tract 031500", "Hillsboro Central Tract 032400", "Aloha Tract 031900"],
    notes: "Portland MSA high-cost limits."
  },
  "Wheeler": {
    county: "Wheeler",
    nonTargetedLimit: 566354,
    targetedLimit: 692211,
    isEntireCountyTargeted: true,
    notes: "Entire County is designated as an OHCS Targeted Area (Fossil, Spray)."
  },
  "Yamhill": {
    county: "Yamhill",
    nonTargetedLimit: 645712,
    targetedLimit: 789203,
    isEntireCountyTargeted: false,
    targetedCitiesOrTracts: ["McMinnville Tract 030500", "Newberg Tract 030100", "Sheridan Tract 030800"],
    notes: "Portland MSA high-cost limits."
  }
};

/**
 * Normalizes county strings (e.g., "Coos County" -> "Coos")
 */
export function normalizeOregonCounty(rawCountyName?: string, rawCityName?: string): string {
  if (!rawCountyName && !rawCityName) return "Coos"; // Default fallback
  const c = String(rawCountyName || "").trim().replace(/\s*county\s*/i, "");
  if (c && OREGON_COUNTY_PRICE_LIMITS[c]) {
    return c;
  }

  // City-to-County lookup fallback
  const city = String(rawCityName || "").toLowerCase().trim();
  if (city.includes("coos bay") || city.includes("north bend") || city.includes("bandon") || city.includes("coquille") || city.includes("myrtle point")) return "Coos";
  if (city.includes("portland") || city.includes("gresham") || city.includes("troutdale")) return "Multnomah";
  if (city.includes("beaverton") || city.includes("hillsboro") || city.includes("tigard") || city.includes("tualatin") || city.includes("aloha")) return "Washington";
  if (city.includes("lake oswego") || city.includes("oregon city") || city.includes("west linn") || city.includes("milwaukie") || city.includes("canby") || city.includes("sandy")) return "Clackamas";
  if (city.includes("bend") || city.includes("redmond") || city.includes("sisters") || city.includes("la pine")) return "Deschutes";
  if (city.includes("eugene") || city.includes("springfield") || city.includes("cottage grove") || city.includes("florence")) return "Lane";
  if (city.includes("salem") || city.includes("keizer") || city.includes("silverton") || city.includes("woodburn")) return "Marion";
  if (city.includes("corvallis") || city.includes("philomath") || city.includes("albany")) return "Benton";
  if (city.includes("medford") || city.includes("ashland") || city.includes("central point")) return "Jackson";
  if (city.includes("grants pass") || city.includes("cave junction")) return "Josephine";
  if (city.includes("roseburg") || city.includes("sutherlin") || city.includes("winston")) return "Douglas";
  if (city.includes("klamath falls")) return "Klamath";
  if (city.includes("astoria") || city.includes("seaside") || city.includes("cannon beach")) return "Clatsop";
  if (city.includes("newport") || city.includes("lincoln city") || city.includes("waldport")) return "Lincoln";
  if (city.includes("hermiston") || city.includes("pendleton")) return "Umatilla";
  if (city.includes("la grande")) return "Union";
  if (city.includes("the dalles")) return "Wasco";
  if (city.includes("mcminnville") || city.includes("newberg")) return "Yamhill";

  return c || "Coos";
}

/**
 * Returns complete OHCS Price Limit and Targeted status for a property
 */
export function getPropertyOhcsPriceLimit(
  price: number,
  countyName?: string,
  cityName?: string,
  censusTract?: string,
  explicitTargeted?: boolean
): {
  county: string;
  isTargeted: boolean;
  applicablePriceLimit: number;
  nonTargetedLimit: number;
  targetedLimit: number;
  isPriceEligible: boolean;
  headroom: number;
  qualificationReason: string;
} {
  const county = normalizeOregonCounty(countyName, cityName);
  const countyInfo = OREGON_COUNTY_PRICE_LIMITS[county] || {
    county: county || "Oregon Standard",
    nonTargetedLimit: 566354,
    targetedLimit: 692211,
    isEntireCountyTargeted: true,
  };

  // Determine targeted area status
  let isTargeted = Boolean(
    explicitTargeted === true ||
    countyInfo.isEntireCountyTargeted
  );

  // Check if city or tract matches targeted designations
  if (!isTargeted && cityName && countyInfo.targetedCitiesOrTracts) {
    const cityLow = cityName.toLowerCase();
    isTargeted = countyInfo.targetedCitiesOrTracts.some(t => t.toLowerCase().includes(cityLow));
  }
  if (!isTargeted && censusTract && countyInfo.targetedCitiesOrTracts) {
    const tractClean = censusTract.replace(/[^0-9]/g, "");
    isTargeted = countyInfo.targetedCitiesOrTracts.some(t => t.includes(tractClean));
  }

  const applicablePriceLimit = isTargeted ? countyInfo.targetedLimit : countyInfo.nonTargetedLimit;
  const isPriceEligible = price <= applicablePriceLimit;
  const headroom = applicablePriceLimit - price;

  const qualificationReason = isPriceEligible
    ? `Under ${county} County ${isTargeted ? "Targeted Area" : "Standard Non-Targeted"} limit ($${applicablePriceLimit.toLocaleString()}) by $${Math.max(0, headroom).toLocaleString()}`
    : `Exceeds ${county} County ${isTargeted ? "Targeted Area" : "Standard Non-Targeted"} limit of $${applicablePriceLimit.toLocaleString()} by $${Math.abs(headroom).toLocaleString()}`;

  return {
    county,
    isTargeted,
    applicablePriceLimit,
    nonTargetedLimit: countyInfo.nonTargetedLimit,
    targetedLimit: countyInfo.targetedLimit,
    isPriceEligible,
    headroom,
    qualificationReason
  };
}
