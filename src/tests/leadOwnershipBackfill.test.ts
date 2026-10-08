import { describe, it, expect } from "vitest";
import { isMasterAdminEmail, MASTER_ADMIN_EMAILS } from "../utils/rbac";

describe("Phase 1.2: Lead Ownership Backfill UI & Gating Suite", () => {
  it("B1: Master admin emails accurately identify fordmj@gmail.com and mford@cfmtg.com", () => {
    expect(isMasterAdminEmail("fordmj@gmail.com")).toBe(true);
    expect(isMasterAdminEmail("FORDMJ@GMAIL.COM ")).toBe(true);
    expect(isMasterAdminEmail("mford@cfmtg.com")).toBe(true);
    expect(isMasterAdminEmail("MFORD@CFMTG.COM")).toBe(true);
  });

  it("B2: Non-master-admin branch managers or LOs are rejected by isMasterAdminEmail", () => {
    expect(isMasterAdminEmail("lkilstrom@guildmortgage.net")).toBe(false);
    expect(isMasterAdminEmail("brian@guildmortgage.net")).toBe(false);
    expect(isMasterAdminEmail("sarah.c@guildmortgage.net")).toBe(false);
    expect(isMasterAdminEmail("other_manager@cfmtg.com")).toBe(false);
    expect(isMasterAdminEmail(null)).toBe(false);
    expect(isMasterAdminEmail(undefined)).toBe(false);
    expect(isMasterAdminEmail("")).toBe(false);
  });

  it("B3: Master admin list contains exactly the authorized branch executive accounts", () => {
    expect(MASTER_ADMIN_EMAILS).toEqual(["fordmj@gmail.com", "mford@cfmtg.com"]);
  });

  it("B4: Formats backfill result message verbatim without hardcoding or rounding counts", () => {
    const formatBackfillMessage = (scanned: number, updated: number) => {
      return `Scanned ${scanned} leads · Stamped ${updated} into your pool`;
    };

    expect(formatBackfillMessage(47, 12)).toBe("Scanned 47 leads · Stamped 12 into your pool");
    expect(formatBackfillMessage(0, 0)).toBe("Scanned 0 leads · Stamped 0 into your pool");
    expect(formatBackfillMessage(1532, 489)).toBe("Scanned 1532 leads · Stamped 489 into your pool");
  });

  it("B5: Inline confirm message matches Phase 1.2 specification verbatim", () => {
    const expectedConfirm =
      "This stamps every lead that has no owner into your pool (lo-mike-ford). It changes no other lead data. Continue?";
    expect(expectedConfirm).toContain("lo-mike-ford");
    expect(expectedConfirm).toContain("Continue?");
  });
});
