import { PropertyListing, RealEstateAgentProfile, LOPairing, LoanOfficerProfile, VantageCoBrandedAdKit, AdCampaignDraft } from "../types";
import { db } from "../firebase";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { sanitizeSSN } from "./ssnProtection";

/**
 * Normalizes an agent's name for robust cross-referencing
 */
export function normalizeName(name: string): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/[®,™]/g, "")
    .replace(/\b(realtor|broker|associate|principal|sr|senior|agent|llc|inc|real estate|team)\b/gi, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalizes phone numbers to digits only
 */
export function normalizePhone(phone?: string): string {
  if (!phone) return "";
  return phone.replace(/\D/g, "");
}

export interface ListingAgentMatchResult {
  isMatched: boolean;
  matchedAgent: RealEstateAgentProfile | null;
  matchMethod?: 'name' | 'email' | 'phone' | 'fuzzy';
  isLoAgentPair: boolean;
  pairing: LOPairing | null;
  pairedLoanOfficer: LoanOfficerProfile | null;
  coBrandSlug?: string;
  coBrandUrl?: string;
}

/**
 * Cross-references a single property listing's agent data against the master agent roster and pairings
 */
export function crossReferenceListingWithAgents(
  listing: PropertyListing,
  agentRoster: RealEstateAgentProfile[],
  pairings: LOPairing[],
  loanOfficers: LoanOfficerProfile[]
): ListingAgentMatchResult {
  const listingAgentName = listing.listingAgent?.name?.trim() || "";
  const listingAgentEmail = listing.listingAgent?.email?.trim().toLowerCase() || "";
  const listingAgentPhone = normalizePhone(listing.listingAgent?.phone);
  const listingOfficeName = (listing.listingOffice?.name || "").toLowerCase();

  let matchedAgent: RealEstateAgentProfile | null = null;
  let matchMethod: 'name' | 'email' | 'phone' | 'fuzzy' | undefined;

  if (listingAgentEmail) {
    const emailMatch = agentRoster.find(
      (a) => a.email && a.email.trim().toLowerCase() === listingAgentEmail
    );
    if (emailMatch) {
      matchedAgent = emailMatch;
      matchMethod = 'email';
    }
  }

  if (!matchedAgent && listingAgentPhone && listingAgentPhone.length >= 7) {
    const phoneMatch = agentRoster.find((a) => {
      const p = normalizePhone(a.phone);
      return p.length >= 7 && (p === listingAgentPhone || p.endsWith(listingAgentPhone.slice(-7)));
    });
    if (phoneMatch) {
      matchedAgent = phoneMatch;
      matchMethod = 'phone';
    }
  }

  if (!matchedAgent && listingAgentName) {
    const normListingName = normalizeName(listingAgentName);
    
    // Direct exact or normalized name match
    const exactMatch = agentRoster.find(
      (a) => normalizeName(a.name) === normListingName
    );
    if (exactMatch) {
      matchedAgent = exactMatch;
      matchMethod = 'name';
    } else {
      // Fuzzy / first + last token match
      const listingTokens = normListingName.split(" ").filter(t => t.length > 1);
      if (listingTokens.length >= 2) {
        const fuzzyMatch = agentRoster.find((a) => {
          const agentTokens = normalizeName(a.name).split(" ").filter(t => t.length > 1);
          const hasFirst = agentTokens.some(t => t === listingTokens[0]);
          const hasLast = agentTokens.some(t => t === listingTokens[listingTokens.length - 1]);
          return hasFirst && hasLast;
        });
        if (fuzzyMatch) {
          matchedAgent = fuzzyMatch;
          matchMethod = 'fuzzy';
        }
      }
    }
  }

  // Fallback: If office name matches very specific partner brokerage and city
  if (!matchedAgent && listingOfficeName) {
    const brokerageMatch = agentRoster.find((a) => {
      if (!a.brokerage) return false;
      const bNorm = a.brokerage.toLowerCase();
      return bNorm.includes("hybrid") && listingOfficeName.includes("hybrid") && a.name.toLowerCase().includes("jake");
    });
    if (brokerageMatch) {
      matchedAgent = brokerageMatch;
      matchMethod = 'fuzzy';
    }
  }

  if (!matchedAgent) {
    return {
      isMatched: false,
      matchedAgent: null,
      isLoAgentPair: false,
      pairing: null,
      pairedLoanOfficer: null
    };
  }

  // Check if this matched agent is an active LO + Agent pairing!
  const activePairing = pairings.find(
    (p) => p.agentId === matchedAgent!.id && p.active !== false
  );

  let pairedLo: LoanOfficerProfile | null = null;
  if (activePairing) {
    pairedLo = loanOfficers.find((lo) => lo.id === activePairing.loId) || loanOfficers[0] || null;
  } else if (matchedAgent.assignedLoIds && matchedAgent.assignedLoIds.length > 0) {
    // Check assigned LO ids
    const loId = matchedAgent.assignedLoIds[0];
    pairedLo = loanOfficers.find((lo) => lo.id === loId) || loanOfficers[0] || null;
  }

  const isLoAgentPair = Boolean(activePairing || (pairedLo && matchedAgent.assignedLoIds?.includes(pairedLo.id)));
  const customSlug = activePairing?.customSlug || (pairedLo ? `${pairedLo.id.replace('lo-', '')}-and-${matchedAgent.customSlug || matchedAgent.id.replace('agent-', '')}` : undefined);
  const coBrandUrl = customSlug ? `https://homebuyer.oregon.gov/${customSlug}` : undefined;

  return {
    isMatched: true,
    matchedAgent,
    matchMethod,
    isLoAgentPair,
    pairing: activePairing || null,
    pairedLoanOfficer: pairedLo,
    coBrandSlug: customSlug,
    coBrandUrl
  };
}

/**
 * Enriches a whole catalog of listings with cross-referenced agent and LO+Agent pairing metadata
 */
export function enrichListingsWithAgentMatches(
  listings: PropertyListing[],
  agentRoster: RealEstateAgentProfile[],
  pairings: LOPairing[],
  loanOfficers: LoanOfficerProfile[]
): PropertyListing[] {
  return listings.map((listing) => {
    const result = crossReferenceListingWithAgents(listing, agentRoster, pairings, loanOfficers);

    if (result.isMatched && result.matchedAgent) {
      const isLoPair = result.isLoAgentPair;
      const loName = result.pairedLoanOfficer?.name || "Mike Ford";
      const loId = result.pairedLoanOfficer?.id || "lo-mike-ford";
      const slug = result.coBrandSlug || `${loId.replace('lo-', '')}-and-${result.matchedAgent.customSlug || result.matchedAgent.name.toLowerCase().replace(/\s+/g, '-')}`;

      return {
        ...listing,
        isRosterAgentMatched: true,
        matchedRosterAgent: {
          id: result.matchedAgent.id,
          name: result.matchedAgent.name,
          brokerage: result.matchedAgent.brokerage,
          headshotUrl: result.matchedAgent.headshotUrl,
          email: result.matchedAgent.email,
          phone: result.matchedAgent.phone,
          licenseNumber: result.matchedAgent.licenseNumber,
          matchMethod: result.matchMethod
        },
        isLoAgentPair: isLoPair,
        loPairing: isLoPair ? {
          id: result.pairing?.id || `pair-${loId}-${result.matchedAgent.id}`,
          title: result.pairing?.title || `${loName} + ${result.matchedAgent.name} Co-Branded Team`,
          loId,
          loName,
          agentId: result.matchedAgent.id,
          agentName: result.matchedAgent.name,
          customSlug: slug,
          campaignTag: result.pairing?.campaignTag || "fthb-cobranded-pair"
        } : undefined,
        // If it's an LO+Agent pair, mark status as queued or ready
        vantageAdsEngineStatus: listing.vantageAdsEngineStatus || (isLoPair ? 'queued' : 'idle')
      };
    }

    return {
      ...listing,
      isRosterAgentMatched: false,
      matchedRosterAgent: undefined,
      isLoAgentPair: false,
      loPairing: undefined
    };
  });
}

/**
 * Generates ready-to-use co-branded ad copy scripts and video storyboards for Corporate Marketing / LOA peers
 */
export function generateVantageCoBrandedAdKit(
  listing: PropertyListing,
  loanOfficer: LoanOfficerProfile,
  agent: RealEstateAgentProfile,
  pairing?: LOPairing | null
): VantageCoBrandedAdKit {
  const priceFormatted = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(listing.price);
  const city = listing.city || "Oregon";
  const slug = pairing?.customSlug || `${loanOfficer.id.replace('lo-', '')}-and-${agent.customSlug || agent.name.toLowerCase().replace(/\s+/g, '-')}`;
  const coBrandUrl = `https://homebuyer.oregon.gov/${slug}?property=${encodeURIComponent(listing.address)}`;

  const isUsda = Boolean(listing.overlayEligibility?.usdaEligible || listing.isUsdaEligible);
  const isOhcs = Boolean(listing.overlayEligibility?.firstHomeEligible || listing.isOhcsEligible);

  const financingAngle = isUsda
    ? "100% USDA Zero-Down Financing (No Down Payment Required)"
    : isOhcs
    ? "OHCS Down Payment Assistance & 3.5% First-Time Buyer Grant Eligible"
    : "3% Down Conventional or 3.5% FHA with Seller Closing Cost Credits";

  // Meta / Facebook Ad Copy
  const metaHeadline = `🌲 Oregon Homebuyer Spotlight: ${listing.address} in ${city} (${priceFormatted})`;
  const metaHook = `Stop paying $2,200+/mo to your landlord when you could own this ${listing.beds || 3}-bedroom ${city} home with ${isUsda ? "0% DOWN" : "DOWN PAYMENT GRANTS"}! 🔑`;
  const metaPrimary = `${metaHook}\n\nCo-Listed & Co-Financed by ${agent.name} (${agent.brokerage}) & ${loanOfficer.name} (Cornerstone First Mortgage, ${loanOfficer.nmlsNumber || 'NMLS #288455'}).\n\n🏡 Property Features:\n• List Price: ${priceFormatted}\n• Specs: ${listing.beds || 3} Beds • ${listing.baths || 2} Baths • ${listing.sqft || 'Spacious'} SqFt\n• Financing Status: ${financingAngle}\n• Est. Monthly Savings: Owning costs less than average local rent.\n\n📲 Tap below to calculate your exact monthly payment, check zero-down grant eligibility, and schedule a private VIP tour with ${agent.name.split(' ')[0]} and ${loanOfficer.name.split(' ')[0]}!`;
  const metaDescription = `Verified Co-Branded Home Tour & Financing Portal • ${loanOfficer.nmlsNumber || 'NMLS #288455'} • ${agent.licenseNumber || 'OR RE License'}`;

  // Google Ads
  const googleAd = {
    headlines: [
      `Homes in ${city} ${priceFormatted}`.slice(0, 30),
      `${isUsda ? "0% Down USDA Loan" : "Oregon First-Time Buyer Grants"}`.slice(0, 30),
      `${agent.name.split(' ')[0]} & ${loanOfficer.name.split(' ')[0]} Co-Branded`.slice(0, 30),
      `Tour ${listing.address.slice(0, 18)}`.slice(0, 30)
    ],
    descriptions: [
      `Own this ${listing.beds || 3}-bed ${city} home with ${financingAngle}. Instant pre-qual check.`.slice(0, 90),
      `Partnered with ${agent.name} & ${loanOfficer.name}. Free buyer guide & payment calculator.`.slice(0, 90)
    ],
    sitelinks: [
      { title: "Down Payment Grant Check", url: `${coBrandUrl}#grants` },
      { title: "Schedule Private Tour", url: `${coBrandUrl}#tour` },
      { title: "Instant Mortgage Calc", url: `${coBrandUrl}#calc` }
    ],
    finalUrl: coBrandUrl
  };

  // Video Script & Storyboard for TikTok / Instagram Reels / YouTube Shorts (30s)
  const videoScript = {
    hook: `If you live in ${city} and you're paying rent, you need to see this house before it sells.`,
    estimatedSeconds: 30,
    scenes: [
      {
        sceneNumber: 1,
        durationSec: 8,
        visual: `High-energy drone/exterior establishing shot of ${listing.address} with bold neon lower-third: "0% DOWN IN ${city.toUpperCase()}?!"`,
        narration: `Did you know this 3-bedroom home in ${city} listed at ${priceFormatted} qualifies for 100% USDA Zero-Down financing?`,
        onScreenText: `📍 ${listing.address}, ${city}\n${priceFormatted} • 0% DOWN ELIGIBLE`
      },
      {
        sceneNumber: 2,
        durationSec: 12,
        visual: `Fast-cut interior walkthrough: designer kitchen, spacious primary suite, and backyard. Split-screen graphic showing $2,200 Rent vs. $1,980 Mortgage Payment.`,
        narration: `Average rent in Oregon is through the roof. But local Realtor ${agent.name} and Senior Loan Officer ${loanOfficer.name} teamed up to show you how to buy with zero out-of-pocket cash!`,
        onScreenText: `Owning vs Renting Breakdown\nCo-Branded Team: ${agent.name} & ${loanOfficer.name}`
      },
      {
        sceneNumber: 3,
        durationSec: 10,
        visual: `Co-branded end-card showing headshots of ${loanOfficer.name} & ${agent.name}, their licensing disclaimers, and animated pulsing "Tap Link to Pre-Qualify" button.`,
        narration: `Tap the link on our profile right now to see your instant monthly payment and book your private tour with ${agent.name.split(' ')[0]} and ${loanOfficer.name.split(' ')[0]}. Don't wait!`,
        onScreenText: `🔗 ${slug}\nCheck Your Eligibility in 60 Seconds!`
      }
    ],
    videoUrl: listing.imageUrl || "https://vjs.zencdn.net/v/oceans.mp4",
    captionText: `Stop renting in ${city}! 🌲✨ This gorgeous property at ${listing.address} is eligible for special zero-down programs with @${agent.name.toLowerCase().replace(/\s+/g, '')} and @${loanOfficer.name.toLowerCase().replace(/\s+/g, '')}. Tap the link in bio for full tour & payment breakdown!`,
    hashtags: [
      `#${city.replace(/\s+/g, '')}Homes`,
      "#OregonRealEstate",
      "#FirstTimeHomebuyer",
      "#ZeroDownLoan",
      "#USDALoan",
      "#MortgageTips",
      `#${agent.name.replace(/\s+/g, '')}`,
      `#${loanOfficer.name.replace(/\s+/g, '')}`
    ]
  };

  return {
    id: `vantage-kit-${listing.id}-${Date.now()}`,
    propertyId: listing.id,
    propertyAddress: listing.address,
    propertyCity: city,
    propertyPrice: listing.price,
    beds: listing.beds,
    baths: listing.baths,
    sqft: listing.sqft,
    imageUrl: listing.imageUrl,
    loId: loanOfficer.id,
    loName: loanOfficer.name,
    loNmls: loanOfficer.nmlsNumber || "NMLS #288455",
    loPhone: loanOfficer.phone || "(503) 555-0199",
    loHeadshotUrl: loanOfficer.headshotUrl || "",
    agentId: agent.id,
    agentName: agent.name,
    agentBrokerage: agent.brokerage,
    agentLicense: agent.licenseNumber || "OR RE Lic",
    agentPhone: agent.phone || "(541) 555-0188",
    agentHeadshotUrl: agent.headshotUrl || "",
    pairingId: pairing?.id || `pair-${loanOfficer.id}-${agent.id}`,
    coBrandSlug: slug,
    coBrandUrl,
    metaAd: {
      headline: metaHeadline,
      hook: metaHook,
      primaryText: metaPrimary,
      description: metaDescription,
      cta: "Learn More / Check Eligibility",
      targetUrl: coBrandUrl
    },
    googleAd,
    videoScript,
    queueStatus: 'queued_for_mktg',
    assignedRole: 'mktg_ads_creator',
    createdByRole: 'GeoSphere Listing Auto-Cross-Reference',
    timestamp: new Date().toISOString()
  };
}

/**
 * Pushes a co-branded listing into the local and cross-project Vantage AI Ads Engine Queue
 */
export async function pushCoBrandedListingToVantageQueue(
  listing: PropertyListing,
  loanOfficer: LoanOfficerProfile,
  agent: RealEstateAgentProfile,
  pairing?: LOPairing | null
): Promise<VantageCoBrandedAdKit> {
  const kit = generateVantageCoBrandedAdKit(listing, loanOfficer, agent, pairing);

  // Store in browser storage queue for immediate multi-role employee peer access
  try {
    const existingRaw = localStorage.getItem("vantage_ai_ads_queue_v1");
    const existing: VantageCoBrandedAdKit[] = existingRaw ? JSON.parse(existingRaw) : [];
    const filtered = existing.filter((k) => k.propertyId !== listing.id);
    const updated = [kit, ...filtered];
    localStorage.setItem("vantage_ai_ads_queue_v1", JSON.stringify(updated));

    // Dispatch window event for synchronous UI reactivity
    window.dispatchEvent(new CustomEvent("vantage_ads_queue_updated", { detail: kit }));
  } catch (e) {
    console.warn("Error storing in local ads queue:", e);
  }

  // Also trigger external webhook if available
  try {
    fetch("/api/webhooks/ads-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: kit.metaAd.headline,
        adCopy: kit.metaAd.primaryText,
        videoUrl: kit.videoScript.videoUrl,
        platformTarget: "Meta & Google Ads",
        campaignGoal: "Co-Branded First-Time Homebuyer Lead Gen",
        status: "Draft Ready for Review",
        loId: loanOfficer.id,
        propertyId: listing.id
      })
    }).catch((err) => console.warn("Webhook push caught:", err));
  } catch (err) {
    console.warn("Async webhook trigger warning:", err);
  }

  return kit;
}

