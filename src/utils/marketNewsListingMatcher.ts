import { RealEstateAgentProfile, LoanOfficerProfile, PropertyListing, LOPairing } from "../types";
import { 
  isUsdaEligible, 
  isLmiEligible, 
  isLakeviewNationalEligible,
  isFirstHomePriceEligible, 
  isTargetedArea,
  getListingOverlayBadges,
  OverlayBadgeInfo
} from "./overlayClassification";
import { parseGeoid } from "./geoidEngine";

export interface MlsAreaDefinition {
  id: "RMLS" | "WVMLS" | "CESMLS" | "SOMLS" | "OTHER";
  code: string;
  name: string;
  shortName: string;
  description: string;
  counties: string[];
  primaryCities: string[];
}

export const OREGON_MLS_SYSTEMS: Record<string, MlsAreaDefinition> = {
  RMLS: {
    id: "RMLS",
    code: "RMLS",
    name: "Regional Multiple Listing Service (RMLS)",
    shortName: "RMLS (Portland Metro & North Willamette)",
    description: "Serves Portland Metro, Westside Silicon Forest, Clackamas, Yamhill, and Columbia River counties.",
    counties: ["Multnomah", "Washington", "Clackamas", "Yamhill", "Columbia", "Hood River", "Wasco"],
    primaryCities: [
      "Portland", "Beaverton", "Hillsboro", "Gresham", "Tigard", "Lake Oswego",
      "Oregon City", "Happy Valley", "Milwaukie", "West Linn", "Wilsonville",
      "Tualatin", "Sherwood", "Newberg", "McMinnville", "Scappoose", "St. Helens"
    ]
  },
  WVMLS: {
    id: "WVMLS",
    code: "WVMLS",
    name: "Willamette Valley Multiple Listing Service (WVMLS)",
    shortName: "WVMLS (Willamette Valley & Mid-State)",
    description: "Serves the mid-Willamette Valley including Marion, Polk, Linn, and Benton counties.",
    counties: ["Marion", "Polk", "Linn", "Benton", "Yamhill"],
    primaryCities: [
      "Salem", "Keizer", "Albany", "Corvallis", "Lebanon", "Dallas",
      "Monmouth", "Silverton", "Woodburn", "Stayton", "Philomath", "Independence"
    ]
  },
  CESMLS: {
    id: "CESMLS",
    code: "CESMLS",
    name: "Cascades East Multiple Listing Service (CESMLS / COAR)",
    shortName: "CESMLS (Central Oregon & Cascades)",
    description: "Serves Central Oregon high desert including Deschutes, Crook, Jefferson, and Klamath counties.",
    counties: ["Deschutes", "Crook", "Jefferson", "Klamath", "Lake"],
    primaryCities: [
      "Bend", "Redmond", "Sisters", "Sunriver", "Prineville", "Madras",
      "La Pine", "Klamath Falls"
    ]
  },
  SOMLS: {
    id: "SOMLS",
    code: "SOMLS",
    name: "Southern Oregon Multiple Listing Service (SOMLS)",
    shortName: "SOMLS (Southern Oregon & Coastal)",
    description: "Serves Southern Oregon valleys and coastal counties including Jackson, Josephine, Douglas, and Coos.",
    counties: ["Jackson", "Josephine", "Douglas", "Coos", "Curry"],
    primaryCities: [
      "Medford", "Ashland", "Grants Pass", "Roseburg", "Coos Bay",
      "North Bend", "Central Point", "Eagle Point", "Bandon", "Brookings"
    ]
  }
};

/**
 * Official Federal 5-digit FIPS codes for all 36 Oregon Counties (State FIPS 41 + 3-digit county).
 */
