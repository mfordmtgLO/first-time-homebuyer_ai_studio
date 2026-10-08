/**
 * CANONICAL LEAD-SOURCE REGISTRY
 * 
 * Single source of truth for:
 * 1. CRM Lead Source column display
 * 2. Lead-to-pre-approval conversion reporting (GrowthDashboard, Source Breakdown)
 * 3. Expense & Ads ROI tracking (joining spend and leads on canonical keys)
 * 
 * OWNER SPEC (Mike Ford, 2026-10-08):
 * - lead_intake_chatbot -> "First Time Homebuyer Website: Chatbot"
 * - plugin-chatbot      -> "FTHB House Finder plugin: Chatbot"
 * - plugin-chat         -> "FTHB House Finder plugin: Chatbot"
 * - plugin-email-link   -> "FTHB House Finder plugin: Email Identify"
 * - Anything unmatched   -> "Unattributed"
 */

import { CapturedLead } from "../types";

export interface LeadSourceDefinition {
  slug: string;
  label: string;
  expenseKey: string;
  aliases: string[];
  description?: string;
  isExpenseSelectable?: boolean;
}

export const UNATTRIBUTED_SOURCE: LeadSourceDefinition = {
  slug: "unattributed",
  label: "Unattributed",
  expenseKey: "unattributed",
  aliases: ["unattributed", "unknown", ""],
  description: "Unmatched or missing lead source attribution",
  isExpenseSelectable: true,
};

export const CANONICAL_LEAD_SOURCES: LeadSourceDefinition[] = [
  {
    slug: "lead_intake_chatbot",
    label: "First Time Homebuyer Website: Chatbot",
    expenseKey: "lead_intake_chatbot",
    aliases: [
      "lead_intake_chatbot",
      "chatbot",
      "website ai intake chatbot",
      "website ai intake",
      "interactive guided ai intake",
      "ai intake chatbot",
      "curated listings request shortcut",
      "blueprint download fast-track",
      "buying power report shortcut",
      "step 4 - blueprint download request",
      "step 4 - curated listings request",
      "chat_listings",
    ],
    description: "24/7 AI Lead Intake Chatbot on the primary consumer website",
    isExpenseSelectable: true,
  },
  {
    slug: "plugin-chatbot",
    label: "FTHB House Finder plugin: Chatbot",
    expenseKey: "plugin-chatbot",
    aliases: [
      "plugin-chatbot",
      "plugin_chatbot",
      "plugin-chat",
      "plugin_chat",
      "fthb house finder plugin: chatbot",
      "fthb house finder plugin chatbot",
    ],
    description: "FTHB House Finder extension / plugin conversational assistant",
    isExpenseSelectable: true,
  },
  {
    slug: "plugin-email-link",
    label: "FTHB House Finder plugin: Email Identify",
    expenseKey: "plugin-email-link",
    aliases: [
      "plugin-email-link",
      "plugin_email_link",
      "plugin-email",
      "plugin_email",
      "fthb house finder plugin: email identify",
    ],
    description: "FTHB House Finder extension email identity verification link",
    isExpenseSelectable: true,
  },
  {
    slug: "facebook-ads",
    label: "Facebook Ads",
    expenseKey: "Facebook Ads",
    aliases: [
      "facebook ads",
      "facebook_ad",
      "meta feed",
      "facebook ads (meta)",
      "facebook social",
      "facebook story",
      "facebook short",
      "facebook reels",
      "meta",
      "facebook",
    ],
    description: "Meta / Facebook paid advertising campaigns",
    isExpenseSelectable: true,
  },
  {
    slug: "google-ads",
    label: "Google Ads",
    expenseKey: "Google Ads",
    aliases: [
      "google ads",
      "google_ad",
      "google search",
      "google ads (search/ppc)",
      "google search pre-approval path",
      "google pmax",
      "google",
    ],
    description: "Google Search, PPC, and Performance Max ad campaigns",
    isExpenseSelectable: true,
  },
  {
    slug: "youtube-video-ads",
    label: "YouTube Video Ads",
    expenseKey: "YouTube Video Ads",
    aliases: [
      "youtube video ads",
      "youtube_ad",
      "youtube video ads (vantage ai)",
      "youtube",
      "youtube channel list",
      "youtube short",
      "youtube reels",
    ],
    description: "YouTube video campaigns and walkthrough tours",
    isExpenseSelectable: true,
  },
  {
    slug: "geosphere-gis-map",
    label: "GeoSphere GIS Map",
    expenseKey: "GeoSphere GIS Map",
    aliases: [
      "geosphere gis map",
      "geosphere_map",
      "geosphere gis map (rentcast)",
      "geosphere map",
      "first-time homebuyer geosphere",
      "geosphere sync hub",
      "usda 0% down + geosphere sourced",
    ],
    description: "GeoSphere spatial map explorer and RentCast market scans",
    isExpenseSelectable: true,
  },
  {
    slug: "social-media",
    label: "Social Media",
    expenseKey: "Social Media",
    aliases: [
      "social media",
      "social_media",
      "social media (instagram/linkedin)",
      "instagram",
      "instagram post",
      "instagram story",
      "instagram short",
      "instagram reels",
      "tiktok",
      "tiktok post",
      "linkedin",
    ],
    description: "Organic social media publishing across Instagram, TikTok, LinkedIn",
    isExpenseSelectable: true,
  },
  {
    slug: "local-market-trends",
    label: "Local Market Trends Tool",
    expenseKey: "local-market-trends",
    aliases: [
      "local market trends tool",
      "market trends lead",
      "market trends",
    ],
    description: "Local Market Trends and Altos Research report consultation",
    isExpenseSelectable: true,
  },
  {
    slug: "agent-spotlight",
    label: "Agent Spotlight",
    expenseKey: "agent-spotlight",
    aliases: [
      "agent spotlight",
      "agent spotlight curated home list",
      "agent spotlight hero lead gen",
      "agent spotlight guide advisory",
    ],
    description: "Co-branded Realtor Partner spotlight and curated home lists",
    isExpenseSelectable: true,
  },
  {
    slug: "guide-consultation",
    label: "Guide Consultation",
    expenseKey: "guide-consultation",
    aliases: [
      "guide consultation",
      "lo direct advisory",
    ],
    description: "Direct consultation inquiry via local professional guide cards",
    isExpenseSelectable: true,
  },
  {
    slug: "property-listing-inquiry",
    label: "Property Listing Inquiry",
    expenseKey: "property-listing-inquiry",
    aliases: [
      "property listing inquiry",
      "property_listing",
      "listing inquiry",
    ],
    description: "Individual property listing card lead capture and tour inquiry",
    isExpenseSelectable: true,
  },
  {
    slug: "flyer-qr-code",
    label: "Flyer QR Code",
    expenseKey: "flyer-qr-code",
    aliases: [
      "flyer qr code",
      "flyer qr code open house path",
      "flyer",
    ],
    description: "Physical print open house flyer QR scan and financing sheet",
    isExpenseSelectable: true,
  },
  {
    slug: "3rd-party-webhook",
    label: "3rd Party Ad Campaign",
    expenseKey: "3rd-party-webhook",
    aliases: [
      "3rd party ad campaign",
      "3rd-party-ad-campaign",
      "webhook",
      "lead_webhook",
      "lead-webhook",
    ],
    description: "Inbound webhook ingestion from third-party lead providers",
    isExpenseSelectable: true,
  },
];

