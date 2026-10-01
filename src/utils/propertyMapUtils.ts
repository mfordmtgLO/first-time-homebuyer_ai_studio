import { PropertyListing, FinancialProfile } from "../types";
import { calculateMonthlyPI } from "./mortgageMath";
import { isUsdaEligible, isLmiEligible, isTargetedArea } from "./overlayClassification";

export interface GeoCoordinate {
  lat: number;
  lng: number;
}

export interface SchoolInfo {
  name: string;
  type: "Elementary" | "Middle" | "High";
  rating: number; // 1-10
  distanceMiles: number;
}

export interface SchoolDistrictInfo {
  id: string;
  name: string;
  city: string;
  county: string;
  averageRating: number;
  topSchools: { name: string; type: "Elementary" | "Middle" | "High"; rating: number }[];
  center: GeoCoordinate;
  description: string;
}

export interface AmenityPoint {
  id: string;
  name: string;
  category: "transit" | "school" | "grocery" | "park" | "health" | "dining";
  city: string;
  lat: number;
  lng: number;
  label: string;
}

export interface PropertyAmenityDistance {
  amenity: AmenityPoint;
  distanceMiles: number;
  walkMinutes: number;
  driveMinutes: number;
}

export interface HomebuyingReadinessDetails {
  score: number; // 0 - 100
  tier: "High" | "Moderate" | "Developing";
  label: string;
  badgeColor: string;
  positiveFactors: string[];
  cautionFactors: string[];
  monthlyPaymentEstimate: number;
  monthlySavingsVsTarget: number;
  isBudgetFit: boolean;
}

// Default Oregon Major City Geocodes
export const OREGON_CITY_COORDINATES: Record<string, GeoCoordinate> = {
  portland: { lat: 45.5152, lng: -122.6784 },
  beaverton: { lat: 45.4871, lng: -122.8037 },
  "lake oswego": { lat: 45.4207, lng: -122.6706 },
  hillsboro: { lat: 45.5229, lng: -122.9898 },
  tigard: { lat: 45.4312, lng: -122.7712 },
  tualatin: { lat: 45.3838, lng: -122.7664 },
  gresham: { lat: 45.4998, lng: -122.4312 },
  eugene: { lat: 44.0521, lng: -123.0868 },
  springfield: { lat: 44.0462, lng: -123.0220 },
  "junction city": { lat: 44.2198, lng: -123.2054 },
  junctioncity: { lat: 44.2198, lng: -123.2054 },
  veneta: { lat: 44.0492, lng: -123.3486 },
  "cottage grove": { lat: 43.7976, lng: -123.0595 },
  florence: { lat: 43.9826, lng: -124.0998 },
  bend: { lat: 44.0582, lng: -121.3153 },
  redmond: { lat: 44.2726, lng: -121.1739 },
  sisters: { lat: 44.2912, lng: -121.5492 },
  "la pine": { lat: 43.6704, lng: -121.5036 },
  salem: { lat: 44.9429, lng: -123.0351 },
  keizer: { lat: 45.0007, lng: -123.0259 },
  silverton: { lat: 45.0051, lng: -122.7831 },
  "coos bay": { lat: 43.3665, lng: -124.2179 },
  northbend: { lat: 43.4065, lng: -124.2243 },
  "north bend": { lat: 43.4065, lng: -124.2243 },
  bandon: { lat: 43.1189, lng: -124.4084 },
  coquille: { lat: 43.1782, lng: -124.1873 },
  corvallis: { lat: 44.5646, lng: -123.2620 },
  albany: { lat: 44.6365, lng: -123.1059 },
  oregoncity: { lat: 45.3573, lng: -122.6068 },
  "oregon city": { lat: 45.3573, lng: -122.6068 },
  westlinn: { lat: 45.3651, lng: -122.6120 },
  "west linn": { lat: 45.3651, lng: -122.6120 },
  wilsonville: { lat: 45.3090, lng: -122.7737 },
  milwaukie: { lat: 45.4465, lng: -122.6393 },
  clackamas: { lat: 45.4065, lng: -122.5684 },
  canby: { lat: 45.2635, lng: -122.6923 },
  sandy: { lat: 45.3976, lng: -122.2604 },
  medford: { lat: 42.3265, lng: -122.8756 },
  "grants pass": { lat: 42.4390, lng: -123.3284 },
  roseburg: { lat: 43.2165, lng: -123.3417 },
  "klamath falls": { lat: 42.2249, lng: -121.7817 },
  pendleton: { lat: 45.6721, lng: -118.7886 }
};