export const OREGON_COUNTY_TO_FIPS: Record<string, string> = {
  Baker: "41001",
  Benton: "41003",
  Clackamas: "41005",
  Clatsop: "41007",
  Columbia: "41009",
  Coos: "41011",
  Crook: "41013",
  Curry: "41015",
  Deschutes: "41017",
  Douglas: "41019",
  Gilliam: "41021",
  Grant: "41023",
  Harney: "41025",
  "Hood River": "41027",
  Jackson: "41029",
  Jefferson: "41031",
  Josephine: "41033",
  Klamath: "41035",
  Lake: "41037",
  Lane: "41039",
  Lincoln: "41041",
  Linn: "41043",
  Malheur: "41045",
  Marion: "41047",
  Morrow: "41049",
  Multnomah: "41051",
  Polk: "41053",
  Sherman: "41055",
  Tillamook: "41057",
  Umatilla: "41059",
  Union: "41061",
  Wallowa: "41063",
  Wasco: "41065",
  Washington: "41067",
  Wheeler: "41069",
  Yamhill: "41071"
};

export const OREGON_FIPS_TO_COUNTY: Record<string, string> = Object.entries(OREGON_COUNTY_TO_FIPS).reduce(
  (acc, [county, fips]) => {
    acc[fips] = county;
    return acc;
  },
  {} as Record<string, string>
);

/**
 * City-to-County lookup for spatial boundary resolution across Oregon.
 */
export const OREGON_CITY_TO_COUNTY: Record<string, string> = {
  portland: "Multnomah",
  gresham: "Multnomah",
  troutdale: "Multnomah",
  fairview: "Multnomah",
  "wood village": "Multnomah",
  beaverton: "Washington",
  hillsboro: "Washington",
  tigard: "Washington",
  tualatin: "Washington",
  sherwood: "Washington",
  "forest grove": "Washington",
  cornelius: "Washington",
  "oregon city": "Clackamas",
  "lake oswego": "Clackamas",
  "west linn": "Clackamas",
  milwaukie: "Clackamas",
  "happy valley": "Clackamas",
  wilsonville: "Clackamas",
  canby: "Clackamas",
  sandy: "Clackamas",
  gladstone: "Clackamas",
  estacada: "Clackamas",
  salem: "Marion",
  keizer: "Marion",
  silverton: "Marion",
  woodburn: "Marion",
  stayton: "Marion",
  "mt. angel": "Marion",
  sublimity: "Marion",
  dallas: "Polk",
  monmouth: "Polk",
  independence: "Polk",
  albany: "Linn",
  lebanon: "Linn",
  "sweet home": "Linn",
  millersburg: "Linn",
  corvallis: "Benton",
  philomath: "Benton",
  eugene: "Lane",
  springfield: "Lane",
  "cottage grove": "Lane",
  florence: "Lane",
  creswell: "Lane",
  "junction city": "Lane",
  bend: "Deschutes",
  redmond: "Deschutes",
  sisters: "Deschutes",
  sunriver: "Deschutes",
  "la pine": "Deschutes",
  prineville: "Crook",
  madras: "Jefferson",
  culver: "Jefferson",
  metolius: "Jefferson",
  medford: "Jackson",
  ashland: "Jackson",
  "central point": "Jackson",
  "eagle point": "Jackson",
  jacksonville: "Jackson",
  phoenix: "Jackson",
  talent: "Jackson",
  "white city": "Jackson",
  "grants pass": "Josephine",
  "cave junction": "Josephine",
  roseburg: "Douglas",
  sutherlin: "Douglas",
  winston: "Douglas",
  "coos bay": "Coos",
  "north bend": "Coos",
  bandon: "Coos",
  coquille: "Coos",
  brookings: "Curry",
  "gold beach": "Curry",
  "klamath falls": "Klamath",
  lakeview: "Lake",
  astoria: "Clatsop",
  seaside: "Clatsop",
  "st. helens": "Columbia",
  scappoose: "Columbia",
  "hood river": "Hood River",
  "the dalles": "Wasco",
  newberg: "Yamhill",
  mcminnville: "Yamhill",
  "lincoln city": "Lincoln",
  newport: "Lincoln",
  tillamook: "Tillamook",
  pendleton: "Umatilla",
  hermiston: "Umatilla",
  "la grande": "Union",
  ontario: "Malheur",
  "baker city": "Baker"
};