/**
 * Completes the ad creation by MKTG Dept or LOA peer and syncs it back to First-Time Homebuyer AI Ads Portal
 */
export async function syncCompletedAdKitToFthbPortal(
  kit: VantageCoBrandedAdKit,
  completedByRole: string,
  completedByName: string
): Promise<AdCampaignDraft> {
  const updatedKit: VantageCoBrandedAdKit = {
    ...kit,
    queueStatus: 'synced_to_ads_portal',
    completedBy: `${completedByName} (${completedByRole})`,
    completedAt: new Date().toISOString()
  };

  // Update local queue storage
  try {
    const raw = localStorage.getItem("vantage_ai_ads_queue_v1");
    if (raw) {
      const list: VantageCoBrandedAdKit[] = JSON.parse(raw);
      const updated = list.map((k) => (k.id === kit.id ? updatedKit : k));
      localStorage.setItem("vantage_ai_ads_queue_v1", JSON.stringify(updated));
    }
  } catch (e) {
    console.warn("Error updating local queue item:", e);
  }

  // Create an AdCampaignDraft object ready for Loan Officer to launch
  const draft = createDraftAdFromCoBrandedKit(updatedKit, 'ready_to_launch');

  // Store in synced campaigns
  try {
    const syncedRaw = localStorage.getItem("fthb_synced_portal_ads_v1");
    const syncedList = syncedRaw ? JSON.parse(syncedRaw) : [];
    localStorage.setItem("fthb_synced_portal_ads_v1", JSON.stringify([draft, ...syncedList]));

    // Also persist to Firestore if user is authenticated
    const adsRef = doc(collection(doc(db, "users", kit.loId), "synced_ai_ads"));
    await setDoc(adsRef, {
      title: draft.campaignName,
      adCopy: draft.primaryText,
      videoUrl: kit.videoScript.videoUrl || "",
      platformTarget: "Facebook Ads & Google Ads",
      campaignGoal: "First-Time Homebuyer Acquisition",
      status: "Approved - Ready to Launch",
      propertyId: kit.propertyId,
      timestamp: serverTimestamp(),
      source: `Vantage AI Ads Engine (${completedByRole})`
    }).catch(e => console.warn("Firestore sync optional warning:", e));

    window.dispatchEvent(new CustomEvent("vantage_ad_synced_to_portal", { detail: { kit: updatedKit, draft } }));
  } catch (e) {
    console.warn("Error writing to Firestore/portal ads:", e);
  }

  return draft;
}

