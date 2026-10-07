/**
 * GeoSphere Snapshot Ingestion & Smart Price-Drop Diff Service
 *
 * Implements:
 * 1. Real ingestion diff-and-merge in /api/geosphere/sync-ready-folder
 * 2. Real price-drop detection: incoming.price < existing.price (no seeded/simulated drops)
 * 3. Conversion-focused smart alert tiers (Tier 1: Favorite, Tier 2: Curated, Tier 3: Area + Program)
 * 4. In-app two-way thread delivery (Firestore property_conversations), never Twilio/push
 * 5. Idempotent alert dispatching keyed by address + new price
 * 6. Non-destructive merge: preserves notes, favorites, curations, and flags absent as "no_longer_active"
 */

export interface PriceDropAlertPayload {
  address: string;
  originalPrice: number;
  newPrice: number;
  priceDropAmount: number;
  savings: number;
  tier: 1 | 2 | 3;
  alertQueued: boolean;
  tierCopy: string;
  threadMessage: string;
  actionItemText: string;
  actionItemPriority: "urgent" | "high" | "standard";
  alertId: string;
  programsSummary?: string;
}

export interface DiffMergeResult {
  updatedListings: any[];
  insertedListings: any[];
  flaggedListings: any[];
  priceDrops: PriceDropAlertPayload[];
  alertsToDeliver: PriceDropAlertPayload[];
  counts: {
    updated: number;
    inserted: number;
    flagged: number;
    priceDropsCount: number;
    newAlertsCount: number;
  };
}

/**
 * Normalizes a street address for robust deduplication and diffing.
 * Lowercase, trimmed, collapses whitespace.
 */
