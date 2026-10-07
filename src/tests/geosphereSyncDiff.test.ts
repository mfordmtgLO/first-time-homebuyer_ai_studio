import { describe, it, expect } from "vitest";
import {
  diffAndMergeListings,
  normalizeAddress,
  calculatePriceDropMonthlySavings,
  generatePriceDropAlertCopy,
} from "../services/geosphereIngestionService";

describe("GeoSphere Snapshot Ingestion & Smart Price-Drop Diff Engine", () => {
  // Test data fixtures
  const existingKnownListing = {
    id: "prop_cottage_1",
    address: "740 Gateway Blvd",
    city: "Cottage Grove",
    price: 450000,
    originalPrice: 450000,
    daysOnMarket: 45,
    status: "active",
    isFavorite: false,
    notes: "Initial LO intake note",
    curatedFor: [],
    overlayEligibility: { usda: true, usdaEligible: true },
  };

  const existingFavoritedListing = {
    id: "prop_cottage_fav",
    address: "123 Main St",
    city: "Cottage Grove",
    price: 400000,
    daysOnMarket: 20,
    status: "active",
    isFavorite: true,
    notes: "Buyer favorite home note",
    curatedFor: [],
  };

  const existingCuratedListing = {
    id: "prop_cottage_curated",
    address: "456 Oak Ave",
    city: "Cottage Grove",
    price: 380000,
    daysOnMarket: 30,
    status: "active",
    isFavorite: false,
    notes: "Curated for client",
    curatedFor: ["lead_123"],
  };

  const existingAbsentListing = {
    id: "prop_cottage_absent",
    address: "999 Old Pine Rd",
    city: "Cottage Grove",
    price: 520000,
    daysOnMarket: 90,
    status: "active",
    isFavorite: false,
    notes: "Should be flagged absent, not deleted",
  };

  // ---------------------------------------------------------------------------
  // TEST I1: sync with snapshot containing a lower price on a known address
  // -> dashboard record updates, priceDropAmount set, originalPrice preserved, 1 alert queued.
  // ---------------------------------------------------------------------------
  it("I1: updates matched listing, sets priceDropAmount, preserves originalPrice, and queues 1 alert", () => {
    const incomingSnapshot = [
      {
        address: "740 Gateway Blvd",
        city: "Cottage Grove",
        price: 430000, // $20,000 price cut
        daysOnMarket: 52,
        status: "active",
      },
    ];

    const result = diffAndMergeListings({
      cleanCity: "Cottage Grove",
      existingListings: [existingKnownListing],
      incomingListings: incomingSnapshot,
    });

    expect(result.counts.updated).toBe(1);
    expect(result.counts.inserted).toBe(0);
    expect(result.counts.flagged).toBe(0);

    const updated = result.updatedListings[0];
    expect(updated.price).toBe(430000);
    expect(updated.originalPrice).toBe(450000); // Preserved!
    expect(updated.priceDropAmount).toBe(20000);
    expect(updated.priceDropDate).toBeDefined();
    expect(updated.daysOnMarket).toBe(52);
    // Preserved buyer notes & id
    expect(updated.id).toBe("prop_cottage_1");

    expect(result.priceDrops.length).toBe(1);
    expect(result.priceDrops[0].alertQueued).toBe(true);
    expect(result.priceDrops[0].priceDropAmount).toBe(20000);
    expect(result.priceDrops[0].savings).toBeGreaterThan(0);
    expect(result.alertsToDeliver.length).toBe(1);
  });

  // ---------------------------------------------------------------------------
  // TEST I2: same sync run twice -> second run queues zero duplicate alerts.
  // ---------------------------------------------------------------------------
  it("I2: same sync run twice queues zero duplicate alerts on re-sync (idempotency)", () => {
    const incomingSnapshot = [
      {
        address: "740 Gateway Blvd",
        city: "Cottage Grove",
        price: 430000,
        daysOnMarket: 52,
      },
    ];

    const deliveredAlertIds = new Set<string>();

    // First run
    const run1 = diffAndMergeListings({
      cleanCity: "Cottage Grove",
      existingListings: [existingKnownListing],
      incomingListings: incomingSnapshot,
      deliveredAlertIds,
    });

    expect(run1.counts.newAlertsCount).toBe(1);
    expect(run1.alertsToDeliver.length).toBe(1);

    // Populate deliveredAlertIds with the delivered alert
    deliveredAlertIds.add(run1.alertsToDeliver[0].alertId);

    // Second run with same data
    const run2 = diffAndMergeListings({
      cleanCity: "Cottage Grove",
      existingListings: [existingKnownListing],
      incomingListings: incomingSnapshot,
      deliveredAlertIds,
    });

    expect(run2.counts.updated).toBe(1);
    expect(run2.counts.priceDropsCount).toBe(1);
    expect(run2.counts.newAlertsCount).toBe(0); // ZERO duplicate alerts queued!
    expect(run2.alertsToDeliver.length).toBe(0);
    expect(run2.priceDrops[0].alertQueued).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // TEST I3: drop on a favorited property -> Tier 1 copy with ❤️ prefix in both
  // card note and thread message.
  // ---------------------------------------------------------------------------
  it("I3: drop on a favorited property triggers Tier 1 copy with ❤️ prefix", () => {
    const incomingSnapshot = [
      {
        address: "123 Main St",
        city: "Cottage Grove",
        price: 385000, // $15,000 drop
      },
    ];

    const result = diffAndMergeListings({
      cleanCity: "Cottage Grove",
      existingListings: [existingFavoritedListing],
      incomingListings: incomingSnapshot,
    });

    expect(result.priceDrops.length).toBe(1);
    const drop = result.priceDrops[0];
    expect(drop.tier).toBe(1);
    expect(drop.tierCopy).toContain("❤️ Price drop on your favorited home");
    expect(drop.threadMessage).toContain("❤️ Your favorited home at 123 Main St just dropped");
    expect(drop.actionItemPriority).toBe("urgent");
    expect(drop.actionItemText).toContain("[Urgent LO Action]");
  });

  // ---------------------------------------------------------------------------
  // TEST I4: drop on a curated (non-favorite) property -> Tier 2 copy naming the curated list.
  // ---------------------------------------------------------------------------
  it("I4: drop on a curated (non-favorite) property triggers Tier 2 copy naming the curated list", () => {
    const incomingSnapshot = [
      {
        address: "456 Oak Ave",
        city: "Cottage Grove",
        price: 365000, // $15,000 drop
      },
    ];

    const curatedAddresses = new Set<string>([normalizeAddress("456 Oak Ave")]);

    const result = diffAndMergeListings({
      cleanCity: "Cottage Grove",
      existingListings: [existingCuratedListing],
      incomingListings: incomingSnapshot,
      curatedAddresses,
    });

    expect(result.priceDrops.length).toBe(1);
    const drop = result.priceDrops[0];
    expect(drop.tier).toBe(2);
    expect(drop.tierCopy).toContain("in your curated property list just dropped");
    expect(drop.threadMessage).toContain("in your curated property list just dropped");
    expect(drop.actionItemPriority).toBe("high");
    expect(drop.actionItemText).toContain("[LO Alert] Curated Property Price Cut");
  });

  // ---------------------------------------------------------------------------
  // TEST I5: incoming listing with no match -> new card tagged 'new', no alert fired.
  // ---------------------------------------------------------------------------
  it("I5: incoming listing with no match inserts as new card tagged 'new' with zero alerts fired", () => {
    const incomingSnapshot = [
      {
        address: "500 Brand New Ln",
        city: "Cottage Grove",
        price: 410000,
        beds: 3,
        baths: 2,
      },
    ];

    const result = diffAndMergeListings({
      cleanCity: "Cottage Grove",
      existingListings: [existingKnownListing],
      incomingListings: incomingSnapshot,
    });

    expect(result.counts.updated).toBe(0);
    expect(result.counts.inserted).toBe(1);
    expect(result.counts.priceDropsCount).toBe(0);
    expect(result.alertsToDeliver.length).toBe(0);

    const inserted = result.insertedListings[0];
    expect(inserted.address).toBe("500 Brand New Ln");
    expect(inserted.tag).toBe("new");
    expect(inserted.tags).toContain("new");
    expect(inserted.isNewCandidate).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // TEST I6: existing listing absent from snapshot -> flagged 'no_longer_active',
  // card retained, no data deleted.
  // ---------------------------------------------------------------------------
  it("I6: existing listing absent from snapshot is flagged 'no_longer_active' without deletion", () => {
    const incomingSnapshot = [
      {
        address: "740 Gateway Blvd", // Only 740 Gateway Blvd is present
        city: "Cottage Grove",
        price: 450000,
      },
    ];

    const result = diffAndMergeListings({
      cleanCity: "Cottage Grove",
      existingListings: [existingKnownListing, existingAbsentListing],
      incomingListings: incomingSnapshot,
    });

    expect(result.counts.updated).toBe(1);
    expect(result.counts.flagged).toBe(1);

    const flagged = result.flaggedListings[0];
    expect(flagged.id).toBe("prop_cottage_absent");
    expect(flagged.address).toBe("999 Old Pine Rd");
    expect(flagged.status).toBe("no_longer_active");
    expect(flagged.flagReason).toBe("absent from latest RentCast pull");
    expect(flagged.notes).toBe("Should be flagged absent, not deleted"); // Preserved!
  });

  // ---------------------------------------------------------------------------
  // TEST I7 & Qualification Language Check:
  // Tier 3 contains "likely qualifies" qualifier and calculates real monthly savings.
  // ---------------------------------------------------------------------------
  it("I7 & qualifiers: Tier 3 includes 'likely qualifies' qualifier and computes mathematical savings", () => {
    const copy = generatePriceDropAlertCopy({
      address: "888 Rural Way",
      city: "Cottage Grove",
      priceDropAmount: 20000,
      newPrice: 480000,
      savings: calculatePriceDropMonthlySavings(20000),
      isFavorite: false,
      isCurated: false,
      overlay: { usda: true, usdaEligible: true },
    });

    expect(copy.tier).toBe(3);
    expect(copy.cardNoteText).toContain("likely qualifies");
    expect(copy.threadMessageText).toContain("likely qualifies");
    expect(copy.programsSummary).toContain("USDA 100% Financing");
    expect(copy.cardNoteText).toContain("$20,000 to $480,000");
  });
});