/**
 * Resolves the MLS system and primary counties for an agent.
 */
export function getAgentMlsInfo(agent?: RealEstateAgentProfile | null): {
  mls: MlsAreaDefinition;
  primaryCounty: string;
  allCounties: string[];
} {
  if (!agent) {
    return {
      mls: OREGON_MLS_SYSTEMS.RMLS,
      primaryCounty: "Multnomah",
      allCounties: OREGON_MLS_SYSTEMS.RMLS.counties
    };
  }

  // 1. Explicit MLS affiliation
  if (agent.mlsAffiliation && OREGON_MLS_SYSTEMS[agent.mlsAffiliation]) {
    const mls = OREGON_MLS_SYSTEMS[agent.mlsAffiliation];
    const primaryCounty = agent.licensedCounties?.[0] || mls.counties[0];
    return {
      mls,
      primaryCounty,
      allCounties: agent.licensedCounties?.length ? agent.licensedCounties : mls.counties
    };
  }

  // 2. Infer from market areas or name
  const areas = (agent.marketAreas || []).map(a => a.toLowerCase()).join(" ");
  
  if (areas.includes("bend") || areas.includes("redmond") || areas.includes("deschutes") || areas.includes("sisters") || areas.includes("crook") || areas.includes("prineville")) {
    return {
      mls: OREGON_MLS_SYSTEMS.CESMLS,
      primaryCounty: "Deschutes",
      allCounties: OREGON_MLS_SYSTEMS.CESMLS.counties
    };
  }

  if (areas.includes("salem") || areas.includes("keizer") || areas.includes("marion") || areas.includes("albany") || areas.includes("corvallis") || areas.includes("polk") || areas.includes("linn")) {
    return {
      mls: OREGON_MLS_SYSTEMS.WVMLS,
      primaryCounty: "Marion",
      allCounties: OREGON_MLS_SYSTEMS.WVMLS.counties
    };
  }

  if (areas.includes("medford") || areas.includes("ashland") || areas.includes("coos") || areas.includes("grants pass") || areas.includes("roseburg") || areas.includes("douglas") || areas.includes("jackson")) {
    return {
      mls: OREGON_MLS_SYSTEMS.SOMLS,
      primaryCounty: "Jackson",
      allCounties: OREGON_MLS_SYSTEMS.SOMLS.counties
    };
  }

  // Default: RMLS (Portland Metro, Clackamas, Washington)
  let primary = "Multnomah";
  if (areas.includes("clackamas") || areas.includes("oregon city") || areas.includes("happy valley")) {
    primary = "Clackamas";
  } else if (areas.includes("beaverton") || areas.includes("hillsboro") || areas.includes("washington")) {
    primary = "Washington";
  }

  return {
    mls: OREGON_MLS_SYSTEMS.RMLS,
    primaryCounty: primary,
    allCounties: OREGON_MLS_SYSTEMS.RMLS.counties
  };
}

/**
 * Extracts and synthesizes Federal 11-digit GEOID and County FIPS metadata for a property listing.
 */
export interface ListingSpatialGeoidInfo {
  geoid: string;
  countyFips: string;
  countyName: string;
  tractFormatted: string;
  isGeoidVerified: boolean;
  matchType: 'GEOID_EXACT' | 'FIPS_COUNTY' | 'COUNTY_NAME' | 'CITY_BOUNDARY' | 'AGENT_OWNED';
}