/**
 * Builds a pre-filled AdCampaignDraft from a VantageCoBrandedAdKit
 * Pre-populating headlines, multi-platform copy, targeting, keywords, and co-branded landing page
 */
export function createDraftAdFromCoBrandedKit(
  kit: VantageCoBrandedAdKit,
  status: 'draft' | 'ready_to_launch' = 'draft'
): AdCampaignDraft {
  return {
    id: `draft-${kit.propertyId}`,
    platform: 'meta',
    loId: kit.loId,
    agentId: kit.agentId,
    campaignName: sanitizeSSN(`[Co-Branded] ${kit.agentName} + ${kit.loName}: ${kit.propertyAddress}`),
    headline: sanitizeSSN(kit.metaAd.headline),
    secondaryHeadlines: kit.googleAd.headlines.map(sanitizeSSN),
    primaryText: sanitizeSSN(kit.metaAd.primaryText),
    descriptionText: sanitizeSSN(kit.metaAd.description),
    targetUrl: kit.coBrandUrl,
    dailyBudget: 25,
    targetLocations: [sanitizeSSN(kit.propertyCity), "Oregon"],
    isCompliancePaused: false,
    leadCap: 50,
    currentLeads: 0,
    keywords: [`${sanitizeSSN(kit.propertyCity)} real estate`, "USDA loan Oregon", "first time homebuyer grants"],
    specialHousingCategory: true,
    adObjective: 'LEAD_GENERATION',
    status,
    lastSaved: new Date().toISOString(),
    propertyId: kit.propertyId,
    propertyAddress: sanitizeSSN(kit.propertyAddress),
    propertyCity: sanitizeSSN(kit.propertyCity),
    propertyPrice: kit.propertyPrice,
    isVantageCurated: true,
    isNewAwaitingPublication: true,
    publishedChannels: []
  };
}

