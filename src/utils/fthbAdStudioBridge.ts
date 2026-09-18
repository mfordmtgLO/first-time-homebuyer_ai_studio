import { 
  PropertyListing, 
  LoanOfficerProfile, 
  RealEstateAgentProfile, 
  ProfessionalGuidesState, 
  AdCampaignDraft,
  VantageCoBrandedAdKit
} from "../types";
import { formatUSD } from "./mortgageMath";
import { pushCoBrandedListingToVantageQueue } from "./agentListingCrossReference";

export interface BuyerFinancials {
  householdIncome: number;
  householdSize: number;
  borrowerIncome: number;
  monthlyDebt: number;
  targetDti: number;
}

export interface FthbPropertyEval {
  county: string;
  usdaQualifies: boolean;
  lakeviewQualifies: boolean;
  ohcsQualifies: boolean;
  stackedQualifies: boolean;
  usdaLimit: number;
  lakeviewLimit: number;
  ohcsPriceLimit: number;
  isLmiArea: boolean;
  estimatedMonthlyPayment: number;
  rentcastEstRent: number;
  monthlyRentSavings: number;
  buyerDtiPct: number;
  dtiStatus: 'pass' | 'caution' | 'fail';
  maxAllowableBudget: number;

  // Detailed USDA calculation metadata
  usdaHouseholdIncome: number;
  usdaHouseholdSize: number;
  usdaIsRuralArea: boolean;
  usdaZoneName?: string;
  usdaHeadroom: number;
  usdaReason: string;

  // Detailed OHCS calculation & census tract metadata
  ohcsCensusTract: string;
  ohcsIsTargeted: boolean;
  ohcsLmiPercentage?: number;
  ohcsLmiEligible: boolean;
  ohcsApplicablePriceLimit: number;
  ohcsNonTargetedLimit: number;
  ohcsTargetedLimit: number;
  ohcsHeadroom: number;
  ohcsReason: string;
  ohcsDpaGrantAmount: number;

  // Detailed Lakeview calculation metadata
  borrowerIncomeUsed?: number;
  lakeviewHeadroom?: number;
  lakeviewReason?: string;
}

export interface FthbVantageAdPackage {
  id: string;
  listing: PropertyListing;
  eval: FthbPropertyEval;
  buyerFinancials: BuyerFinancials;
  
  // Persistent Moniker
  persistentMoniker: string;
  shortTag: string;
  financingAngle: string;
  downPaymentBadge: string;
  grantBadge: string;
  programType: 'usda' | 'ohcs' | 'lakeview' | 'stacked' | 'standard';

  // Co-Brand Parties
  loanOfficer: {
    id: string;
    name: string;
    company: string;
    nmls: string;
    phone: string;
    email: string;
  };
  agent: {
    id: string;
    name: string;
    brokerage: string;
    license: string;
    phone: string;
    email: string;
  };

  // Meta & Google Ad Creative
  metaHeadline: string;
  metaHook: string;
  metaPrimaryText: string;
  googleHeadlines: string[];
  googleDescriptions: string[];

  // 9:16 Video Storyboard (TikTok / Reels / YouTube Shorts)
  videoStoryboard: {
    hook: string;
    totalSeconds: number;
    scenes: {
      sceneNumber: number;
      durationSec: number;
      visual: string;
      narration: string;
      onScreenText: string;
    }[];
    caption: string;
    hashtags: string[];
  };

  // Vantage AI Ad Brain Boost & Prompt Suggestions
  adBrainStrategy: string;
  aiRecommendations: string[];
  promptSuggestions: {
    metaLeadGenPrompt: string;
    videoReelsPrompt: string;
    googlePmaxPrompt: string;
  };

  // Outreach Templates
  smsOutreach: string;
  emailOutreach: {
    subject: string;
    body: string;
  };

  // Ready-to-commit AdKit & Draft
  adKit: VantageCoBrandedAdKit;
  draft: AdCampaignDraft;
}

/**
 * Derives the persistent First-Time Homebuyer Low or No Down Payment moniker
 */