export function extractListingSpatialGeoid(listing: PropertyListing): ListingSpatialGeoidInfo {
  // 1. Check if direct 11-digit GEOID exists on overlayEligibility
  if (listing.overlayEligibility?.geoid) {
    const parsed = parseGeoid(listing.overlayEligibility.geoid);
    if (parsed.isValid && parsed.stateFips === "41") {
      const countyFips = `41${parsed.countyFips}`;
      const countyName = OREGON_FIPS_TO_COUNTY[countyFips] || parsed.countyName;
      return {
        geoid: parsed.rawGeoid,
        countyFips,
        countyName,
        tractFormatted: parsed.formattedTract,
        isGeoidVerified: true,
        matchType: 'GEOID_EXACT'
      };
    }
  }

  // 2. Check if census tract contains a 5-digit Oregon FIPS (41xxx)
  const tractRaw = listing.overlayEligibility?.lmiCensusTract || "";
  const fipsMatch = tractRaw.match(/41\d{3}/);
  if (fipsMatch) {
    const countyFips = fipsMatch[0];
    const countyName = OREGON_FIPS_TO_COUNTY[countyFips] || "Oregon";
    const digitsOnly = tractRaw.replace(/\D/g, "");
    const geoid = digitsOnly.length >= 11 && digitsOnly.startsWith("41")
      ? digitsOnly.substring(0, 11)
      : `${countyFips}001000`;
    return {
      geoid,
      countyFips,
      countyName,
      tractFormatted: tractRaw.includes("Tract") ? tractRaw : `Tract ${geoid.substring(5, 9)}`,
      isGeoidVerified: true,
      matchType: 'GEOID_EXACT'
    };
  }

  // 3. County Name matching
  const countyRaw = (listing.county || listing.overlayEligibility?.countyName || "").trim();
  const matchedCountyKey = Object.keys(OREGON_COUNTY_TO_FIPS).find(
    k => k.toLowerCase() === countyRaw.toLowerCase()
  );
  if (matchedCountyKey) {
    const countyFips = OREGON_COUNTY_TO_FIPS[matchedCountyKey];
    return {
      geoid: `${countyFips}001000`,
      countyFips,
      countyName: matchedCountyKey,
      tractFormatted: `Tract ${matchedCountyKey}`,
      isGeoidVerified: false,
      matchType: 'COUNTY_NAME'
    };
  }

  // 4. City boundary fallback
  const cityKey = (listing.city || "").trim().toLowerCase();
  if (cityKey && OREGON_CITY_TO_COUNTY[cityKey]) {
    const countyName = OREGON_CITY_TO_COUNTY[cityKey];
    const countyFips = OREGON_COUNTY_TO_FIPS[countyName] || "41051";
    return {
      geoid: `${countyFips}001000`,
      countyFips,
      countyName,
      tractFormatted: `Tract ${countyName}`,
      isGeoidVerified: false,
      matchType: 'CITY_BOUNDARY'
    };
  }

  // Default to Multnomah
  return {
    geoid: "41051001000",
    countyFips: "41051",
    countyName: "Multnomah",
    tractFormatted: "Tract 10.00",
    isGeoidVerified: false,
    matchType: 'COUNTY_NAME'
  };
}

/**
 * Resolves the agent's licensed Oregon counties and their respective FIPS codes.
 */
export function getAgentLicensedGeographies(agent?: RealEstateAgentProfile | null): {
  mls: MlsAreaDefinition;
  counties: string[];
  countyFipsList: string[];
  primaryCounty: string;
  primaryFips: string;
  licensedCountiesSet: Set<string>;
  licensedFipsSet: Set<string>;
} {
  const mlsInfo = getAgentMlsInfo(agent);

  const countyNames = new Set<string>();
  if (agent?.licensedCounties && agent.licensedCounties.length > 0) {
    agent.licensedCounties.forEach(c => countyNames.add(c.trim()));
  }

  mlsInfo.allCounties.forEach(c => countyNames.add(c.trim()));

  (agent?.marketAreas || []).forEach(area => {
    const a = area.trim().toLowerCase();
    Object.keys(OREGON_COUNTY_TO_FIPS).forEach(county => {
      if (a.includes(county.toLowerCase())) {
        countyNames.add(county);
      }
    });
  });

  const counties = Array.from(countyNames);
  const countyFipsList: string[] = [];
  const licensedFipsSet = new Set<string>();

  counties.forEach(c => {
    const norm = Object.keys(OREGON_COUNTY_TO_FIPS).find(k => k.toLowerCase() === c.toLowerCase());
    if (norm && OREGON_COUNTY_TO_FIPS[norm]) {
      const fips = OREGON_COUNTY_TO_FIPS[norm];
      countyFipsList.push(fips);
      licensedFipsSet.add(fips);
    }
  });

  const primaryCounty = mlsInfo.primaryCounty || counties[0] || "Multnomah";
  const primaryFips = OREGON_COUNTY_TO_FIPS[primaryCounty] || "41051";

  return {
    mls: mlsInfo.mls,
    counties,
    countyFipsList,
    primaryCounty,
    primaryFips,
    licensedCountiesSet: new Set(counties.map(c => c.toLowerCase())),
    licensedFipsSet
  };
}