/**
 * Fast lookup maps
 */
const SLUG_MAP = new Map<string, LeadSourceDefinition>();
const LABEL_MAP = new Map<string, LeadSourceDefinition>();
const ALIAS_MAP = new Map<string, LeadSourceDefinition>();

// Register canonical sources
CANONICAL_LEAD_SOURCES.forEach((entry) => {
  SLUG_MAP.set(entry.slug.toLowerCase().trim(), entry);
  LABEL_MAP.set(entry.label.toLowerCase().trim(), entry);
  entry.aliases.forEach((alias) => {
    ALIAS_MAP.set(alias.toLowerCase().trim(), entry);
  });
});

// Also register plugin-chat alias directly to plugin-chatbot
ALIAS_MAP.set("plugin-chat", CANONICAL_LEAD_SOURCES[1]);
ALIAS_MAP.set("plugin_chat", CANONICAL_LEAD_SOURCES[1]);

/**
 * Resolves any lead record or partial object to its canonical registry entry.
 * Follows exact precedence:
 * 1. lead.source if it matches a registry slug / alias
 * 2. lead.sourceLabel if it matches a registry label
 * 3. lead.leadPathTag / lead.leadSource mapped through legacy-value aliases
 * 4. Fallback to UNATTRIBUTED_SOURCE ("Unattributed") — NEVER "AI Intake Chatbot"
 */
