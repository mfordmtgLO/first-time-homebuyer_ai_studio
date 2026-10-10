import { describe, it, expect } from "vitest";
import { generateLeadDraftEmailContent, getWorkEmailSignature, DEFAULT_MIKE_FORD_SIGNATURE } from "../utils/outlookEmailService";
import { generateScenarioDrafts } from "../utils/scenarioOutreachGenerator";
import { LoanOfficerProfile, RealEstateAgentProfile, CapturedLead, FinancialProfile } from "../types";

describe("No Fabricated Contact Fallbacks - Comprehensive Compliance Tests", () => {
  const dummyBreakdown = {
    loanAmount: 380000,
    downPayment: 20000,
    principalAndInterest: 2339,
    propertyTax: 416,
    homeInsurance: 125,
    pmi: 158,
    hoa: 0,
    totalMonthly: 3038,
  };

  const dummyFinancials = {
    targetPrice: 400000,
    downPaymentSavings: 20000,
    annualIncome: 85000,
    monthlyDebt: 450,
    creditScore: 720,
    interestRate: 6.25,
    loanTermYears: 30,
    propertyTaxRate: 1.25,
    annualInsuranceRate: 0.35,
    pmiRate: 0.5,
    hoaMonthly: 0,
  } as unknown as FinancialProfile;

  const dummyLead = {
    id: "lead-test-1",
    fullName: "Alex Rivera",
    email: "alex@example.com",
    phone: "(503) 222-3344",
    status: "new",
    targetPriceRange: "$400,000",
    stage: "qualification",
    downPayment: "$20,000",
    createdAt: new Date().toISOString(),
  } as unknown as CapturedLead;

  it("F1: LO with NO phone → output contains no 555 number, no 'Phone:' label, no substituted phone", () => {
    const loNoPhone = {
      id: "lo-sarah",
      name: "Sarah Connor",
      company: "Summit Lending",
      nmlsId: "998877",
      email: "sarah@summit.com",
      licenseStates: ["OR"],
    } as unknown as LoanOfficerProfile;

    const outreach = generateScenarioDrafts({
      lead: dummyLead,
      profile: dummyFinancials,
      breakdown: dummyBreakdown,
      loanProgram: "Conventional 30-Year Fixed",
      sourceTool: "calculator",
      loanOfficer: loNoPhone,
    });

    expect(outreach.draftBorrowerEmailBody).not.toContain("555");
    expect(outreach.draftBorrowerEmailBody).not.toContain("(503) 555");
    expect(outreach.draftBorrowerEmailBody).not.toContain("(541) 555");
    expect(outreach.draftBorrowerEmailBody).not.toContain("📞 undefined");

    const sig = getWorkEmailSignature(loNoPhone);
    expect(sig).not.toContain("555");
    expect(sig).not.toContain("Direct: (541) 729-0819");
    expect(sig).not.toContain("Direct:");
  });

  it("F2: Agent with NO phone/email → agent line omits those fields; no 555-0144, no agent@pnwrealty.com", () => {
    const lo = {
      id: "lo-sarah",
      name: "Sarah Connor",
      company: "Summit Lending",
      nmlsId: "998877",
      phone: "(503) 999-8877",
      email: "sarah@summit.com",
    } as unknown as LoanOfficerProfile;

    const agentNoContact = {
      id: "agent-jane",
      name: "Jane Smith",
      brokerage: "Summit Realty",
    } as unknown as RealEstateAgentProfile;

    const outreach = generateScenarioDrafts({
      lead: dummyLead,
      profile: dummyFinancials,
      breakdown: dummyBreakdown,
      loanProgram: "Conventional 30-Year Fixed",
      sourceTool: "calculator",
      loanOfficer: lo,
      agent: agentNoContact,
    });

    expect(outreach.draftBorrowerEmailBody).not.toContain("555-0144");
    expect(outreach.draftBorrowerEmailBody).not.toContain("agent@pnwrealty.com");
    expect(outreach.draftBorrowerEmailBody).not.toContain("Phone: undefined");
    expect(outreach.draftBorrowerEmailBody).not.toContain("📞 undefined");

    const draft = generateLeadDraftEmailContent(dummyLead, lo, agentNoContact);
    expect(draft.body).not.toContain("555-0144");
    expect(draft.body).not.toContain("agent@pnwrealty.com");
  });

  it("F3: Non-owner LO whose profile lacks NMLS/email → output contains neither 288455 nor mford@cfmtg.com nor Mike Ford", () => {
    const nonOwnerLo = {
      id: "lo-dave",
      name: "Dave Miller",
      company: "Pacific Coast Loans",
      phone: "(503) 888-7766",
    } as unknown as LoanOfficerProfile;

    const sig = getWorkEmailSignature(nonOwnerLo);
    expect(sig).toContain("Dave Miller");
    expect(sig).toContain("Pacific Coast Loans");
    expect(sig).not.toContain("288455");
    expect(sig).not.toContain("mford@cfmtg.com");
    expect(sig).not.toContain("Mike Ford");

    const outreach = generateScenarioDrafts({
      lead: dummyLead,
      profile: dummyFinancials,
      breakdown: dummyBreakdown,
      loanProgram: "Conventional 30-Year Fixed",
      sourceTool: "calculator",
      loanOfficer: nonOwnerLo,
    });
    expect(outreach.draftBorrowerEmailBody).toContain("Dave Miller");
    expect(outreach.draftBorrowerEmailBody).not.toContain("288455");
    expect(outreach.draftBorrowerEmailBody).not.toContain("mford@cfmtg.com");
    expect(outreach.draftBorrowerEmailBody).not.toContain("Mike Ford");
  });

  it("F5: Mike's complete profile renders byte-identical contact lines", () => {
    const mikeProfile = {
      id: "lo-mike-ford",
      name: "Mike Ford",
      title: "Senior Loan Officer | Producing Branch Manager",
      company: "Cornerstone First Mortgage",
      nmlsId: "288455",
      phone: "(541) 729-0819",
      email: "mford@cfmtg.com",
      leadGenFormUrl: "https://portal.myhometrac.com/get-started/MFORD@CFMTG.COM",
    } as unknown as LoanOfficerProfile;

    const sig = getWorkEmailSignature(mikeProfile);
    expect(sig).toBe(DEFAULT_MIKE_FORD_SIGNATURE);
    expect(sig).toContain("Mike Ford");
    expect(sig).toContain("NMLS #288455");
    expect(sig).toContain("(541) 729-0819");
    expect(sig).toContain("mford@cfmtg.com");
  });
});