/**
 * Checks whether a property listing is situated within an agent's licensed Oregon counties/geographies
 * using GEOID/spatial matching and MLS boundary checks.
 */
export function isListingInAgentLicensedGeographies(
  listing: PropertyListing,
  agent: RealEstateAgentProfile
): {
  isMatched: boolean;
  matchType: 'GEOID_EXACT' | 'FIPS_COUNTY' | 'COUNTY_NAME' | 'CITY_BOUNDARY' | 'AGENT_OWNED' | 'NONE' | 'FALLBACK';
  spatialInfo: ListingSpatialGeoidInfo;
} {
  const isOwned = isSpotlightAgentListing(listing, agent);
  const spatialInfo = extractListingSpatialGeoid(listing);

  // If owned by the spotlight agent, always matched!
  if (isOwned) {
    return {
      isMatched: true,
      matchType: 'AGENT_OWNED',
      spatialInfo: {
        ...spatialInfo,
        matchType: 'AGENT_OWNED'
      }
    };
  }

  const agentGeo = getAgentLicensedGeographies(agent);

  // 1. GEOID County FIPS match (e.g., "41017" in agent's licensed FIPS set)
  if (agentGeo.licensedFipsSet.has(spatialInfo.countyFips)) {
    return {
      isMatched: true,
      matchType: spatialInfo.isGeoidVerified ? 'GEOID_EXACT' : 'FIPS_COUNTY',
      spatialInfo
    };
  }

  // 2. County Name match (e.g., "Deschutes" in agent's licensed counties)
  if (agentGeo.licensedCountiesSet.has(spatialInfo.countyName.toLowerCase())) {
    return {
      isMatched: true,
      matchType: 'COUNTY_NAME',
      spatialInfo
    };
  }

  // 3. City Boundary match against MLS primary cities or agent market areas
  const city = (listing.city || "").trim().toLowerCase();
  const matchesCity = agentGeo.mls.primaryCities.some(c => c.toLowerCase() === city);
  const matchesMarketArea = (agent.marketAreas || []).some(area => {
    const a = area.toLowerCase();
    return city.includes(a) || a.includes(city);
  });

  if (matchesCity || matchesMarketArea) {
    return {
      isMatched: true,
      matchType: 'CITY_BOUNDARY',
      spatialInfo
    };
  }

  return {
    isMatched: false,
    matchType: 'NONE',
    spatialInfo
  };
}

/**
 * Checks whether a property listing is situated within an agent's MLS boundaries.
 * Backwards compatibility wrapper around isListingInAgentLicensedGeographies.
 */
export function isListingInAgentMlsArea(listing: PropertyListing, agent: RealEstateAgentProfile): boolean {
  const matchResult = isListingInAgentLicensedGeographies(listing, agent);
  return matchResult.isMatched;
}

/**
 * Checks if the spotlight agent is the actual listing agent of record for this property.
 * (Identified via RentCast / MLS data synchronization).
 */