export function derivePersistentMoniker(evalData: {
  usdaQualifies: boolean;
  ohcsQualifies: boolean;
  lakeviewQualifies: boolean;
  price: number;
  city: string;
}): {
  persistentMoniker: string;
  shortTag: string;
  financingAngle: string;
  downPaymentBadge: string;
  grantBadge: string;
  programType: 'usda' | 'ohcs' | 'lakeview' | 'stacked' | 'standard';
} {
  const matchesCount = (evalData.usdaQualifies ? 1 : 0) + 
                       (evalData.ohcsQualifies ? 1 : 0) + 
                       (evalData.lakeviewQualifies ? 1 : 0);

  if (matchesCount >= 2) {
    return {
      persistentMoniker: "STACKED BENEFIT: ZERO OR LOW DOWN PAYMENT + CASH DPA GRANT",
      shortTag: "ZERO/LOW DOWN (STACKED BENEFITS)",
      financingAngle: "Stacked 100% Zero-Down USDA or OHCS $15,000 Cash Grant with 2-1 Rate Buydown",
      downPaymentBadge: "$0 Down or 3.5% DPA Grant",
      grantBadge: "Up to $15,000 Forgivable State Grant",
      programType: 'stacked'
    };
  }

  if (evalData.usdaQualifies) {
    return {
      persistentMoniker: "100% ZERO DOWN PAYMENT GUARANTEED (USDA RURAL FINANCING)",
      shortTag: "ZERO DOWN PAYMENT (USDA RD)",
      financingAngle: "100% USDA Zero-Down Financing ($0 Down Payment Required)",
      downPaymentBadge: "$0 Down Payment (100% Financing)",
      grantBadge: "No Private Mortgage Insurance (PMI)",
      programType: 'usda'
    };
  }

  if (evalData.ohcsQualifies) {
    return {
      persistentMoniker: "LOW DOWN PAYMENT: $15,000 OHCS CASH DPA GRANT & 3.5% DOWN",
      shortTag: "LOW DOWN (OHCS FIRSTHOME)",
      financingAngle: "OHCS FirstHome Cash Grant Assistance & Down Payment Grant Match",
      downPaymentBadge: "3.5% Down (Grant Covered)",
      grantBadge: "$15,000 State Down Payment Grant",
      programType: 'ohcs'
    };
  }

  if (evalData.lakeviewQualifies) {
    return {
      persistentMoniker: "LOW DOWN PAYMENT: 140% AMI LAKEVIEW NO-FIRST-TIME-RESTRICTION DPA",
      shortTag: "LOW DOWN (LAKEVIEW 140% AMI)",
      financingAngle: "Lakeview National 140% AMI Assistance (No First-Time Buyer Requirement)",
      downPaymentBadge: "3% - 3.5% Down Payment",
      grantBadge: "Up to 5% Second Mortgage DPA",
      programType: 'lakeview'
    };
  }

  return {
    persistentMoniker: "FIRST-TIME HOMEBUYER AFFORDABLE FINANCING (LOW DOWN PAYMENT)",
    shortTag: "LOW DOWN PAYMENT (CONV/FHA)",
    financingAngle: "3% Down Conventional or 3.5% FHA with Seller Concessions",
    downPaymentBadge: "3% - 3.5% Down Payment",
    grantBadge: "Up to 3% Seller Concession Credits",
    programType: 'standard'
  };
}

/**
 * Builds a complete Vantage AI Ad Package with persistent low/no down payment moniker,
 * RentCast comps, DTI financial stacking, agent co-branding, AI prompts, and outreach templates.
 */
