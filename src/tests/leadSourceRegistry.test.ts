import { describe, it, expect } from "vitest";
import {
  CANONICAL_LEAD_SOURCES,
  UNATTRIBUTED_SOURCE,
  resolveLeadSource,
  leadSourceLabel,
  resolveExpenseSource,
  getExpenseSourceOptions,
} from "../utils/leadSourceRegistry";
import { CapturedLead } from "../types";

describe("Owner Spec: Canonical Lead Source Registry Suite (Mike Ford, 2026-10-08)", () => {
  describe("Core 5 Owner Spec Mappings", () => {
    it("M1: lead_intake_chatbot maps to 'First Time Homebuyer Website: Chatbot'", () => {
      const leadA: Partial<CapturedLead> = { source: "lead_intake_chatbot" };
      const resolvedA = resolveLeadSource(leadA);
      expect(resolvedA.slug).toBe("lead_intake_chatbot");
      expect(resolvedA.label).toBe("First Time Homebuyer Website: Chatbot");
      expect(leadSourceLabel(leadA)).toBe("First Time Homebuyer Website: Chatbot");
      expect(leadSourceLabel("lead_intake_chatbot")).toBe("First Time Homebuyer Website: Chatbot");

      // Also via legacy leadSource field
      const leadLegacy: Partial<CapturedLead> = { leadSource: "lead_intake_chatbot" };
      expect(resolveLeadSource(leadLegacy).label).toBe("First Time Homebuyer Website: Chatbot");
    });

    it("M2: plugin-chatbot maps to 'FTHB House Finder plugin: Chatbot'", () => {
      const lead: Partial<CapturedLead> = { source: "plugin-chatbot" };
      const resolved = resolveLeadSource(lead);
      expect(resolved.slug).toBe("plugin-chatbot");
      expect(resolved.label).toBe("FTHB House Finder plugin: Chatbot");
      expect(leadSourceLabel(lead)).toBe("FTHB House Finder plugin: Chatbot");
      expect(leadSourceLabel("plugin-chatbot")).toBe("FTHB House Finder plugin: Chatbot");
    });

    it("M3: plugin-chat maps to 'FTHB House Finder plugin: Chatbot'", () => {
      const lead: Partial<CapturedLead> = { source: "plugin-chat" };
      const resolved = resolveLeadSource(lead);
      expect(resolved.slug).toBe("plugin-chatbot");
      expect(resolved.label).toBe("FTHB House Finder plugin: Chatbot");
      expect(leadSourceLabel(lead)).toBe("FTHB House Finder plugin: Chatbot");
      expect(leadSourceLabel("plugin-chat")).toBe("FTHB House Finder plugin: Chatbot");
    });

    it("M4: plugin-email-link maps to 'FTHB House Finder plugin: Email Identify'", () => {
      const lead: Partial<CapturedLead> = { source: "plugin-email-link" };
      const resolved = resolveLeadSource(lead);
      expect(resolved.slug).toBe("plugin-email-link");
      expect(resolved.label).toBe("FTHB House Finder plugin: Email Identify");
      expect(leadSourceLabel(lead)).toBe("FTHB House Finder plugin: Email Identify");
      expect(leadSourceLabel("plugin-email-link")).toBe("FTHB House Finder plugin: Email Identify");
    });

    it("M5: Unmatched, empty, or unknown sources map to 'Unattributed' (NEVER 'AI Intake Chatbot')", () => {
      expect(resolveLeadSource(null).label).toBe("Unattributed");
      expect(resolveLeadSource(undefined).label).toBe("Unattributed");
      expect(resolveLeadSource({}).label).toBe("Unattributed");
      expect(resolveLeadSource({ source: "" }).label).toBe("Unattributed");
      expect(resolveLeadSource({ source: "   " }).label).toBe("Unattributed");
      expect(resolveLeadSource({ leadSource: "random_mystery_channel_123" }).label).toBe("Unattributed");
      expect(resolveLeadSource({ source: "totally_unrecognized_affiliate" }).label).toBe("Unattributed");

      // Verify that the fallback is never "AI Intake Chatbot"
      const fallback = resolveLeadSource({ source: "untracked_legacy_test" });
      expect(fallback.label).not.toContain("Chatbot");
      expect(fallback.label).toBe("Unattributed");
      expect(fallback.slug).toBe("unattributed");

      expect(leadSourceLabel("")).toBe("Unattributed");
      expect(leadSourceLabel(null)).toBe("Unattributed");
      expect(leadSourceLabel(undefined)).toBe("Unattributed");
    });
  });

  describe("Precedence & Resolution Hierarchy", () => {
    it("P1: lead.source machine slug takes precedence over legacy lead.leadSource", () => {
      const lead: Partial<CapturedLead> = {
        source: "plugin-chatbot",
        leadSource: "Old Legacy String",
      };
      const resolved = resolveLeadSource(lead);
      expect(resolved.slug).toBe("plugin-chatbot");
      expect(resolved.label).toBe("FTHB House Finder plugin: Chatbot");
    });

    it("P2: lead.sourceLabel takes precedence if lead.source is missing", () => {
      const lead: Partial<CapturedLead> = {
        sourceLabel: "FTHB House Finder plugin: Email Identify",
        leadSource: "some-other-raw-data",
      };
      const resolved = resolveLeadSource(lead);
      expect(resolved.slug).toBe("plugin-email-link");
      expect(resolved.label).toBe("FTHB House Finder plugin: Email Identify");
    });

    it("P3: Legacy campaign and listing patterns resolve to canonical definitions", () => {
      // Facebook Ad legacy string
      expect(resolveLeadSource({ leadSource: "Campaign: Meta Feed - USDA 100% Zero-Down" }).label).toBe("Facebook Ads");
      // Google Ad legacy string
      expect(resolveLeadSource({ leadSource: "Campaign: Google Search - First Time Home Buyer" }).label).toBe("Google Ads");
      // YouTube legacy string
      expect(resolveLeadSource({ leadSource: "YouTube Video Ads (Vantage AI)" }).label).toBe("YouTube Video Ads");
      // GeoSphere GIS Map legacy string
      expect(resolveLeadSource({ leadSource: "GeoSphere Map + Vantage AI Ad Studio Sync" }).label).toBe("GeoSphere GIS Map");
      // Listing inquiry legacy string
      expect(resolveLeadSource({ leadSource: "Listing: 1420 SE Walnut St (Albany)" }).label).toBe("Property Listing Inquiry");
      // Flyer QR Code legacy string
      expect(resolveLeadSource({ leadSource: "Flyer QR Code: Lake Oswego Open House" }).label).toBe("Flyer QR Code");
      // Local Market Trends Tool
      expect(resolveLeadSource({ leadSource: "Local Market Trends Tool" }).label).toBe("Local Market Trends Tool");
    });
  });

  describe("Micro-Addendum (2026-10-08): 4 Legacy Alias Strings", () => {
    it("A1: 'Website AI Intake Chatbot' as only source field resolves to 'First Time Homebuyer Website: Chatbot'", () => {
      const lead: Partial<CapturedLead> = { leadSource: "Website AI Intake Chatbot" };
      const resolved = resolveLeadSource(lead);
      expect(resolved.slug).toBe("lead_intake_chatbot");
      expect(resolved.label).toBe("First Time Homebuyer Website: Chatbot");
    });

    it("A2: 'Market Trends Lead' as only source field resolves to 'Local Market Trends Tool'", () => {
      const lead: Partial<CapturedLead> = { leadPathTag: "Market Trends Lead" };
      const resolved = resolveLeadSource(lead);
      expect(resolved.slug).toBe("local-market-trends");
      expect(resolved.label).toBe("Local Market Trends Tool");

      const leadViaSourceField: Partial<CapturedLead> = { leadSource: "Market Trends Lead" };
      expect(resolveLeadSource(leadViaSourceField).label).toBe("Local Market Trends Tool");
    });

    it("A3: 'Agent Spotlight Curated Home List' as only source field resolves to 'Agent Spotlight'", () => {
      const lead: Partial<CapturedLead> = { leadPathTag: "Agent Spotlight Curated Home List" };
      const resolved = resolveLeadSource(lead);
      expect(resolved.slug).toBe("agent-spotlight");
      expect(resolved.label).toBe("Agent Spotlight");

      const leadViaSourceField: Partial<CapturedLead> = { leadSource: "Agent Spotlight Curated Home List" };
      expect(resolveLeadSource(leadViaSourceField).label).toBe("Agent Spotlight");
    });

    it("A4: 'Agent Spotlight Hero Lead Gen' as only source field resolves to 'Agent Spotlight'", () => {
      const lead: Partial<CapturedLead> = { leadPathTag: "Agent Spotlight Hero Lead Gen" };
      const resolved = resolveLeadSource(lead);
      expect(resolved.slug).toBe("agent-spotlight");
      expect(resolved.label).toBe("Agent Spotlight");

      const leadViaSourceField: Partial<CapturedLead> = { leadSource: "Agent Spotlight Hero Lead Gen" };
      expect(resolveLeadSource(leadViaSourceField).label).toBe("Agent Spotlight");
    });
  });

  describe("Expense & ROI Attribution Alignment", () => {
    it("E1: resolveExpenseSource maps known expense strings to canonical definitions", () => {
      expect(resolveExpenseSource("Facebook Ads").label).toBe("Facebook Ads");
      expect(resolveExpenseSource("Google Ads").label).toBe("Google Ads");
      expect(resolveExpenseSource("YouTube Video Ads").label).toBe("YouTube Video Ads");
      expect(resolveExpenseSource("GeoSphere GIS Map").label).toBe("GeoSphere GIS Map");
      expect(resolveExpenseSource("Social Media").label).toBe("Social Media");
      expect(resolveExpenseSource("First Time Homebuyer Website: Chatbot").slug).toBe("lead_intake_chatbot");
      expect(resolveExpenseSource("FTHB House Finder plugin: Chatbot").slug).toBe("plugin-chatbot");
    });

    it("E2: resolveExpenseSource maps unknown spend to UNATTRIBUTED_SOURCE", () => {
      expect(resolveExpenseSource("Billboard on Hwy 217").slug).toBe("unattributed");
      expect(resolveExpenseSource(null).slug).toBe("unattributed");
      expect(resolveExpenseSource("").slug).toBe("unattributed");
    });

    it("E3: getExpenseSourceOptions provides complete choices for AddAdExpenseModal", () => {
      const options = getExpenseSourceOptions();
      expect(options.length).toBeGreaterThanOrEqual(5);
      const values = options.map((o) => o.value);
      expect(values).toContain("Facebook Ads");
      expect(values).toContain("Google Ads");
      expect(values).toContain("YouTube Video Ads");
      expect(values).toContain("GeoSphere GIS Map");
      expect(values).toContain("Social Media");
      expect(values).toContain("First Time Homebuyer Website: Chatbot");
      expect(values).toContain("FTHB House Finder plugin: Chatbot");
    });
  });

  describe("Registry Integrity & Immutability", () => {
    it("R1: Every canonical entry has unique slug and label", () => {
      const slugs = new Set<string>();
      const labels = new Set<string>();

      CANONICAL_LEAD_SOURCES.forEach((entry) => {
        expect(slugs.has(entry.slug)).toBe(false);
        expect(labels.has(entry.label)).toBe(false);
        slugs.add(entry.slug);
        labels.add(entry.label);
      });
    });

    it("R2: UNATTRIBUTED_SOURCE is correctly defined", () => {
      expect(UNATTRIBUTED_SOURCE.slug).toBe("unattributed");
      expect(UNATTRIBUTED_SOURCE.label).toBe("Unattributed");
      expect(UNATTRIBUTED_SOURCE.expenseKey).toBe("unattributed");
    });
  });
});
