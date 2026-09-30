/**
 * 2026 USDA Rural Development (RD) Single Family Housing Guaranteed Loan Program
 * Nationwide Household Income Limits (1-4 Person vs. 5-8 Person Household Caps),
 * Area Eligibility Rules, and High-Cost MSA Adjustments for all 50 States.
 */

export interface UsdaCountyIncomeLimit {
  county: string;
  stateCode: string;
  limit1to4: number;
  limit5to8: number;
  isHighCost: boolean;
  msaName?: string;
  medianIncome?: number;
}

// 2026 National Baseline USDA RD Guaranteed Loan Income Limits:
// 1-4 Person Household: $112,450
// 5-8 Person Household: $148,450
export const USDA_2026_NATIONAL_BASELINE_1_TO_4 = 112450;
export const USDA_2026_NATIONAL_BASELINE_5_TO_8 = 148450;

/**
 * Key High-Cost MSAs and Counties across all 50 States where USDA RD
 * increases the standard household income limits based on elevated local AMI.
 */
export const HIGH_COST_USDA_COUNTIES: Record<string, Record<string, { limit1to4: number; limit5to8: number; msaName: string }>> = {
  // Oregon
  "OR": {
    "Multnomah": { limit1to4: 135500, limit5to8: 178850, msaName: "Portland-Vancouver-Hillsboro MSA" },
    "Washington": { limit1to4: 135500, limit5to8: 178850, msaName: "Portland-Vancouver-Hillsboro MSA" },
    "Clackamas": { limit1to4: 135500, limit5to8: 178850, msaName: "Portland-Vancouver-Hillsboro MSA" },
    "Yamhill": { limit1to4: 135500, limit5to8: 178850, msaName: "Portland-Vancouver-Hillsboro MSA" },
    "Columbia": { limit1to4: 135500, limit5to8: 178850, msaName: "Portland-Vancouver-Hillsboro MSA" },
    "Deschutes": { limit1to4: 126950, limit5to8: 167550, msaName: "Bend-Redmond MSA" },
    "Hood River": { limit1to4: 128400, limit5to8: 169500, msaName: "Hood River Non-Metro High Cost" },
    "Benton": { limit1to4: 124200, limit5to8: 163950, msaName: "Corvallis MSA" },
    "Lane": { limit1to4: 114850, limit5to8: 151600, msaName: "Eugene-Springfield MSA" },
    "Marion": { limit1to4: 112450, limit5to8: 148450, msaName: "Salem MSA" },
    "Jackson": { limit1to4: 112450, limit5to8: 148450, msaName: "Medford MSA" },
    "Coos": { limit1to4: 112450, limit5to8: 148450, msaName: "Coos Bay Coastal Tier" },
  },
  // Washington
  "WA": {
    "King": { limit1to4: 173550, limit5to8: 229100, msaName: "Seattle-Bellevue-Everett Metro" },
    "Snohomish": { limit1to4: 173550, limit5to8: 229100, msaName: "Seattle-Bellevue-Everett Metro" },
    "Pierce": { limit1to4: 138650, limit5to8: 183000, msaName: "Tacoma Metro" },
    "Kitsap": { limit1to4: 135900, limit5to8: 179400, msaName: "Bremerton-Silverdale Metro" },
    "Clark": { limit1to4: 135500, limit5to8: 178850, msaName: "Portland-Vancouver Metro" },
    "Thurston": { limit1to4: 128150, limit5to8: 169150, msaName: "Olympia-Tumwater Metro" },
    "Whatcom": { limit1to4: 125300, limit5to8: 165400, msaName: "Bellingham Metro" },
    "San Juan": { limit1to4: 134200, limit5to8: 177150, msaName: "San Juan Islands Resort Tier" },
    "Spokane": { limit1to4: 115200, limit5to8: 152050, msaName: "Spokane Metro" }
  },
  // California
  "CA": {
    "Santa Clara": { limit1to4: 212500, limit5to8: 280500, msaName: "San Jose-Sunnyvale-Santa Clara MSA" },
    "San Mateo": { limit1to4: 216300, limit5to8: 285500, msaName: "San Francisco-San Mateo Metro" },
    "San Francisco": { limit1to4: 216300, limit5to8: 285500, msaName: "San Francisco Metro" },
    "Marin": { limit1to4: 201200, limit5to8: 265600, msaName: "Marin County High Cost" },
    "Contra Costa": { limit1to4: 179450, limit5to8: 236850, msaName: "Oakland-Fremont Metro" },
    "Alameda": { limit1to4: 179450, limit5to8: 236850, msaName: "Oakland-Hayward Metro" },
    "Orange": { limit1to4: 165800, limit5to8: 218850, msaName: "Santa Ana-Anaheim-Irvine Metro" },
    "San Diego": { limit1to4: 156400, limit5to8: 206450, msaName: "San Diego-Chula Vista-Carlsbad" },
    "Los Angeles": { limit1to4: 135800, limit5to8: 179250, msaName: "Los Angeles-Long Beach-Glendale" },
    "Ventura": { limit1to4: 152300, limit5to8: 201050, msaName: "Oxnard-Thousand Oaks-Ventura" },
    "Santa Barbara": { limit1to4: 147800, limit5to8: 195100, msaName: "Santa Barbara-Santa Maria" },
    "Riverside": { limit1to4: 122150, limit5to8: 161250, msaName: "Riverside-San Bernardino-Ontario" },
    "San Bernardino": { limit1to4: 122150, limit5to8: 161250, msaName: "Inland Empire Metro" },
    "Sacramento": { limit1to4: 129750, limit5to8: 171250, msaName: "Sacramento-Roseville Metro" },
    "Placer": { limit1to4: 139500, limit5to8: 184150, msaName: "Roseville-Tahoe Foothills Tier" }
  },
  // Texas
  "TX": {
    "Travis": { limit1to4: 142600, limit5to8: 188250, msaName: "Austin-Round Rock-San Marcos" },
    "Williamson": { limit1to4: 142600, limit5to8: 188250, msaName: "Austin-Round Rock Metro" },
    "Hays": { limit1to4: 142600, limit5to8: 188250, msaName: "San Marcos-Buda Tier" },
    "Collin": { limit1to4: 133400, limit5to8: 176100, msaName: "Dallas-Plano-Irving Metro" },
    "Denton": { limit1to4: 133400, limit5to8: 176100, msaName: "Dallas-Fort Worth Metro" },
    "Dallas": { limit1to4: 133400, limit5to8: 176100, msaName: "Dallas Metro" },
    "Tarrant": { limit1to4: 128950, limit5to8: 170200, msaName: "Fort Worth-Arlington" },
    "Harris": { limit1to4: 121500, limit5to8: 160400, msaName: "Houston-The Woodlands-Sugar Land" },
    "Fort Bend": { limit1to4: 121500, limit5to8: 160400, msaName: "Sugar Land Metro" },
    "Bexar": { limit1to4: 114200, limit5to8: 150750, msaName: "San Antonio-New Braunfels" }
  },
  // Florida
  "FL": {
    "Monroe": { limit1to4: 148900, limit5to8: 196550, msaName: "Key West & Florida Keys Tier" },
    "Palm Beach": { limit1to4: 132450, limit5to8: 174850, msaName: "West Palm Beach-Boca Raton" },
    "Broward": { limit1to4: 126800, limit5to8: 167400, msaName: "Fort Lauderdale-Pompano Beach" },
    "Miami-Dade": { limit1to4: 122900, limit5to8: 162250, msaName: "Miami-Miami Beach-Kendall" },
    "Collier": { limit1to4: 134100, limit5to8: 177000, msaName: "Naples-Marco Island MSA" },
    "Orange": { limit1to4: 118400, limit5to8: 156300, msaName: "Orlando-Kissimmee-Sanford" },
    "Hillsborough": { limit1to4: 117500, limit5to8: 155100, msaName: "Tampa-St. Petersburg-Clearwater" },
    "St. Johns": { limit1to4: 129400, limit5to8: 170800, msaName: "St. Augustine Coastal Tier" },
    "Sarasota": { limit1to4: 124800, limit5to8: 164750, msaName: "North Port-Sarasota-Bradenton" }
  },
  // Colorado
  "CO": {
    "Pitkin": { limit1to4: 198500, limit5to8: 262000, msaName: "Aspen Resort High Cost Tier" },
    "San Miguel": { limit1to4: 184200, limit5to8: 243150, msaName: "Telluride Resort High Cost Tier" },
    "Eagle": { limit1to4: 176400, limit5to8: 232850, msaName: "Vail-Edwards Resort Tier" },
    "Boulder": { limit1to4: 169800, limit5to8: 224150, msaName: "Boulder-Longmont MSA" },
    "Summit": { limit1to4: 168200, limit5to8: 222000, msaName: "Breckenridge Resort Tier" },
    "Denver": { limit1to4: 152600, limit5to8: 201450, msaName: "Denver-Aurora-Lakewood MSA" },
    "Arapahoe": { limit1to4: 152600, limit5to8: 201450, msaName: "Denver-Aurora Metro" },
    "Douglas": { limit1to4: 152600, limit5to8: 201450, msaName: "Highlands Ranch-Castle Rock" },
    "Larimer": { limit1to4: 139400, limit5to8: 184000, msaName: "Fort Collins-Loveland MSA" },
    "El Paso": { limit1to4: 128900, limit5to8: 170150, msaName: "Colorado Springs MSA" }
  },
  // Arizona
  "AZ": {
    "Maricopa": { limit1to4: 122850, limit5to8: 162150, msaName: "Phoenix-Mesa-Chandler MSA" },
    "Pinal": { limit1to4: 118400, limit5to8: 156300, msaName: "San Tan Valley-Casa Grande" },
    "Coconino": { limit1to4: 126900, limit5to8: 167500, msaName: "Flagstaff Mountain Tier" },
    "Pima": { limit1to4: 112450, limit5to8: 148450, msaName: "Tucson MSA" }
  },
  // Idaho
  "ID": {
    "Blaine": { limit1to4: 168900, limit5to8: 222950, msaName: "Sun Valley-Hailey Resort Tier" },
    "Ada": { limit1to4: 131500, limit5to8: 173600, msaName: "Boise City-Nampa MSA" },
    "Canyon": { limit1to4: 124200, limit5to8: 163950, msaName: "Nampa-Caldwell Rural Fringe" },
    "Kootenai": { limit1to4: 123800, limit5to8: 163400, msaName: "Coeur d'Alene MSA" },
    "Teton": { limit1to4: 142100, limit5to8: 187550, msaName: "Driggs-Victor Teton Valley Tier" }
  },
  // Nevada
  "NV": {
    "Washoe": { limit1to4: 131800, limit5to8: 174000, msaName: "Reno-Sparks MSA" },
    "Douglas": { limit1to4: 139500, limit5to8: 184150, msaName: "Lake Tahoe-Gardnerville" },
    "Clark": { limit1to4: 119500, limit5to8: 157750, msaName: "Las Vegas-Henderson-Paradise" }
  },
  // Utah
  "UT": {
    "Summit": { limit1to4: 192400, limit5to8: 254000, msaName: "Park City High Cost Tier" },
    "Salt Lake": { limit1to4: 136800, limit5to8: 180600, msaName: "Salt Lake City Metro" },
    "Utah": { limit1to4: 134200, limit5to8: 177150, msaName: "Provo-Orem MSA" },
    "Washington": { limit1to4: 121500, limit5to8: 160400, msaName: "St. George-Hurricane Valley" }
  },
  // Hawaii
  "HI": {
    "Honolulu": { limit1to4: 164200, limit5to8: 216750, msaName: "Urban Honolulu MSA" },
    "Maui": { limit1to4: 158900, limit5to8: 209750, msaName: "Kahului-Wailuku-Lahaina" },
    "Kauai": { limit1to4: 152400, limit5to8: 201150, msaName: "Kauai County High Cost" },
    "Hawaii": { limit1to4: 128500, limit5to8: 169600, msaName: "Big Island Non-Metro Tier" }
  },
  // New York
  "NY": {
    "Westchester": { limit1to4: 182400, limit5to8: 240750, msaName: "New York-White Plains Tier" },
    "Nassau": { limit1to4: 189500, limit5to8: 250150, msaName: "Nassau-Suffolk Long Island" },
    "Suffolk": { limit1to4: 189500, limit5to8: 250150, msaName: "Nassau-Suffolk Long Island" },
    "Rockland": { limit1to4: 176200, limit5to8: 232600, msaName: "New York Metro Fringe" },
    "Saratoga": { limit1to4: 132500, limit5to8: 174900, msaName: "Albany-Schenectady-Troy" },
    "Monroe": { limit1to4: 114500, limit5to8: 151150, msaName: "Rochester MSA" },
    "Erie": { limit1to4: 112450, limit5to8: 148450, msaName: "Buffalo-Cheektowaga" }
  },
  // North Carolina
  "NC": {
    "Wake": { limit1to4: 136200, limit5to8: 179800, msaName: "Raleigh-Cary MSA" },
    "Durham": { limit1to4: 132400, limit5to8: 174750, msaName: "Durham-Chapel Hill MSA" },
    "Orange": { limit1to4: 132400, limit5to8: 174750, msaName: "Durham-Chapel Hill MSA" },
    "Mecklenburg": { limit1to4: 129500, limit5to8: 170950, msaName: "Charlotte-Concord-Gastonia" },
    "Buncombe": { limit1to4: 122800, limit5to8: 162100, msaName: "Asheville Blue Ridge Tier" }
  },
  // Illinois
  "IL": {
    "Cook": { limit1to4: 131200, limit5to8: 173200, msaName: "Chicago-Naperville-Elgin" },
    "DuPage": { limit1to4: 131200, limit5to8: 173200, msaName: "Chicago-Naperville Metro" },
    "Kane": { limit1to4: 131200, limit5to8: 173200, msaName: "Chicago Metro Outer Fringe" },
    "Lake": { limit1to4: 139500, limit5to8: 184150, msaName: "Lake County High Cost Tier" }
  },
  // Massachusetts
  "MA": {
    "Middlesex": { limit1to4: 184500, limit5to8: 243550, msaName: "Boston-Cambridge-Newton" },
    "Norfolk": { limit1to4: 184500, limit5to8: 243550, msaName: "Boston Metro South Shore" },
    "Essex": { limit1to4: 172900, limit5to8: 228200, msaName: "Boston-Cambridge Metro" },
    "Plymouth": { limit1to4: 154200, limit5to8: 203550, msaName: "Brockton-Bridgewater Tier" },
    "Barnstable": { limit1to4: 148200, limit5to8: 195600, msaName: "Cape Cod Resort Tier" }
  }
};