export function buildFthbVantageAdPackage(
  listing: PropertyListing,
  evalData: FthbPropertyEval,
  buyerFinancials: BuyerFinancials,
  loanOfficer?: LoanOfficerProfile,
  agent?: RealEstateAgentProfile
): FthbVantageAdPackage {
  const currentLo = loanOfficer || {
    id: "lo-dan-green",
    name: "Dan Green",
    company: "Cornerstone First Mortgage",
    nmls: "NMLS #288455",
    phone: "(541) 729-0819",
    email: "mford@cfmtg.com"
  };

  const currentAgent = agent || listing.matchedRosterAgent || {
    id: "agent-jake-zach",
    name: "Jake Zach",
    brokerage: "Hybrid Real Estate",
    license: "OR RE Lic #201214890",
    phone: "(541) 555-0188",
    email: "jake@hybridre.com"
  };

  const { persistentMoniker, shortTag, financingAngle, downPaymentBadge, grantBadge, programType } = 
    derivePersistentMoniker({
      usdaQualifies: evalData.usdaQualifies,
      ohcsQualifies: evalData.ohcsQualifies,
      lakeviewQualifies: evalData.lakeviewQualifies,
      price: listing.price,
      city: listing.city
    });

  const city = listing.city || "Oregon";
  const priceFormatted = formatUSD(listing.price);
  const estRentFormatted = formatUSD(evalData.rentcastEstRent);
  const monthlyPayFormatted = formatUSD(evalData.estimatedMonthlyPayment);

  // Meta / Facebook Ad Creative
  const metaHeadline = `🌲 ${city} Homebuyer Alert: ${persistentMoniker}!`;
  const metaHook = `Tired of paying ${estRentFormatted}/mo in rent to your landlord when you could own this ${listing.beds || 3}-bed ${city} home for around ${monthlyPayFormatted}/mo with ${downPaymentBadge}? 🔑✨`;
  
  const metaPrimaryText = `${metaHook}

🏡 PROPERTY SPOTLIGHT: ${listing.address}, ${city}, OR ${listing.zip || ''}
• List Price: ${priceFormatted} (${listing.beds || 3} Beds • ${listing.baths || 2} Baths • ${listing.sqft || 1600} SqFt)
• Persistent FTHB Financing: ${financingAngle}
• RentCast Market Analysis: Average rent in ${city} is ${estRentFormatted}/mo. Owning builds equity every month!
• Down Payment Status: ${downPaymentBadge} • ${grantBadge}

🤝 CO-BRANDED VERIFIED ADVISORY TEAM:
• Senior Mortgage Advisor: ${currentLo.name} (${currentLo.company || 'Cornerstone First Mortgage'}, ${currentLo.nmls || 'NMLS #288455'})
• Licensed Real Estate Specialist: ${currentAgent.name} (${currentAgent.brokerage || 'Partner Brokerage'}, ${currentAgent.license || 'OR License'})

📲 Tap 'Learn More' below to calculate your exact monthly payment, verify zero-down grant qualification in 60 seconds, and schedule your private VIP tour with ${currentAgent.name.split(' ')[0]} and ${currentLo.name.split(' ')[0]}!`;

  // Google Performance Max Search Ads
  const googleHeadlines = [
    `${city} ${shortTag}`.slice(0, 30),
    `${city} Homes ${priceFormatted}`.slice(0, 30),
    `Buy With ${downPaymentBadge.split('(')[0]}`.slice(0, 30),
    `${currentAgent.name.split(' ')[0]} & ${currentLo.name.split(' ')[0]} Co-Branded`.slice(0, 30)
  ];

  const googleDescriptions = [
    `Own ${listing.address} in ${city} with ${financingAngle}. Instant pre-qualification.`.slice(0, 90),
    `Stop renting at ${estRentFormatted}/mo. Check zero-down DPA grant eligibility in 60s.`.slice(0, 90)
  ];

  // 9:16 Video Storyboard (TikTok / Instagram Reels / YouTube Shorts)
  const videoStoryboard = {
    hook: `If you're paying rent anywhere near ${city}, watch this before you sign your next lease!`,
    totalSeconds: 30,
    scenes: [
      {
        sceneNumber: 1,
        durationSec: 8,
        visual: `High-energy exterior drone or front walkthrough of ${listing.address}. Bold on-screen lower-third with neon badge: "${persistentMoniker}".`,
        narration: `Did you know this 3-bedroom home in ${city} listed at ${priceFormatted} qualifies for ${financingAngle}?`,
        onScreenText: `📍 ${listing.address}, ${city}\n${priceFormatted}\n🚨 ${persistentMoniker}`
      },
      {
        sceneNumber: 2,
        durationSec: 12,
        visual: `Fast interior cut (kitchen, living room, primary bedroom). Split graphic on right: RentCast Average Rent ${estRentFormatted}/mo VS Estimated Homeowner Payment ${monthlyPayFormatted}/mo.`,
        narration: `Rents in ${city} average ${estRentFormatted} a month with zero equity. But Realtor ${currentAgent.name} and Loan Officer ${currentLo.name} teamed up to show you how to buy with ${downPaymentBadge}!`,
        onScreenText: `RentCast Comp: ${estRentFormatted}/mo\nOwning Payment: ${monthlyPayFormatted}/mo\nBenefit: ${grantBadge}`
      },
      {
        sceneNumber: 3,
        durationSec: 10,
        visual: `Co-branded end-card showing smiling portraits of ${currentLo.name} & ${currentAgent.name}, NMLS / Brokerage disclaimers, and a pulsing "Check Grant Eligibility" tap target.`,
        narration: `Tap the link on our profile right now to see your instant monthly payment breakdown and book a private tour with us. Don't wait!`,
        onScreenText: `Co-Branded Team:\n${currentAgent.name} & ${currentLo.name}\nTap Link in Bio to Check Eligibility!`
      }
    ],
    caption: `Stop renting in ${city}! 🌲✨ This property at ${listing.address} qualifies for ${persistentMoniker}. Co-branded with @${currentAgent.name.toLowerCase().replace(/\s+/g, '')} and @${currentLo.name.toLowerCase().replace(/\s+/g, '')}. Tap link in bio for full payment breakdown & tour!`,
    hashtags: [
      `#${city.replace(/[^a-zA-Z]/g, '')}RealEstate`,
      "#OregonHomebuyer",
      "#FirstTimeHomebuyer",
      "#ZeroDownPayment",
      "#DownPaymentAssistance",
      "#RentVsOwn",
      "#USDAHomeLoan",
      `#${currentAgent.name.replace(/[^a-zA-Z]/g, '')}`,
      `#${currentLo.name.replace(/[^a-zA-Z]/g, '')}`
    ]
  };

  // Vantage AI Ad Brain Strategy & Prompt Engineering Boost
  const adBrainStrategy = `Vantage AI Ad Brain Strategy for ${city} (${evalData.county} County):
• Target Demographic: Renters aged 24-42 within a 15-mile radius currently spending $1,800–$2,600/month.
• Persistent Angle: Keep "${persistentMoniker}" front-and-center. Emphasize that saving a 20% down payment is NOT required to buy this home.
• Financial Synergies: Buyer household income of ${formatUSD(buyerFinancials.householdIncome)} comfortably fits within the ${evalData.county} County limits, supporting a safe qualifying DTI of ${evalData.buyerDtiPct}%.
• RentCast Leverage: Local market rent of ${estRentFormatted}/mo provides a compelling rent-vs-own comparison showing immediate equity accumulation.`;

  const aiRecommendations = [
    `Launch Meta Campaign with Objective: LEAD_GENERATION using instant lead forms pre-filled with phone & email.`,
    `Highlight the persistent "${shortTag}" headline to achieve sub-$8 cost per qualified first-time buyer lead.`,
    `Co-Brand with ${currentAgent.name} (${currentAgent.brokerage}) under RESPA Safe Harbor (Equal 50/50 cost & visual prominence).`,
    `Pair with automated 60-second SMS and Outlook email outreach to convert inquiries into weekend VIP tour bookings.`
  ];

  const promptSuggestions = {
    metaLeadGenPrompt: `Act as Vantage AI Ad Studio. Generate 3 high-converting Meta (Facebook & Instagram) ad variants for first-time homebuyers in ${city}, Oregon.
Property: ${listing.address} listed at ${priceFormatted}.
Persistent Theme: "${persistentMoniker}".
Financing: ${financingAngle} with ${grantBadge}.
RentCast Benchmark: Landlords in ${city} are charging ${estRentFormatted}/mo for similar homes.
Call to Action: Tap below to calculate payments and claim down payment assistance. Include co-branded mentions for ${currentAgent.name} (${currentAgent.brokerage}) and ${currentLo.name} (${currentLo.company}, ${currentLo.nmls}).`,

    videoReelsPrompt: `You are an expert real estate content producer for TikTok and Instagram Reels. Write a punchy 30-second script for a video tour of ${listing.address} in ${city}.
Hook (0-5s): Stop renters in their tracks with the fact that they can purchase this house with ${downPaymentBadge}.
Body (5-20s): Walk through the home highlighting features, juxtaposed against a RentCast comparison showing ${estRentFormatted}/mo rent vs ${monthlyPayFormatted}/mo ownership.
CTA (20-30s): Drive viewers to the link in bio for a free payment worksheet with co-branded team ${currentAgent.name} and ${currentLo.name}.`,

    googlePmaxPrompt: `Create a Google Performance Max responsive search campaign asset group targeting "${city} homes for sale" and "Oregon first time homebuyer grants".
Include 15 headlines under 30 characters and 4 descriptions under 90 characters that strictly incorporate:
1) "${shortTag}"
2) Price: ${priceFormatted}
3) Co-branding: ${currentAgent.name.split(' ')[0]} & ${currentLo.name.split(' ')[0]}
4) Sitelinks for: Instant Payment Calculator, Down Payment Grant Checker, Schedule Private Tour.`
  };

  // Outreach Templates
  const smsOutreach = `Hi [Buyer Name]! Great news from ${currentAgent.name} (${currentAgent.brokerage}) and ${currentLo.name} (${currentLo.company}): This gorgeous home at ${listing.address} in ${city} just verified for ${persistentMoniker}! You can buy with little to no cash out of pocket. Check your exact monthly payment breakdown here: https://cfmtg.com/mford/tour/${listing.id} — would you like to schedule a private VIP tour this Saturday?`;

  const emailOutreach = {
    subject: `Co-Branded FTHB Opportunity: ${listing.address}, ${city} (${persistentMoniker})`,
    body: `Hi [Buyer Name],

${currentAgent.name} and I just completed a priority financing analysis on ${listing.address} in ${city}, listed at ${priceFormatted}.

We have verified that this property qualifies for special first-time homebuyer financing advantages:

💡 FINANCING & DOWN PAYMENT HIGHLIGHTS:
• Program Category: ${persistentMoniker}
• Financing Angle: ${financingAngle}
• Down Payment Required: ${downPaymentBadge}
• Available Grants/Credits: ${grantBadge}
• RentCast Market Analysis: Average rent in ${city} is ${estRentFormatted}/mo. Owning this home costs approximately ${monthlyPayFormatted}/mo, letting you build wealth instead of paying a landlord!

🤝 YOUR DEDICATED CO-BRANDED TEAM:
• Senior Mortgage Advisor: ${currentLo.name} (${currentLo.company}, ${currentLo.nmls}, 📞 ${currentLo.phone})
• Real Estate Specialist: ${currentAgent.name} (${currentAgent.brokerage}, ${currentAgent.license}, 📞 ${currentAgent.phone})

Would you like to review your pre-qualification numbers or schedule a private VIP walkthrough of this home this week? Let us know what time works best for you!`
  };

  // Generate AdKit and Draft
  const coBrandSlug = `cobrand-${currentLo.id}-${currentAgent.id}-${listing.id}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const coBrandUrl = `https://cfmtg.com/mford/tour/${coBrandSlug}`;

  const adKit: VantageCoBrandedAdKit = {
    id: `vantage-fthb-${listing.id}-${Date.now()}`,
    propertyId: listing.id,
    propertyAddress: listing.address,
    propertyCity: city,
    propertyPrice: listing.price,
    beds: listing.beds,
    baths: listing.baths,
    sqft: listing.sqft,
    imageUrl: listing.imageUrl,
    loId: currentLo.id,
    loName: currentLo.name,
    loNmls: currentLo.nmls || "NMLS #288455",
    loPhone: currentLo.phone || "(541) 729-0819",
    loHeadshotUrl: (currentLo as any).headshotUrl || "",
    agentId: currentAgent.id,
    agentName: currentAgent.name,
    agentBrokerage: currentAgent.brokerage || "Partner Brokerage",
    agentLicense: currentAgent.license || "OR RE Lic",
    agentPhone: currentAgent.phone || "(541) 555-0188",
    agentHeadshotUrl: (currentAgent as any).headshotUrl || "",
    pairingId: `pair-${currentLo.id}-${currentAgent.id}`,
    coBrandSlug,
    coBrandUrl,
    metaAd: {
      headline: metaHeadline,
      hook: metaHook,
      primaryText: metaPrimaryText,
      description: `Verified Co-Branded FTHB Tour & Financing Portal • ${persistentMoniker}`,
      cta: "Check Grant Eligibility / Book Tour",
      targetUrl: coBrandUrl
    },
    googleAd: {
      headlines: googleHeadlines,
      descriptions: googleDescriptions,
      sitelinks: [
        { title: "Down Payment Grant Check", url: `${coBrandUrl}#grants` },
        { title: "Schedule Private Tour", url: `${coBrandUrl}#tour` },
        { title: "Instant Mortgage Calc", url: `${coBrandUrl}#calc` }
      ],
      finalUrl: coBrandUrl
    },
    videoScript: {
      hook: videoStoryboard.hook,
      estimatedSeconds: videoStoryboard.totalSeconds,
      scenes: videoStoryboard.scenes,
      videoUrl: listing.imageUrl || "https://vjs.zencdn.net/v/oceans.mp4",
      captionText: videoStoryboard.caption,
      hashtags: videoStoryboard.hashtags
    },
    queueStatus: 'queued_for_mktg',
    assignedRole: 'mktg_ads_creator',
    createdByRole: 'FTHB Pipeline Qualifier Engine',
    timestamp: new Date().toISOString()
  };

  const draft: AdCampaignDraft = {
    id: `draft-fthb-${listing.id}`,
    platform: 'meta',
    loId: currentLo.id,
    agentId: currentAgent.id,
    campaignName: `[${shortTag}] ${currentAgent.name} + ${currentLo.name}: ${listing.address}`,
    headline: metaHeadline,
    secondaryHeadlines: googleHeadlines,
    primaryText: metaPrimaryText,
    descriptionText: `Verified Co-Branded FTHB Tour & Financing Portal • ${persistentMoniker}`,
    targetUrl: coBrandUrl,
    dailyBudget: 25,
    targetLocations: [city, `${evalData.county} County`, "Oregon"],
    isCompliancePaused: false,
    leadCap: 50,
    currentLeads: 0,
    keywords: [
      `${city} real estate`,
      "zero down payment homes",
      "USDA loan Oregon",
      "OHCS first home grants",
      "first time buyer down payment assistance"
    ],
    specialHousingCategory: true,
    adObjective: 'LEAD_GENERATION',
    status: 'draft',
    lastSaved: new Date().toISOString(),
    propertyId: listing.id,
    propertyAddress: listing.address,
    propertyCity: city,
    propertyPrice: listing.price,
    isVantageCurated: true,
    isNewAwaitingPublication: true,
    publishedChannels: []
  };

  return {
    id: `pkg-${listing.id}-${Date.now()}`,
    listing,
    eval: evalData,
    buyerFinancials,
    persistentMoniker,
    shortTag,
    financingAngle,
    downPaymentBadge,
    grantBadge,
    programType,
    loanOfficer: currentLo,
    agent: currentAgent,
    metaHeadline,
    metaHook,
    metaPrimaryText,
    googleHeadlines,
    googleDescriptions,
    videoStoryboard,
    adBrainStrategy,
    aiRecommendations,
    promptSuggestions,
    smsOutreach,
    emailOutreach,
    adKit,
    draft
  };
}