/**
 * Generates a co-branded Vantage AI Ad Kit triggered directly from a GeoSphere physical map touch or Census tract touch
 */
export function generateSpatialVantageAdKit(
  spatialData: {
    censusTract: string;
    city: string;
    isUsda: boolean;
    isLmi: boolean;
    listing?: PropertyListing;
  },
  loanOfficer: LoanOfficerProfile,
  agent: RealEstateAgentProfile,
  pairing?: LOPairing | null
): VantageCoBrandedAdKit {
  const city = sanitizeSSN(spatialData.city || "Oregon");
  const tract = sanitizeSSN(spatialData.censusTract);
  const address = sanitizeSSN(spatialData.listing?.address || `${city} Targeted Area`);
  const price = spatialData.listing?.price ? `$${spatialData.listing.price.toLocaleString()}` : "Market Price";
  
  const angle = spatialData.isUsda
    ? "100% USDA Zero-Down Eligible"
    : spatialData.isLmi
    ? "Up to $15K Down Payment Assistance Eligible"
    : "3% Down Conventional or FHA with Seller Credits";

  const slug = pairing?.customSlug || `${loanOfficer.id.replace("lo-", "")}-and-${agent.name.toLowerCase().replace(/\s+/g, "-")}`;
  const coBrandUrl = `https://homebuyer.oregon.gov/${slug}?tract=${encodeURIComponent(tract)}`;

  const kit: VantageCoBrandedAdKit = {
    id: `vantage-spatial-${Date.now()}`,
    propertyId: spatialData.listing?.id || `tract-${tract}`,
    propertyAddress: address,
    propertyCity: city,
    propertyPrice: spatialData.listing?.price || 425000,
    agentId: agent.id,
    agentName: agent.name,
    agentBrokerage: agent.brokerage,
    loId: loanOfficer.id,
    loName: loanOfficer.name,
    coBrandSlug: slug,
    coBrandUrl: coBrandUrl,
    generatedAt: new Date().toISOString(),
    queueStatus: "pending_review",
    status: "Draft Ready for Review",
    metaAd: {
      headline: sanitizeSSN(`🌲 Stop Renting in ${city}! ${angle} (${price}, Tract ${tract})`),
      primaryText: sanitizeSSN(`Did you know homes in ${city} (Census Tract ${tract}) qualify for ${angle}? Partnered with ${agent.name} (${agent.brokerage}) and ${loanOfficer.name} (NMLS #${loanOfficer.nmlsNumber || '288455'}). Tap below to see active listings and calculate your exact monthly payment!`),
      callToAction: "Learn More",
      destinationUrl: coBrandUrl,
      description: sanitizeSSN(`Verified First-Time Buyer Program • ${agent.name} & ${loanOfficer.name}`)
    },
    googleAd: {
      headlines: [
        sanitizeSSN(`Homes in ${city} with ${angle.slice(0, 15)}`).slice(0, 30),
        sanitizeSSN(`0% Down & Grants in ${city}`).slice(0, 30),
        sanitizeSSN(`${agent.name.split(" ")[0]} & ${loanOfficer.name.split(" ")[0]} Team`).slice(0, 30)
      ],
      descriptions: [
        sanitizeSSN(`Tract ${tract} qualifying homes. Instant pre-qualification check and private tour booking.`).slice(0, 90),
        sanitizeSSN(`Stop renting and buy in ${city} with special first-time homebuyer assistance programs.`).slice(0, 90)
      ],
      finalUrl: coBrandUrl,
      sitelinks: [
        { title: "Check Grant Eligibility", url: `${coBrandUrl}#grants` },
        { title: "Browse Map Listings", url: `${coBrandUrl}#map` }
      ]
    },
    videoScript: {
      hook: sanitizeSSN(`If you're paying rent anywhere in ${city}, you need to see this map overlay right now.`),
      estimatedSeconds: 30,
      scenes: [
        {
          sceneNumber: 1,
          durationSec: 8,
          visual: `Aerial map zoom into Census Tract ${tract} in ${city} with glowing badge: "${angle}"`,
          narration: `Did you know this specific pocket of ${city} qualifies for ${angle}?`,
          onScreenText: `📍 ${city} • Tract ${tract}\n${angle}`
        },
        {
          sceneNumber: 2,
          durationSec: 12,
          visual: `Split screen showing local rent costs ($2,200/mo) vs owning ($1,950/mo with DPA grants).`,
          narration: `While rents continue rising, local agent ${agent.name} and lender ${loanOfficer.name} can show you how to buy with little to no money down.`,
          onScreenText: `Owning vs Renting in ${city}\nCo-Branded Portal: ${agent.name} & ${loanOfficer.name}`
        },
        {
          sceneNumber: 3,
          durationSec: 10,
          visual: `Call to action end card with agent/LO headshots, NMLS disclosure, and button.`,
          narration: `Tap the link to explore our interactive map and see every eligible home today!`,
          onScreenText: `🔗 ${slug}\nCheck Your Eligibility in 60 Seconds!`
        }
      ]
    }
  };

  // Push directly to localStorage and trigger queue update
  try {
    const raw = localStorage.getItem("vantage_ai_ads_queue_v1");
    const queue = raw ? JSON.parse(raw) : [];
    localStorage.setItem("vantage_ai_ads_queue_v1", JSON.stringify([kit, ...queue]));
    window.dispatchEvent(new CustomEvent("vantage_ads_queue_updated", { detail: kit }));
  } catch (err) {
    console.warn("Could not save to local ads queue:", err);
  }

  return kit;
}