// Oregon School Districts
export const OREGON_SCHOOL_DISTRICTS: SchoolDistrictInfo[] = [
  {
    id: "pps",
    name: "Portland Public Schools (1J)",
    city: "Portland",
    county: "Multnomah",
    averageRating: 8.4,
    center: { lat: 45.5152, lng: -122.6784 },
    description: "Oregon's largest urban district with strong high school IB and arts programs.",
    topSchools: [
      { name: "Lincoln High School", type: "High", rating: 9 },
      { name: "Abernethy Elementary", type: "Elementary", rating: 9 },
      { name: "Hosford Middle School", type: "Middle", rating: 8 }
    ]
  },
  {
    id: "beaverton-sd",
    name: "Beaverton School District (48J)",
    city: "Beaverton",
    county: "Washington",
    averageRating: 8.8,
    center: { lat: 45.4871, lng: -122.8037 },
    description: "Top-ranked suburban district serving Silicon Forest with specialized STEM options.",
    topSchools: [
      { name: "International School of Beaverton", type: "High", rating: 10 },
      { name: "Sexton Mountain Elementary", type: "Elementary", rating: 9 },
      { name: "Highland Park Middle", type: "Middle", rating: 8 }
    ]
  },
  {
    id: "lake-oswego-sd",
    name: "Lake Oswego School District (7J)",
    city: "Lake Oswego",
    county: "Clackamas",
    averageRating: 9.6,
    center: { lat: 45.4207, lng: -122.6706 },
    description: "Consistently ranked #1 in Oregon for academic achievement and college matriculation.",
    topSchools: [
      { name: "Lake Oswego High School", type: "High", rating: 10 },
      { name: "Lakeridge High School", type: "High", rating: 10 },
      { name: "Forest Hills Elementary", type: "Elementary", rating: 10 }
    ]
  },
  {
    id: "hillsboro-sd",
    name: "Hillsboro School District (1J)",
    city: "Hillsboro",
    county: "Washington",
    averageRating: 8.1,
    center: { lat: 45.5229, lng: -122.9898 },
    description: "Known for dual-language immersion programs and tech pathway partnerships with Intel.",
    topSchools: [
      { name: "Glencoe High School", type: "High", rating: 8 },
      { name: "Orenco Elementary", type: "Elementary", rating: 9 },
      { name: "Evergreen Middle", type: "Middle", rating: 8 }
    ]
  },
  {
    id: "eugene-4j",
    name: "Eugene School District 4J",
    city: "Eugene",
    county: "Lane",
    averageRating: 8.6,
    center: { lat: 44.0521, lng: -123.0868 },
    description: "South Eugene focus on arts, language immersion, and outdoor education.",
    topSchools: [
      { name: "South Eugene High School", type: "High", rating: 9 },
      { name: "Roosevelt Middle School", type: "Middle", rating: 9 },
      { name: "Charlemagne French Immersion", type: "Elementary", rating: 9 }
    ]
  },
  {
    id: "bend-lapine-sd",
    name: "Bend-La Pine School District (1)",
    city: "Bend",
    county: "Deschutes",
    averageRating: 8.9,
    center: { lat: 44.0582, lng: -121.3153 },
    description: "Central Oregon's flagship district featuring outdoor science integration and high grad rates.",
    topSchools: [
      { name: "Summit High School", type: "High", rating: 9 },
      { name: "High Lakes Elementary", type: "Elementary", rating: 9 },
      { name: "Pacific Crest Middle School", type: "Middle", rating: 9 }
    ]
  },
  {
    id: "salem-keizer-sd",
    name: "Salem-Keizer Public Schools (24J)",
    city: "Salem",
    county: "Marion",
    averageRating: 7.9,
    center: { lat: 44.9429, lng: -123.0351 },
    description: "Diverse state capital district with extensive Career Technical Education (CTEC) center.",
    topSchools: [
      { name: "South Salem High School", type: "High", rating: 8 },
      { name: "Crossler Middle School", type: "Middle", rating: 8 },
      { name: "Candalaria Elementary", type: "Elementary", rating: 8 }
    ]
  },
  {
    id: "coos-bay-sd",
    name: "Coos Bay School District (9)",
    city: "Coos Bay",
    county: "Coos",
    averageRating: 7.6,
    center: { lat: 43.3665, lng: -124.2179 },
    description: "Coastal community district with maritime trades and modern elementary campus upgrades.",
    topSchools: [
      { name: "Marshfield High School", type: "High", rating: 8 },
      { name: "Millicoma Middle School", type: "Middle", rating: 7 },
      { name: "Blossom Gulch Elementary", type: "Elementary", rating: 8 }
    ]
  }
];

