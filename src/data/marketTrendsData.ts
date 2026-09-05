/**
 * Market Trends & Housing Intelligence Data
 * 
 * STRICT SAFEGUARD MANDATE:
 * This data set is exclusively focused on housing inventory, buyer strategies,
 * property inspections, negotiations, closing preparations, and trusted educational
 * blogs/videos (YouTube).
 * 
 * IT IS STRICTLY SAFEGUARDED FROM ANY TALK OF MORTGAGE INTEREST RATES, RATE TRENDS,
 * OR RATE SPECULATION.
 */

export interface MarketTrendItem {
  id: string;
  title: string;
  source: string;
  sourceType: "news" | "blog" | "youtube";
  category: "inventory" | "strategy" | "inspection" | "negotiation" | "closing";
  categoryLabel: string;
  summary: string;
  keyTakeaway: string;
  url: string;
  publishedAt: string;
  readOrWatchTime: string;
  authorOrChannel: string;
  thumbnailUrl?: string;
  confidenceScore: number;
  highlightTopic?: string;
}

// Banned keywords for mortgage interest rates and rate speculation
export const BANNED_RATE_KEYWORDS = [
  "interest rate",
  "interest rates",
  "mortgage rate",
  "mortgage rates",
  "rate cut",
  "rate cuts",
  "rate hike",
  "rate hikes",
  "fed rate",
  "federal reserve",
  "rates rise",
  "rates surge",
  "rates drop",
  "rates climb",
  "treasury yield",
  "10-year yield",
  "basis points",
  "refinance rate",
  "rate lock",
  "sofr",
  "fomc",
  "jerome powell",
  "inflation print",
  "apr",
  "30-year fixed rate"
];

/**
 * Validates that text contains ZERO mention of mortgage interest rates or rate trends.
 */
export function isSafeFromRateTalk(text: string): boolean {
  if (!text) return true;
  const lower = text.toLowerCase();
  return !BANNED_RATE_KEYWORDS.some((kw) => lower.includes(kw));
}

/**
 * Filter an array of items to ensure not a single item mentions mortgage rates.
 */
export function sanitizeMarketTrendItems(items: MarketTrendItem[]): MarketTrendItem[] {
  return items.filter((item) => {
    const combined = `${item.title} ${item.summary} ${item.keyTakeaway} ${item.categoryLabel} ${item.source}`;
    return isSafeFromRateTalk(combined);
  });
}