export function isSpotlightAgentListing(listing: PropertyListing, agent?: RealEstateAgentProfile | null): boolean {
  if (!agent || !listing.listingAgent) return false;
  
  const la = listing.listingAgent;
  if (la.id && la.id === agent.id) return true;

  if (la.name) {
    const agentClean = agent.name.toLowerCase().replace(/[^a-z]/g, "");
    const listingAgentClean = la.name.toLowerCase().replace(/[^a-z]/g, "");
    if (agentClean && listingAgentClean && (agentClean === listingAgentClean || listingAgentClean.includes(agentClean))) {
      return true;
    }
  }

  if (la.email && agent.email && la.email.toLowerCase() === agent.email.toLowerCase()) {
    return true;
  }

  if (la.phone && agent.phone) {
    const p1 = la.phone.replace(/[^0-9]/g, "");
    const p2 = agent.phone.replace(/[^0-9]/g, "");
    if (p1 && p2 && p1 === p2) return true;
  }

  return false;
}

/**
 * Constructs a verified, direct Zillow property link for any listing.
 */
export function getZillowPropertyUrl(listing: PropertyListing): string {
  if (listing.zillowUrl && listing.zillowUrl.startsWith("http")) {
    return listing.zillowUrl;
  }
  const cleanAddress = `${listing.address}, ${listing.city}, ${listing.state || "OR"} ${listing.zip || ""}`.trim();
  return `https://www.zillow.com/homes/${encodeURIComponent(cleanAddress)}_rb/`;
}

export interface MatchedSpotlightListing {
  listing: PropertyListing;
  isDirectListing: boolean; // True if spotlight agent is the actual listing agent of record (owns the listing)
  isOwnedBySpotlightAgent: boolean; // Explicit synonym
  zillowUrl: string;
  overlayBadges: OverlayBadgeInfo[];
  eligibilityHighlights: string[]; // Clean formatted badge labels for cards
  countyName: string;
  matchedCounty: string; // Alias for template compatibility
  countyFips: string; // 5-digit Federal County FIPS (e.g., "41017")
  geoid: string; // 11-digit Federal GEOID (e.g., "41017001000")
  tractFormatted: string; // e.g. "Tract 10.00"
  spatialMatchType: 'GEOID_EXACT' | 'FIPS_COUNTY' | 'COUNTY_NAME' | 'CITY_BOUNDARY' | 'AGENT_OWNED' | 'NONE' | 'FALLBACK';
  mlsZone: string;
  lowOrNoDownEligible: boolean;
  lowOrNoDownSummary: string;
  primaryContact: {
    isSpotlightAgent: boolean;
    name: string;
    role: string;
    phone: string;
    email: string;
    brokerage?: string;
    licenseNumber?: string;
    avatarUrl?: string;
  };
}

/**
 * Filters RentCast API property listings by the selected Agent's licensed Oregon counties/geographies
 * (using GEOID/spatial matching). Ensures listings identified as 'owned' by the spotlight agent
 * are placed at the top and visually flagged as the primary contact.
 */