// Predefined Key Amenities across Oregon
export const KEY_OREGON_AMENITIES: AmenityPoint[] = [
  // Transit & MAX Light Rail
  { id: "am-max-pdx-1", name: "Pioneer Courthouse Sq MAX Station", category: "transit", city: "Portland", lat: 45.5189, lng: -122.6792, label: "MAX Blue/Red/Green/Yellow" },
  { id: "am-max-beav-1", name: "Beaverton Central MAX Station", category: "transit", city: "Beaverton", lat: 45.4912, lng: -122.8021, label: "MAX Blue/Red Line Transit Hub" },
  { id: "am-max-hills-1", name: "Orenco Station / NW Parkway", category: "transit", city: "Hillsboro", lat: 45.5325, lng: -122.9150, label: "MAX Blue Line Tech Corridor" },
  { id: "am-max-sunset", name: "Sunset Transit Center Park & Ride", category: "transit", city: "Beaverton", lat: 45.5110, lng: -122.7750, label: "Rapid Bus & MAX Light Rail" },
  { id: "am-eug-ltd", name: "Eugene Downtown LTD Station", category: "transit", city: "Eugene", lat: 44.0505, lng: -123.0920, label: "EmX Rapid Transit Hub" },
  { id: "am-bend-transit", name: "Hawthorne Transit Center", category: "transit", city: "Bend", lat: 44.0560, lng: -121.3060, label: "Cascades East Transit Hub" },

  // Groceries & Markets
  { id: "am-groc-tj-div", name: "Trader Joe's SE 39th & Holgate", category: "grocery", city: "Portland", lat: 45.4900, lng: -122.6220, label: "Organic & Value Groceries" },
  { id: "am-groc-ns-div", name: "New Seasons Market Division", category: "grocery", city: "Portland", lat: 45.5050, lng: -122.6350, label: "Local Farm-to-Table Grocery" },
  { id: "am-groc-wf-beav", name: "Whole Foods Market Beaverton", category: "grocery", city: "Beaverton", lat: 45.4930, lng: -122.7980, label: "Full Service Natural Foods" },
  { id: "am-groc-tj-beav", name: "Trader Joe's Beaverton Town Sq", category: "grocery", city: "Beaverton", lat: 45.4850, lng: -122.7910, label: "Organic & Neighborhood Groceries" },
  { id: "am-groc-ns-lo", name: "New Seasons Market Mountain Park", category: "grocery", city: "Lake Oswego", lat: 45.4330, lng: -122.7050, label: "Artisan & Fresh Foods Market" },
  { id: "am-groc-mkt-bend", name: "Market of Choice Old Mill", category: "grocery", city: "Bend", lat: 44.0480, lng: -121.3190, label: "Local Central Oregon Grocer" },
  { id: "am-groc-mc-eug", name: "Market of Choice South Eugene", category: "grocery", city: "Eugene", lat: 44.0260, lng: -123.0890, label: "Full Organic Produce & Deli" },

  // Top Schools
  { id: "am-sch-lincoln", name: "Lincoln High School (Rated 9/10)", category: "school", city: "Portland", lat: 45.5200, lng: -122.6900, label: "Public IB World School" },
  { id: "am-sch-isb", name: "International School of Beaverton (10/10)", category: "school", city: "Beaverton", lat: 45.4820, lng: -122.8100, label: "#1 STEM School in OR" },
  { id: "am-sch-lohs", name: "Lake Oswego High School (10/10)", category: "school", city: "Lake Oswego", lat: 45.4150, lng: -122.6620, label: "Top-Rated High School" },
  { id: "am-sch-seug", name: "South Eugene High School (9/10)", category: "school", city: "Eugene", lat: 44.0320, lng: -123.0820, label: "Distinguished Arts & Academic High" },
  { id: "am-sch-summit", name: "Summit High School (9/10)", category: "school", city: "Bend", lat: 44.0650, lng: -121.3500, label: "Top Central Oregon High School" },

  // Parks & Trails
  { id: "am-park-tabor", name: "Mt. Tabor Park & Reservoirs", category: "park", city: "Portland", lat: 45.5110, lng: -122.5950, label: "Volcanic Park, Trails & Off-Leash" },
  { id: "am-park-forest", name: "Forest Park Wildwood Trail", category: "park", city: "Portland", lat: 45.5350, lng: -122.7150, label: "5,000-Acre Urban Forest" },
  { id: "am-park-comw", name: "Commonwealth Lake Park", category: "park", city: "Beaverton", lat: 45.5090, lng: -122.8050, label: "Scenic Lake, Walking Loop & Ducks" },
  { id: "am-park-george", name: "George Rogers Park on Willamette", category: "park", city: "Lake Oswego", lat: 45.4120, lng: -122.6610, label: "River Beach, Sports Fields & Trails" },
  { id: "am-park-drake", name: "Drake Park & Mirror Pond", category: "park", city: "Bend", lat: 44.0570, lng: -121.3190, label: "Iconic Downtown Riverfront Park" },
  { id: "am-park-hendricks", name: "Hendricks Park Rhododendron Garden", category: "park", city: "Eugene", lat: 44.0410, lng: -123.0590, label: "Historic Forest & Viewpoint" },

  // Healthcare
  { id: "am-hlth-ohsu", name: "OHSU Marquam Hill Hospital", category: "health", city: "Portland", lat: 45.4980, lng: -122.6850, label: "Level 1 Trauma & Academic Medical" },
  { id: "am-hlth-stv", name: "Providence St. Vincent Medical Center", category: "health", city: "Beaverton", lat: 45.5080, lng: -122.7710, label: "Major Comprehensive Hospital" },
  { id: "am-hlth-stch", name: "St. Charles Medical Center", category: "health", city: "Bend", lat: 44.0620, lng: -121.2650, label: "Central Oregon Regional Trauma Hub" },
  { id: "am-hlth-peace", name: "PeaceHealth Sacred Heart University Dist", category: "health", city: "Eugene", lat: 44.0450, lng: -123.0780, label: "24/7 Emergency & Specialty Care" }
];