export const INITIAL_MARKET_TREND_ITEMS: MarketTrendItem[] = [
  {
    id: "mt-1",
    title: "Suburban Housing Inventory Expands: Why Patient First-Time Buyers Hold Stronger Leverage",
    source: "Redfin Housing Economics",
    sourceType: "news",
    category: "inventory",
    categoryLabel: "Housing Inventory & Supply",
    summary: "Single-family housing inventory has gained momentum across key metro suburbs, increasing active days on market and giving buyers breathing room to conduct thorough inspections and request seller credits.",
    keyTakeaway: "With properties averaging 32 days on market, sellers are far more open to covering closing fees or funding repair allowances rather than holding out for bidding wars.",
    url: "https://www.redfin.com/news/housing-market-update/",
    publishedAt: "Today",
    readOrWatchTime: "4 min read",
    authorOrChannel: "Redfin Research Team",
    confidenceScore: 98,
    highlightTopic: "Suburban Inventory & Seller Credits"
  },
  {
    id: "mt-2",
    title: "10 Costly First-Time Homebuyer Mistakes to Avoid When Making an Offer",
    source: "YouTube - Win The House You Love",
    sourceType: "youtube",
    category: "strategy",
    categoryLabel: "Video Guide (YouTube)",
    summary: "A practical breakdown of rookie mistakes: waiving crucial inspection contingencies, underestimating earnest money escrow deadlines, and forgetting to verify HOA reserve studies.",
    keyTakeaway: "Never waive your home inspection contingency without a pre-offer walkthrough and independent sewer scope.",
    url: "https://www.youtube.com/results?search_query=win+the+house+you+love+first+time+homebuyer+mistakes",
    publishedAt: "2 days ago",
    readOrWatchTime: "14 min video",
    authorOrChannel: "Win The House You Love",
    thumbnailUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80",
    confidenceScore: 99,
    highlightTopic: "Home Inspection & Escrow Contingencies"
  },
  {
    id: "mt-3",
    title: "How to Structure a Winning Purchase Offer in a Balanced Market (Without Overpaying)",
    source: "YouTube - Javier Vidana Real Estate",
    sourceType: "youtube",
    category: "negotiation",
    categoryLabel: "Video Guide (YouTube)",
    summary: "Step-by-step strategies for crafting attractive purchase contracts using flexible closing dates, seller leasebacks, and earnest money timing instead of inflating the offer price.",
    keyTakeaway: "Convenience often beats cash for sellers who need time to pack; aligning closing dates with seller needs can win you the home at fair list price.",
    url: "https://www.youtube.com/results?search_query=javier+vidana+winning+purchase+offer",
    publishedAt: "3 days ago",
    readOrWatchTime: "11 min video",
    authorOrChannel: "Javier Vidana",
    thumbnailUrl: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=600&q=80",
    confidenceScore: 97,
    highlightTopic: "Purchase Contract Negotiation"
  },
  {
    id: "mt-4",
    title: "The Comprehensive Home Inspection Checklist: Major Red Flags vs. Minor Cosmetic Fixes",
    source: "BiggerPockets Homebuyer Hub",
    sourceType: "blog",
    category: "inspection",
    categoryLabel: "Inspection & Due Diligence",
    summary: "Learn what certified home inspectors look for: foundation settling, aged electrical panels, roof granule loss, and HVAC life expectancy. Distinguish between $15,000 structural fixes and $200 hardware upgrades.",
    keyTakeaway: "Focus your repair amendment negotiations strictly on safety hazards, structural defects, and roof/plumbing integrity.",
    url: "https://www.biggerpockets.com/blog/home-inspection-checklist",
    publishedAt: "This Week",
    readOrWatchTime: "6 min read",
    authorOrChannel: "BiggerPockets Editorial",
    confidenceScore: 99,
    highlightTopic: "Home Inspection Negotiations"
  },
  {
    id: "mt-5",
    title: "Understanding Earnest Money Deposits & Contingency Timelines in Escrow",
    source: "Realtor.com Consumer Advice",
    sourceType: "blog",
    category: "closing",
    categoryLabel: "Closing & Escrow Preparation",
    summary: "Earnest money shows sellers you are serious, but it must be protected with clear financing, appraisal, and title contingency clauses written directly into the purchase contract.",
    keyTakeaway: "Your earnest money is safe in third-party escrow as long as contingency release dates are strictly managed with your agent.",
    url: "https://www.realtor.com/advice/buy/what-is-earnest-money/",
    publishedAt: "4 days ago",
    readOrWatchTime: "5 min read",
    authorOrChannel: "Realtor.com Guides",
    confidenceScore: 98,
    highlightTopic: "Earnest Money & Escrow Timelines"
  },
  {
    id: "mt-6",
    title: "HUD First-Time Homebuyer Educational Framework: Rights, Fair Housing, & Disclosures",
    source: "HUD.gov Housing Counseling",
    sourceType: "news",
    category: "strategy",
    categoryLabel: "Government Guidance & Consumer Rights",
    summary: "Official housing agency review on mandatory seller property disclosures, lead-based paint notifications, and your legal right to an independent home appraisal and inspection.",
    keyTakeaway: "Sellers are legally obligated to disclose known material defects; reviewing disclosures prior to drafting an offer protects your budget.",
    url: "https://www.hud.gov/topics/buying_a_home",
    publishedAt: "This Month",
    readOrWatchTime: "7 min read",
    authorOrChannel: "U.S. Dept of Housing & Urban Development",
    confidenceScore: 99,
    highlightTopic: "Seller Disclosures & Buyer Rights"
  },
  {
    id: "mt-7",
    title: "The Essential Walkthrough Checklist: What to Verify 24 Hours Before Closing",
    source: "YouTube - Win The House You Love",
    sourceType: "youtube",
    category: "closing",
    categoryLabel: "Video Guide (YouTube)",
    summary: "Never skip the final walkthrough: testing all appliances, verifying agreed repair work receipts, checking for water stains under sinks, and ensuring all debris has been removed.",
    keyTakeaway: "If agreed repairs were not completed or appliances were removed, your agent can request an escrow holdback before loan funding.",
    url: "https://www.youtube.com/results?search_query=win+the+house+you+love+final+walkthrough",
    publishedAt: "1 week ago",
    readOrWatchTime: "9 min video",
    authorOrChannel: "Win The House You Love",
    thumbnailUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
    confidenceScore: 98,
    highlightTopic: "Final Walkthrough & Escrow Holdbacks"
  },
  {
    id: "mt-8",
    title: "How to Evaluate Neighborhood Walkability, School Boundaries, & Resale Potential",
    source: "Investopedia Personal Finance",
    sourceType: "blog",
    category: "strategy",
    categoryLabel: "Neighborhood Due Diligence",
    summary: "Physical properties can be renovated, but neighborhood zoning and school attendance boundaries cannot. How to cross-reference municipal master plans and flood zone overlays before making an offer.",
    keyTakeaway: "Homes located within top-rated school clusters retain 14% higher median resale value during market corrections.",
    url: "https://www.investopedia.com/articles/mortgages-real-estate/08/home-location.asp",
    publishedAt: "5 days ago",
    readOrWatchTime: "5 min read",
    authorOrChannel: "Investopedia Real Estate",
    confidenceScore: 97,
    highlightTopic: "School Zones & Neighborhood Resale Value"
  }
];