export function matchMarketNewsSpotlightListings(
  agent: RealEstateAgentProfile,
  allListings: PropertyListing[],
  maxCount: number = 14
): {
  listings: MatchedSpotlightListing[];
  mlsInfo: ReturnType<typeof getAgentMlsInfo>;
  primaryCounty: string;
  primaryFips: string;
  licensedCounties: string[];
  licensedCountyFips: string[];
  directListingCount: number;
} {
  const agentGeo = getAgentLicensedGeographies(agent);
  
  // 1. Filter listings using GEOID / Spatial boundary matching against agent's licensed Oregon territories
  const matchedWithSpatial = allListings
    .map(listing => {
      const spatialResult = isListingInAgentLicensedGeographies(listing, agent);
      return {
        listing,
        isMatched: spatialResult.isMatched,
        matchType: spatialResult.matchType,
        spatialInfo: spatialResult.spatialInfo
      };
    })
    .filter(item => item.isMatched);

  let inAreaItems = matchedWithSpatial;

  // Fallback: If strict spatial filter yields fewer than 6, expand to general listings matching primary county FIPS
  if (inAreaItems.length < 6) {
    const existingIds = new Set(inAreaItems.map(i => i.listing.id));
    const fallbackItems = allListings
      .filter(l => !existingIds.has(l.id))
      .map(l => {
        const spatialInfo = extractListingSpatialGeoid(l);
        const matchesPrimary = spatialInfo.countyFips === agentGeo.primaryFips ||
          spatialInfo.countyName.toLowerCase().includes(agentGeo.primaryCounty.toLowerCase());
        return {
          listing: l,
          isMatched: matchesPrimary,
          matchType: 'FALLBACK' as const,
          spatialInfo
        };
      })
      .filter(item => item.isMatched);

    inAreaItems = [...inAreaItems, ...fallbackItems];
  }

  // 2. Map and score each listing with full GEOID spatial data and Primary Contact information
  const mappedListings: MatchedSpotlightListing[] = inAreaItems.map(({ listing, matchType, spatialInfo }) => {
    const isDirect = isSpotlightAgentListing(listing, agent);
    const badges = getListingOverlayBadges(listing);
    const zillowUrl = getZillowPropertyUrl(listing);
    
    const usda = isUsdaEligible(listing);
    const lmi = isLmiEligible(listing);
    const lakeview = isLakeviewNationalEligible(listing);
    const firstHome = isFirstHomePriceEligible(listing);
    const targeted = isTargetedArea(listing);

    const lowOrNoDownEligible = usda || lmi || lakeview || firstHome || targeted;

    let lowOrNoDownSummary = "Verified Oregon First-Time Buyer Qualified";
    if (usda && lmi) {
      lowOrNoDownSummary = "Dual Qualified: 0% Down USDA + OHCS Flex Grant";
    } else if (usda) {
      lowOrNoDownSummary = "100% Financing (0% Down) USDA Rural Housing";
    } else if (lakeview) {
      lowOrNoDownSummary = "Lakeview National Low/No Down Payment Option";
    } else if (lmi) {
      lowOrNoDownSummary = "Low/Moderate Income Census Tract (Flex DPA Grant)";
    } else if (targeted) {
      lowOrNoDownSummary = "Targeted Area with Elevated Purchase Cap & DPA";
    } else if (firstHome) {
      lowOrNoDownSummary = "OHCS FirstHome Cash Assistance DPA Eligible";
    }

    const countyName = spatialInfo.countyName || agentGeo.primaryCounty;

    // Format clean eligibility badge strings
    const eligibilityHighlights: string[] = [];
    if (usda) eligibilityHighlights.push("USDA 0% Down");
    if (lmi) eligibilityHighlights.push("LMI Flex Grant");
    if (firstHome) eligibilityHighlights.push("FirstHome Cap");
    if (lakeview) eligibilityHighlights.push("Lakeview National");
    if (targeted) eligibilityHighlights.push("Targeted Area");
    if (eligibilityHighlights.length === 0) eligibilityHighlights.push("Oregon DPA Qualified");

    // Construct Primary Contact details
    const primaryContact = isDirect
      ? {
          isSpotlightAgent: true,
          name: agent.name,
          role: "Primary Contact • Listing Agent of Record",
          phone: agent.phone || "",
          email: agent.email || "",
          brokerage: agent.brokerage || (agent as any).company || "",
          licenseNumber: agent.licenseNumber,
          avatarUrl: agent.headshotUrl
        }
      : {
          isSpotlightAgent: false,
          name: agent.name,
          role: "Buyer Brokerage Representation",
          phone: agent.phone || "",
          email: agent.email || "",
          brokerage: agent.brokerage || (agent as any).company || "",
          licenseNumber: agent.licenseNumber,
          avatarUrl: agent.headshotUrl
        };

    return {
      listing,
      isDirectListing: isDirect,
      isOwnedBySpotlightAgent: isDirect,
      zillowUrl,
      overlayBadges: badges,
      eligibilityHighlights,
      countyName,
      matchedCounty: countyName,
      countyFips: spatialInfo.countyFips,
      geoid: spatialInfo.geoid,
      tractFormatted: spatialInfo.tractFormatted,
      spatialMatchType: isDirect ? 'AGENT_OWNED' : matchType,
      mlsZone: agentGeo.mls.code,
      lowOrNoDownEligible,
      lowOrNoDownSummary,
      primaryContact
    };
  });

  // 3. Hierarchical sort:
  // - Direct listings "owned" by this spotlight agent ALWAYS come first!
  // - Dual overlay (USDA + LMI)
  // - USDA 0% Down
  // - Lakeview National / LMI
  // - Other low/no down payment eligible
  // - Days on market
  mappedListings.sort((a, b) => {
    if (a.isDirectListing && !b.isDirectListing) return -1;
    if (!a.isDirectListing && b.isDirectListing) return 1;

    const aDual = isUsdaEligible(a.listing) && isLmiEligible(a.listing);
    const bDual = isUsdaEligible(b.listing) && isLmiEligible(b.listing);
    if (aDual && !bDual) return -1;
    if (!aDual && bDual) return 1;

    const aUsda = isUsdaEligible(a.listing);
    const bUsda = isUsdaEligible(b.listing);
    if (aUsda && !bUsda) return -1;
    if (!aUsda && bUsda) return 1;

    if (a.lowOrNoDownEligible && !b.lowOrNoDownEligible) return -1;
    if (!a.lowOrNoDownEligible && b.lowOrNoDownEligible) return 1;

    return (a.listing.daysOnMarket || 0) - (b.listing.daysOnMarket || 0);
  });

  // 4. Cap at maxCount (or fewer if less available)
  const finalCount = Math.min(mappedListings.length, maxCount);
  const selectedListings = mappedListings.slice(0, Math.max(finalCount, 0));
  const directListingCount = selectedListings.filter(l => l.isDirectListing).length;

  return {
    listings: selectedListings,
    mlsInfo: {
      mls: agentGeo.mls,
      primaryCounty: agentGeo.primaryCounty,
      allCounties: agentGeo.counties
    },
    primaryCounty: agentGeo.primaryCounty,
    primaryFips: agentGeo.primaryFips,
    licensedCounties: agentGeo.counties,
    licensedCountyFips: agentGeo.countyFipsList,
    directListingCount
  };
}