/**
 * Calculates Haversine distance in statute miles between two points.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8; // Radius of the Earth in statute miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

/**
 * Extracts real latitude and longitude coordinates for a listing.
 * Phase 1B: Returns null when source coordinates are absent (zero fabricated city jitter).
 */
export function getListingCoordinates(listing: PropertyListing): GeoCoordinate | null {
  const rawLat = listing.latitude ?? listing.lat;
  const rawLng = listing.longitude ?? listing.lng;
  if (rawLat != null && rawLng != null && !isNaN(Number(rawLat)) && !isNaN(Number(rawLng))) {
    return { lat: Number(rawLat), lng: Number(rawLng) };
  }
  return null;
}

/**
 * Finds the closest school district and top nearby schools.
 */
export function getListingSchoolDistrict(
  listing: PropertyListing,
  lat: number,
  lng: number
): { district: SchoolDistrictInfo; assignedSchools: SchoolInfo[] } {
  const cityLower = (listing.city || "").toLowerCase();
  
  // Direct city match if available
  let matchedDistrict = OREGON_SCHOOL_DISTRICTS.find(d => 
    d.city.toLowerCase() === cityLower || cityLower.includes(d.city.toLowerCase())
  );

  // Fallback to nearest district center
  if (!matchedDistrict) {
    let minDistance = Infinity;
    for (const d of OREGON_SCHOOL_DISTRICTS) {
      const dist = calculateHaversineDistance(lat, lng, d.center.lat, d.center.lng);
      if (dist < minDistance) {
        minDistance = dist;
        matchedDistrict = d;
      }
    }
  }

  matchedDistrict = matchedDistrict || OREGON_SCHOOL_DISTRICTS[0];

  const assignedSchools: SchoolInfo[] = matchedDistrict.topSchools.map((s, idx) => ({
    name: s.name,
    type: s.type,
    rating: s.rating,
    distanceMiles: Number((0.4 + idx * 0.7 + (Math.abs(lat * 100) % 5) * 0.1).toFixed(1))
  }));

  return { district: matchedDistrict, assignedSchools };
}