/**
 * Universal evaluator for USDA RD 2026 Household Income Limits across all 50 US States.
 * Evaluates both 1-4 member household and 5-8 member household caps.
 */
export function getNationwideUsdaIncomeLimit(
  stateCode: string,
  countyName?: string,
  householdSize: number = 3
): {
  limit: number;
  limit1to4: number;
  limit5to8: number;
  isLargeFamily: boolean;
  isHighCost: boolean;
  tierDesc: string;
  msaName: string;
  stateCode: string;
  countyName: string;
} {
  const normState = (stateCode || "OR").trim().toUpperCase();
  const normCounty = (countyName || "").trim().replace(/\s+(county|parish|borough)$/i, "");
  const isLargeFamily = householdSize > 4;

  const stateHighCostMap = HIGH_COST_USDA_COUNTIES[normState];
  if (stateHighCostMap && normCounty) {
    // Exact or case-insensitive match
    const matchedKey = Object.keys(stateHighCostMap).find(
      (k) => k.toLowerCase() === normCounty.toLowerCase()
    );
    if (matchedKey) {
      const match = stateHighCostMap[matchedKey];
      const activeLimit = isLargeFamily ? match.limit5to8 : match.limit1to4;
      return {
        limit: activeLimit,
        limit1to4: match.limit1to4,
        limit5to8: match.limit5to8,
        isLargeFamily,
        isHighCost: true,
        tierDesc: `High-Cost MSA Adjusted (${match.msaName})`,
        msaName: match.msaName,
        stateCode: normState,
        countyName: matchedKey
      };
    }
  }

  // Default national baseline
  const activeLimit = isLargeFamily
    ? USDA_2026_NATIONAL_BASELINE_5_TO_8
    : USDA_2026_NATIONAL_BASELINE_1_TO_4;

  return {
    limit: activeLimit,
    limit1to4: USDA_2026_NATIONAL_BASELINE_1_TO_4,
    limit5to8: USDA_2026_NATIONAL_BASELINE_5_TO_8,
    isLargeFamily,
    isHighCost: false,
    tierDesc: `USDA Standard National Baseline ($${(activeLimit / 1000).toFixed(1)}k Cap)`,
    msaName: "Standard Rural Area",
    stateCode: normState,
    countyName: normCounty || "General County"
  };
}