/**
 * Pushes a batch of FTHB Ad Packages to the Vantage AI Ads Engine queue
 * and saves pre-filled campaign drafts into guidesState.adCampaignDrafts!
 */
export async function pushFthbBatchToVantageStudio(
  packages: FthbVantageAdPackage[],
  guidesState?: ProfessionalGuidesState,
  onUpdateGuidesState?: (newState: ProfessionalGuidesState) => void
): Promise<{ pushedCount: number; kits: VantageCoBrandedAdKit[]; drafts: AdCampaignDraft[] }> {
  const newKits: VantageCoBrandedAdKit[] = [];
  const newDrafts: AdCampaignDraft[] = [];

  for (const pkg of packages) {
    newKits.push(pkg.adKit);
    newDrafts.push(pkg.draft);

    // Trigger async cross-project queue push
    try {
      await pushCoBrandedListingToVantageQueue(
        pkg.listing,
        pkg.loanOfficer as any,
        pkg.agent as any
      );
    } catch (e) {
      console.warn("Cross-reference push warning:", e);
    }
  }

  // Update local storage queue
  try {
    const rawQueue = localStorage.getItem("vantage_ai_ads_queue_v1");
    const currentQueue: VantageCoBrandedAdKit[] = rawQueue ? JSON.parse(rawQueue) : [];
    const updatedQueue = [...newKits, ...currentQueue.filter(k => !newKits.some(nk => nk.propertyId === k.propertyId))];
    localStorage.setItem("vantage_ai_ads_queue_v1", JSON.stringify(updatedQueue));
    window.dispatchEvent(new CustomEvent("vantage_ads_queue_updated", { detail: newKits }));
  } catch (err) {
    console.warn("Local storage ads queue error:", err);
  }

  // Update guidesState if available
  if (guidesState && onUpdateGuidesState) {
    const existingDrafts = guidesState.adCampaignDrafts || [];
    const draftMap = new Map<string, AdCampaignDraft>();
    existingDrafts.forEach(d => draftMap.set(d.id, d));
    newDrafts.forEach(d => draftMap.set(d.id, d));

    onUpdateGuidesState({
      ...guidesState,
      adCampaignDrafts: Array.from(draftMap.values())
    });
  }

  return {
    pushedCount: newKits.length,
    kits: newKits,
    drafts: newDrafts
  };
}