/**
 * Computes proximity to key amenities for a property coordinate.
 */
export function getNearbyAmenities(
  lat: number,
  lng: number,
  maxMiles: number = 8
): PropertyAmenityDistance[] {
  return KEY_OREGON_AMENITIES.map(amenity => {
    const distanceMiles = calculateHaversineDistance(lat, lng, amenity.lat, amenity.lng);
    const walkMinutes = Math.round(distanceMiles * 20); // approx 3 mph walking pace
    const driveMinutes = Math.max(1, Math.round(distanceMiles * 2.4)); // approx 25 mph city driving pace
    return {
      amenity,
      distanceMiles,
      walkMinutes,
      driveMinutes
    };
  })
    .filter(item => item.distanceMiles <= maxMiles)
    .sort((a, b) => a.distanceMiles - b.distanceMiles);
}

/**
 * Evaluates comprehensive "Homebuying Readiness" for a property against the buyer's profile.
 */
export function calculateHomebuyingReadiness(
  property: PropertyListing,
  profile: FinancialProfile
): HomebuyingReadinessDetails {
  const price = property.price != null && !isNaN(Number(property.price))
    ? Number(property.price)
    : (profile.targetPrice || 350000);
  const loanAmt = Math.max(0, price - profile.downPaymentSavings);
  const estPI = calculateMonthlyPI(loanAmt, profile.interestRate, profile.loanTermYears);
  const monthlyTaxes = property.propertyTaxAnnual != null && !isNaN(Number(property.propertyTaxAnnual))
    ? Math.round(Number(property.propertyTaxAnnual) / 12)
    : Math.round((price * 0.009) / 12);
  const monthlyInsurance = Math.round(profile.annualHomeInsurance / 12);
  const hoa = property.hoaMonthly || 0;
  const totalMonthly = estPI + monthlyTaxes + monthlyInsurance + hoa;

  const targetMax = profile.targetMaxMonthlyPayment || 3200;
  const savingsVsTarget = targetMax - totalMonthly;
  const isBudgetFit = totalMonthly <= targetMax;

  let score = 70; // baseline
  const positiveFactors: string[] = [];
  const cautionFactors: string[] = [];

  // 1. Monthly Payment Affordability (35 pts)
  if (savingsVsTarget >= 300) {
    score += 20;
    positiveFactors.push(`Monthly payment is $${savingsVsTarget.toLocaleString()} below your maximum budget cap.`);
  } else if (savingsVsTarget >= 0) {
    score += 12;
    positiveFactors.push(`Comfortably within your $${targetMax.toLocaleString()}/mo approved target payment.`);
  } else if (savingsVsTarget >= -150) {
    score -= 8;
    cautionFactors.push(`Payment stretches $${Math.abs(savingsVsTarget).toLocaleString()}/mo above your target cap.`);
  } else {
    score -= 22;
    cautionFactors.push(`High payment: exceeds target monthly budget by $${Math.abs(savingsVsTarget).toLocaleString()}/mo.`);
  }

  // 2. Loan Program / Down Payment Overlays (20 pts)
  const usda = isUsdaEligible(property);
  const lmi = isLmiEligible(property);
  const targeted = isTargetedArea(property);

  if (usda) {
    score += 10;
    positiveFactors.push("USDA Rural Development 100% Financing Eligible (Zero Down Option).");
  }
  if (lmi) {
    score += 7;
    positiveFactors.push("OHCS / Flex Lending LMI Census Tract: potential grant & rate reduction.");
  }
  if (targeted) {
    score += 5;
    positiveFactors.push("State Targeted Area: higher purchase price and income limit allowances.");
  }

  // 3. Structural Quality & Tour Scorecard (25 pts)
  if (property.scorecard) {
    const sc = property.scorecard;
    if (sc.grade === "A" || sc.grade === "A+") {
      score += 12;
      positiveFactors.push(`Tour Scorecard Grade ${sc.grade}: excellent roof, foundation, and mechanicals.`);
    } else if (sc.grade === "B" || sc.grade === "B+") {
      score += 6;
      positiveFactors.push(`Solid inspection profile (Grade ${sc.grade}) with manageable upkeep.`);
    }

    if (sc.estimatedRenovationCost !== undefined && sc.estimatedRenovationCost <= 2500) {
      score += 8;
      positiveFactors.push(`Move-in ready turnkey status: estimated repairs under $${sc.estimatedRenovationCost.toLocaleString()}.`);
    } else if (sc.estimatedRenovationCost !== undefined && sc.estimatedRenovationCost >= 10000) {
      score -= 10;
      cautionFactors.push(`Deferred maintenance: $${sc.estimatedRenovationCost.toLocaleString()} estimated repair cost.`);
    }

    if (sc.redFlags && sc.redFlags.length > 0) {
      cautionFactors.push(`Inspection note: ${sc.redFlags[0]}`);
    }
  } else {
    positiveFactors.push("Ready for on-site tour audit & digital scorecard evaluation.");
  }

  // 4. Days on Market & Negotiation Leverage (10 pts)
  const dom = property.daysOnMarket || 0;
  if (dom > 60) {
    score += 6;
    positiveFactors.push(`High negotiation leverage: ${dom} days on market, strong candidate for seller concessions.`);
  } else if (dom < 10) {
    positiveFactors.push(`Fresh new listing (${dom} days on market): prime tour availability.`);
  }

  // 5. HOA impact
  if (hoa === 0) {
    score += 5;
    positiveFactors.push("Zero HOA dues: maximum monthly cash-flow autonomy.");
  } else if (hoa > 250) {
    score -= 6;
    cautionFactors.push(`HOA dues of $${hoa}/mo reduce borrowing power.`);
  }

  // Clamp score between 25 and 99
  const finalScore = Math.min(99, Math.max(25, Math.round(score)));

  let tier: "High" | "Moderate" | "Developing" = "Moderate";
  let label = "Strong Contender";
  let badgeColor = "bg-amber-100 text-amber-800 border-amber-300";

  if (finalScore >= 85) {
    tier = "High";
    label = "High Readiness (Offer-Ready)";
    badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-300";
  } else if (finalScore < 70) {
    tier = "Developing";
    label = "Developing Readiness";
    badgeColor = "bg-slate-100 text-slate-700 border-slate-300";
  }

  return {
    score: finalScore,
    tier,
    label,
    badgeColor,
    positiveFactors,
    cautionFactors,
    monthlyPaymentEstimate: totalMonthly,
    monthlySavingsVsTarget: savingsVsTarget,
    isBudgetFit
  };
}