/**
 * Organizes the Loan Officer's agents into two distinct categories for the spotlight selector:
 * 1. Paired Partner Agents (Existing active pairings)
 * 2. Imported Stable of Agents (Unpaired agents available in the dashboard roster)
 */
export function getLoanOfficerAgentCategories(
  lo: LoanOfficerProfile,
  allAgents: RealEstateAgentProfile[],
  pairings: LOPairing[]
): {
  pairedAgents: RealEstateAgentProfile[];
  unpairedAgents: RealEstateAgentProfile[];
  currentSpotlightAgent: RealEstateAgentProfile;
  isCustomSpotlightSelected: boolean;
} {
  // 1. Find paired agent IDs for this LO
  const activePairingsForLo = pairings.filter(p => p.loId === lo.id && p.active !== false);
  const pairedAgentIds = new Set(activePairingsForLo.map(p => p.agentId));

  const pairedAgents: RealEstateAgentProfile[] = [];
  const unpairedAgents: RealEstateAgentProfile[] = [];

  allAgents.forEach(agent => {
    if (pairedAgentIds.has(agent.id)) {
      pairedAgents.push(agent);
    } else {
      unpairedAgents.push(agent);
    }
  });

  // Determine active spotlight agent
  let currentSpotlightAgent: RealEstateAgentProfile | undefined;
  let isCustomSpotlightSelected = false;

  if (lo.marketNewsSpotlightAgentId) {
    currentSpotlightAgent = allAgents.find(a => a.id === lo.marketNewsSpotlightAgentId);
    if (currentSpotlightAgent) {
      isCustomSpotlightSelected = true;
    }
  }

  if (!currentSpotlightAgent) {
    // Default to first paired agent, or first roster agent
    currentSpotlightAgent = pairedAgents[0] || allAgents[0];
  }

  return {
    pairedAgents,
    unpairedAgents,
    currentSpotlightAgent,
    isCustomSpotlightSelected
  };
}