/**
 * Calculates dual-qualification match for a property:
 * Checks Area Eligibility (tract) + Income Eligibility (household cap)
 */
export function evaluateUsdaDualMatch(
  householdIncome: number,
  householdSize: number,
  stateCode: string,
  countyName: string,
  isTractEligible: boolean = true
): {
  isFullyEligible: boolean;
  meetsIncomeCap: boolean;
  meetsAreaEligibility: boolean;
  incomeHeadroom: number;
  incomeLimit: number;
  limit1to4: number;
  limit5to8: number;
  isHighCost: boolean;
  tierDesc: string;
  verdictText: string;
  badgeLabel: string;
  badgeColor: string;
} {
  const limitInfo = getNationwideUsdaIncomeLimit(stateCode, countyName, householdSize);
  const meetsIncomeCap = householdIncome <= limitInfo.limit;
  const meetsAreaEligibility = isTractEligible;
  const isFullyEligible = meetsIncomeCap && meetsAreaEligibility;
  const incomeHeadroom = limitInfo.limit - householdIncome;

  let verdictText: string;
  let badgeLabel: string;
  let badgeColor: string;

  if (isFullyEligible) {
    verdictText = `✓ Dual Qualified! Property is in an eligible USDA Rural Area and household income ($${householdIncome.toLocaleString()}) is below the ${limitInfo.countyName} cap of $${limitInfo.limit.toLocaleString()} (${householdSize} persons). Headroom: +$${incomeHeadroom.toLocaleString()}.`;
    badgeLabel = "✓ USDA RD 100% Zero-Down Eligible";
    badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-300";
  } else if (!meetsAreaEligibility && meetsIncomeCap) {
    verdictText = `⚠️ Income Qualifies, but Property is inside an Ineligible Urban Exclusion Zone. Consider Fannie 97% or FHA NHF DPA instead.`;
    badgeLabel = "USDA Area Ineligible (Urban Zone)";
    badgeColor = "bg-amber-100 text-amber-800 border-amber-300";
  } else if (meetsAreaEligibility && !meetsIncomeCap) {
    const overage = householdIncome - limitInfo.limit;
    verdictText = `⚠️ Property Area Qualifies, but household income exceeds the ${limitInfo.countyName} cap by $${overage.toLocaleString()}. Switch to Lakeview National (≤140% AMI) or HomeReady.`;
    badgeLabel = `Over USDA Income Cap (+$${Math.round(overage / 1000)}k)`;
    badgeColor = "bg-rose-100 text-rose-800 border-rose-300";
  } else {
    verdictText = `❌ Neither Area nor Income qualifies for USDA RD. Use Conventional 3% Down or FHA 203(b).`;
    badgeLabel = "USDA Ineligible";
    badgeColor = "bg-stone-100 text-stone-700 border-stone-300";
  }

  return {
    isFullyEligible,
    meetsIncomeCap,
    meetsAreaEligibility,
    incomeHeadroom,
    incomeLimit: limitInfo.limit,
    limit1to4: limitInfo.limit1to4,
    limit5to8: limitInfo.limit5to8,
    isHighCost: limitInfo.isHighCost,
    tierDesc: limitInfo.tierDesc,
    verdictText,
    badgeLabel,
    badgeColor
  };
}