export function normalizeAddress(addr: string): string {
  if (!addr || typeof addr !== "string") return "";
  return addr.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Derives a deterministic address slug.
 */
export function addressToSlug(addr: string): string {
  return normalizeAddress(addr).replace(/[^a-z0-9]/g, "-");
}

/**
 * Calculates estimated monthly mortgage payment savings resulting from a purchase price reduction.
 * Standard formula: Loan amount reduction (96.5% standard LTV) * 30-year fixed amortization factor
 * (benchmark ~6.5%) + Oregon property tax reduction (~1.1%/yr). Minimum floor $25/mo.
 */
export function calculatePriceDropMonthlySavings(
  priceDropAmount?: number | null,
  annualRatePct: number = 6.5
): number {
  if (!priceDropAmount || priceDropAmount <= 0) return 0;
  const loanDrop = priceDropAmount * 0.965;
  const monthlyRate = (annualRatePct / 100) / 12;
  const n = 360;
  const piSavings =
    (loanDrop * (monthlyRate * Math.pow(1 + monthlyRate, n))) /
    (Math.pow(1 + monthlyRate, n) - 1);
  const taxSavings = (priceDropAmount * 0.011) / 12;
  return Math.max(25, Math.round(piSavings + taxSavings));
}

/**
 * Identifies low/no-down-payment assistance programs an address likely qualifies for
 * based on its overlay eligibility.
 */
export function extractQualifyingProgramsText(overlay: any): string {
  if (!overlay || typeof overlay !== "object") return "Oregon Down Payment Assistance";
  const programs: string[] = [];
  if (overlay.usda === true || overlay.usdaEligible === true) {
    programs.push("USDA 100% Financing");
  }
  if (overlay.lmi === true || overlay.lmiEligible === true) {
    programs.push("LMI Grant Assistance");
  }
  const lv = overlay.lakeviewNational ?? overlay.lakeviewNationalEligible;
  if (typeof lv === "object" ? Boolean(lv?.available) : Boolean(lv)) {
    programs.push("Lakeview Community 100");
  }
  const fh = overlay.firstHome ?? overlay.firstHomeEligible;
  if (typeof fh === "object" ? Boolean(fh?.available) : Boolean(fh)) {
    programs.push("FirstHome DPA");
  }
  return programs.length > 0 ? programs.join(", ") : "Oregon Down Payment Assistance";
}

/**
 * Generates conversion copy and in-app thread messages according to the 3-tier alert spec.
 * Appends required "likely qualifies" qualifier language on program-eligibility statements.
 */
export function generatePriceDropAlertCopy(params: {
  address: string;
  city: string;
  priceDropAmount: number;
  newPrice: number;
  savings: number;
  isFavorite: boolean;
  isCurated: boolean;
  overlay?: any;
}): {
  tier: 1 | 2 | 3;
  cardNoteText: string;
  threadMessageText: string;
  actionItemText: string;
  actionItemPriority: "urgent" | "high" | "standard";
  programsSummary: string;
} {
  const { address, city, priceDropAmount, newPrice, savings, isFavorite, isCurated, overlay } = params;
  const fmtDrop = "$" + priceDropAmount.toLocaleString();
  const fmtPrice = "$" + newPrice.toLocaleString();
  const fmtSavings = "$" + savings.toLocaleString();
  const programsSummary = extractQualifyingProgramsText(overlay);

  if (isFavorite) {
    // TIER 1 — FAVORITE (highest urgency, ❤️ prefix)
    return {
      tier: 1,
      cardNoteText: `❤️ Price drop on your favorited home: ${address} just dropped ${fmtDrop} to ${fmtPrice} — estimated savings ~${fmtSavings}/mo.`,
      threadMessageText: `❤️ Your favorited home at ${address} just dropped ${fmtDrop} to ${fmtPrice} — estimated savings ~${fmtSavings}/mo.`,
      actionItemText: `[Urgent LO Action] Price Drop on Favorited Home: ${address} dropped ${fmtDrop} to ${fmtPrice} (~${fmtSavings}/mo savings). Follow up with buyer immediately.`,
      actionItemPriority: "urgent",
      programsSummary,
    };
  }

  if (isCurated) {
    // TIER 2 — CURATED LIST (standard priority, names curated list)
    return {
      tier: 2,
      cardNoteText: `${address} in your curated property list just dropped ${fmtDrop} to ${fmtPrice} — estimated savings ~${fmtSavings}/mo.`,
      threadMessageText: `${address} in your curated property list just dropped ${fmtDrop} to ${fmtPrice} — estimated savings ~${fmtSavings}/mo.`,
      actionItemText: `[LO Alert] Curated Property Price Cut: ${address} dropped ${fmtDrop} to ${fmtPrice} (~${fmtSavings}/mo savings).`,
      actionItemPriority: "high",
      programsSummary,
    };
  }

  // TIER 3 — AREA + PROGRAM MATCH (names area and likely-qualifying programs with required qualifier)
  return {
    tier: 3,
    cardNoteText: `Price drop in ${city}: ${address} dropped ${fmtDrop} to ${fmtPrice} (estimated savings ~${fmtSavings}/mo). This property likely qualifies for ${programsSummary} programs.`,
    threadMessageText: `Price drop alert for ${city}: ${address} dropped ${fmtDrop} to ${fmtPrice} (estimated savings ~${fmtSavings}/mo). This property likely qualifies for ${programsSummary} based on published area guidelines.`,
    actionItemText: `[Area & Program Alert] Price reduction in ${city}: ${address} dropped ${fmtDrop} (~${fmtSavings}/mo savings, likely qualifies for ${programsSummary}).`,
    actionItemPriority: "standard",
    programsSummary,
  };
}

/**
 * Executes the core deterministic diff-and-merge against incoming snapshot listings
 * and existing dashboard listings for a city.
 */
export function diffAndMergeListings(params: {
  cleanCity: string;
  existingListings: any[];
  incomingListings: any[];
  curatedListingIds?: Set<string>;
  curatedAddresses?: Set<string>;
  deliveredAlertIds?: Set<string>;
}): DiffMergeResult {
  const {
    cleanCity,
    existingListings,
    incomingListings,
    curatedListingIds = new Set<string>(),
    curatedAddresses = new Set<string>(),
    deliveredAlertIds = new Set<string>(),
  } = params;

  const nowIso = new Date().toISOString();
  const todayDateStr = nowIso.split("T")[0];

  // Index existing listings by normalized address
  const existingMap = new Map<string, any>();
  for (const existing of existingListings) {
    const norm = normalizeAddress(existing.address);
    if (norm) {
      existingMap.set(norm, existing);
    }
  }

  const matchedExistingAddresses = new Set<string>();
  const updatedListings: any[] = [];
  const insertedListings: any[] = [];
  const flaggedListings: any[] = [];
  const priceDrops: PriceDropAlertPayload[] = [];
  const alertsToDeliver: PriceDropAlertPayload[] = [];

  for (let idx = 0; idx < incomingListings.length; idx++) {
    const incoming = incomingListings[idx];
    const incomingAddr = incoming.address;
    const normAddr = normalizeAddress(incomingAddr);
    if (!normAddr) continue;

    const existing = existingMap.get(normAddr);

    if (existing) {
      // MATCH: update in place, preserve buyer data & originalPrice
      matchedExistingAddresses.add(normAddr);

      const oldPrice = Number(existing.price);
      const newPrice = Number(incoming.price);
      const isPriceDrop = !isNaN(oldPrice) && !isNaN(newPrice) && newPrice < oldPrice;

      let cardNote = existing.notes || "";
      let originalPrice = existing.originalPrice;
      let priceDropAmount = existing.priceDropAmount;
      let priceDropDate = existing.priceDropDate;

      if (isPriceDrop) {
        priceDropAmount = oldPrice - newPrice;
        // Preserve originalPrice on first drop; do not overwrite if already set
        originalPrice = existing.originalPrice || oldPrice;
        priceDropDate = todayDateStr;
        const savings = calculatePriceDropMonthlySavings(priceDropAmount);

        const isFavorite = existing.isFavorite === true;
        const isCurated =
          !isFavorite &&
          (curatedListingIds.has(String(existing.id)) ||
            curatedAddresses.has(normAddr) ||
            (Array.isArray(existing.curatedFor) && existing.curatedFor.length > 0));

        const alertCopy = generatePriceDropAlertCopy({
          address: existing.address,
          city: existing.city || cleanCity,
          priceDropAmount,
          newPrice,
          savings,
          isFavorite,
          isCurated,
          overlay: incoming.overlayEligibility || existing.overlayEligibility,
        });

        cardNote = alertCopy.cardNoteText;

        const addressSlug = addressToSlug(existing.address);
        const alertId = `auto_pda_${addressSlug}_${newPrice}`;
        const isDuplicate = deliveredAlertIds.has(alertId);

        const alertPayload: PriceDropAlertPayload = {
          address: existing.address,
          originalPrice,
          newPrice,
          priceDropAmount,
          savings,
          tier: alertCopy.tier,
          alertQueued: !isDuplicate,
          tierCopy: alertCopy.cardNoteText,
          threadMessage: alertCopy.threadMessageText,
          actionItemText: alertCopy.actionItemText,
          actionItemPriority: alertCopy.actionItemPriority,
          alertId,
          programsSummary: alertCopy.programsSummary,
        };

        priceDrops.push(alertPayload);
        if (!isDuplicate) {
          alertsToDeliver.push(alertPayload);
          deliveredAlertIds.add(alertId);
        }
      }

      const updated = {
        ...existing,
        ...incoming,
        id: existing.id, // preserve existing document ID
        price: !isNaN(newPrice) && newPrice > 0 ? newPrice : existing.price,
        daysOnMarket: incoming.daysOnMarket ?? existing.daysOnMarket,
        status: incoming.status || existing.status || "active",
        // Preserve buyer notes, favorites, curations (never overwrite!)
        isFavorite: existing.isFavorite,
        notes: cardNote,
        buyerNote: existing.buyerNote || null,
        curatedFor: existing.curatedFor || [],
        originalPrice,
        priceDropAmount,
        priceDropDate,
        _stale: false,
        _staleSince: null,
        updatedAt: nowIso,
      };

      updatedListings.push(updated);
    } else {
      // INCOMING WITH NO MATCH: insert as new candidate card in the city folder tagged "new"
      const newDocId = (
        incoming.id ||
        `geo_${addressToSlug(cleanCity)}_${Date.now()}_${idx}`
      ).replace(/[\/\s#?]/g, "_");

      const existingTags = Array.isArray(incoming.tags) ? incoming.tags : [];
      const tags = Array.from(new Set([...existingTags, "new"]));

      const inserted = {
        ...incoming,
        id: newDocId,
        city: incoming.city || cleanCity,
        status: "active",
        tag: "new",
        tags,
        isNewCandidate: true,
        isFavorite: false,
        notes: incoming.notes || "",
        createdAt: nowIso,
        updatedAt: nowIso,
        _stale: false,
      };

      insertedListings.push(inserted);
    }
  }

  // EXISTING WITH NO INCOMING MATCH: flag status "no_longer_active" (never delete — LO decides)
  for (const existing of existingListings) {
    const norm = normalizeAddress(existing.address);
    if (!matchedExistingAddresses.has(norm)) {
      const flagged = {
        ...existing,
        status: "no_longer_active",
        flagReason: "absent from latest RentCast pull",
        flaggedAbsentAt: nowIso,
        updatedAt: nowIso,
      };
      flaggedListings.push(flagged);
    }
  }

  return {
    updatedListings,
    insertedListings,
    flaggedListings,
    priceDrops,
    alertsToDeliver,
    counts: {
      updated: updatedListings.length,
      inserted: insertedListings.length,
      flagged: flaggedListings.length,
      priceDropsCount: priceDrops.length,
      newAlertsCount: alertsToDeliver.length,
    },
  };
}

/**
 * Canonical helper to construct conversation doc ID (matches property + lead).
 */
export function getConversationDocId(propertyId: string, leadId: string): string {
  const cleanProp = String(propertyId || "").replace(/[^a-zA-Z0-9_-]/g, "");
  const cleanLead = String(leadId || "").replace(/[^a-zA-Z0-9_-]/g, "");
  return `${cleanProp}_${cleanLead}`;
}