export function resolveLeadSource(lead?: Partial<CapturedLead> | null): LeadSourceDefinition {
  if (!lead) return UNATTRIBUTED_SOURCE;

  // 1. Direct machine slug match on lead.source
  const rawSource = String(lead.source || "").toLowerCase().trim();
  if (rawSource) {
    if (SLUG_MAP.has(rawSource)) return SLUG_MAP.get(rawSource)!;
    if (ALIAS_MAP.has(rawSource)) return ALIAS_MAP.get(rawSource)!;
  }

  // 2. Direct label match on lead.sourceLabel
  const rawSourceLabel = String(lead.sourceLabel || "").toLowerCase().trim();
  if (rawSourceLabel) {
    if (LABEL_MAP.has(rawSourceLabel)) return LABEL_MAP.get(rawSourceLabel)!;
    if (ALIAS_MAP.has(rawSourceLabel)) return ALIAS_MAP.get(rawSourceLabel)!;
  }

  // 3. Fallback to legacy fields (leadPathTag, leadSource)
  const candidates: string[] = [
    String(lead.leadPathTag || "").trim(),
    String(lead.leadSource || "").trim(),
  ].filter(Boolean);

  for (const candidate of candidates) {
    const lower = candidate.toLowerCase().trim();
    if (!lower) continue;

    // Direct alias match
    if (ALIAS_MAP.has(lower)) {
      return ALIAS_MAP.get(lower)!;
    }
    if (SLUG_MAP.has(lower)) {
      return SLUG_MAP.get(lower)!;
    }
    if (LABEL_MAP.has(lower)) {
      return LABEL_MAP.get(lower)!;
    }

    // Pattern matching on legacy formatted strings
    if (lower.startsWith("listing:") || lower.includes("property listing inquiry")) {
      return SLUG_MAP.get("property-listing-inquiry")!;
    }
    if (lower.startsWith("agent spotlight:")) {
      return SLUG_MAP.get("agent-spotlight")!;
    }
    if (lower.startsWith("guide consultation:")) {
      return SLUG_MAP.get("guide-consultation")!;
    }
    if (lower.startsWith("flyer qr code:")) {
      return SLUG_MAP.get("flyer-qr-code")!;
    }
    if (lower.includes("meta feed") || lower.includes("facebook")) {
      return SLUG_MAP.get("facebook-ads")!;
    }
    if (lower.includes("google search") || lower.includes("google ads")) {
      return SLUG_MAP.get("google-ads")!;
    }
    if (lower.includes("youtube")) {
      return SLUG_MAP.get("youtube-video-ads")!;
    }
    if (lower.includes("geosphere")) {
      return SLUG_MAP.get("geosphere-gis-map")!;
    }
    if (lower.includes("market trends")) {
      return SLUG_MAP.get("local-market-trends")!;
    }
    if (lower.includes("chatbot")) {
      return SLUG_MAP.get("lead_intake_chatbot")!;
    }
  }

  // Interacted source type fallback if set
  if (lead.interactedSourceType === "property_listing" || lead.sourcePropertyAddress) {
    return SLUG_MAP.get("property-listing-inquiry")!;
  }
  if (lead.interactedSourceType === "flyer") {
    return SLUG_MAP.get("flyer-qr-code")!;
  }

  // 4. Honest Unmatched Bucket
  return UNATTRIBUTED_SOURCE;
}

/**
 * Returns the human-readable canonical display label for a lead or source string.
 * Gated by the canonical registry — no second map that can drift.
 */
export function leadSourceLabel(sourceOrLead?: string | Partial<CapturedLead> | null): string {
  if (!sourceOrLead) return UNATTRIBUTED_SOURCE.label;

  if (typeof sourceOrLead === "object") {
    return resolveLeadSource(sourceOrLead).label;
  }

  const str = String(sourceOrLead).toLowerCase().trim();
  if (!str) return UNATTRIBUTED_SOURCE.label;

  if (SLUG_MAP.has(str)) return SLUG_MAP.get(str)!.label;
  if (LABEL_MAP.has(str)) return LABEL_MAP.get(str)!.label;
  if (ALIAS_MAP.has(str)) return ALIAS_MAP.get(str)!.label;

  // Pass as fake lead to test candidate logic
  return resolveLeadSource({ source: str, leadSource: str }).label;
}

/**
 * Resolves an expense source string to its canonical registry entry.
 * Spend recorded under an unknown source surfaces under "Unattributed" spend.
 */
export function resolveExpenseSource(expenseSource?: string | null): LeadSourceDefinition {
  if (!expenseSource) return UNATTRIBUTED_SOURCE;

  const raw = String(expenseSource).toLowerCase().trim();
  if (!raw) return UNATTRIBUTED_SOURCE;

  for (const entry of CANONICAL_LEAD_SOURCES) {
    if (
      entry.expenseKey.toLowerCase() === raw ||
      entry.slug.toLowerCase() === raw ||
      entry.label.toLowerCase() === raw ||
      entry.aliases.some((a) => a.toLowerCase() === raw)
    ) {
      return entry;
    }
  }

  return UNATTRIBUTED_SOURCE;
}

/**
 * Source choices for the AddAdExpenseModal dropdown
 */
export function getExpenseSourceOptions(): { value: string; label: string; expenseKey: string }[] {
  return [
    { value: "Facebook Ads", label: "Facebook Ads (Meta)", expenseKey: "Facebook Ads" },
    { value: "Google Ads", label: "Google Ads (Search/PPC)", expenseKey: "Google Ads" },
    { value: "YouTube Video Ads", label: "YouTube Video Ads (Vantage AI)", expenseKey: "YouTube Video Ads" },
    { value: "GeoSphere GIS Map", label: "GeoSphere GIS Map (RentCast)", expenseKey: "GeoSphere GIS Map" },
    { value: "Social Media", label: "Social Media (Instagram/LinkedIn)", expenseKey: "Social Media" },
    { value: "First Time Homebuyer Website: Chatbot", label: "First Time Homebuyer Website: Chatbot", expenseKey: "lead_intake_chatbot" },
    { value: "FTHB House Finder plugin: Chatbot", label: "FTHB House Finder plugin: Chatbot", expenseKey: "plugin-chatbot" },
  ];
}
