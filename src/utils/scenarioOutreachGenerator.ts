import { CapturedLead, FinancialProfile, SavedScenario, LoanOfficerProfile, RealEstateAgentProfile, MonthlyMortgageBreakdown } from "../types";
import { formatUSD } from "./mortgageMath";

/**
 * Generates ready-made customized draft email & SMS outreach for both borrower and co-brand realtor
 * based on the scenario calculations and borrower's restrictions.
 */
export function generateScenarioDrafts({
  lead,
  profile,
  breakdown,
  loanProgram,
  sourceTool,
  extraPrincipal,
  totalInterestSaved,
  yearsSaved,
  closingCosts,
  loanOfficer,
  agent
}: {
  lead: CapturedLead;
  profile: FinancialProfile;
  breakdown: MonthlyMortgageBreakdown | {
    principalAndInterest: number;
    propertyTax: number;
    homeInsurance: number;
    pmi: number;
    hoa: number;
    totalMonthly: number;
    loanAmount: number;
    frontEndDTI?: number;
    backEndDTI?: number;
    frontEndDti?: number;
    backEndDti?: number;
  };
  loanProgram: string;
  sourceTool: 'calculator' | 'mortgagelab';
  extraPrincipal?: number;
  totalInterestSaved?: number;
  yearsSaved?: number;
  closingCosts?: number;
  loanOfficer?: LoanOfficerProfile;
  agent?: RealEstateAgentProfile;
}): {
  draftBorrowerEmailSubject: string;
  draftBorrowerEmailBody: string;
  draftBorrowerSmsText: string;
  draftRealtorEmailSubject: string;
  draftRealtorEmailBody: string;
} {
  const firstName = (lead?.fullName || "there").split(" ")[0] || "there";
  const loName = loanOfficer?.name || "Your Mortgage Loan Officer";
  const loNmls = loanOfficer?.nmlsId ? (loanOfficer.nmlsId.startsWith("NMLS") ? loanOfficer.nmlsId : `NMLS #${loanOfficer.nmlsId}`) : (loanOfficer?.nmlsNumber ? `NMLS #${loanOfficer.nmlsNumber}` : "");
  const loPhone = loanOfficer?.phone || "";
  const loCompany = loanOfficer?.company || "";
  const agentName = agent?.name || lead.assignedAgent || "";
  const agentBrokerage = agent?.brokerage || (agent as any)?.company || "";
  const agentPhone = agent?.phone || "";

  const loSignLines: string[] = [loName];
  const loTitleParts = ["Senior Loan Officer", loNmls].filter(Boolean).join(" | ");
  if (loTitleParts) loSignLines.push(loTitleParts);
  if (loCompany) loSignLines.push(loCompany);
  if (loPhone) loSignLines.push(`📞 ${loPhone}`);
  const loSignBlock = loSignLines.join("\n");

  const agentSignLines: string[] = [];
  if (agentName) {
    agentSignLines.push(agentName);
    agentSignLines.push("Senior Real Estate Specialist");
    if (agentBrokerage) agentSignLines.push(agentBrokerage);
    if (agentPhone) agentSignLines.push(`📞 ${agentPhone}`);
  }
  const agentSignBlock = agentSignLines.join("\n");

  const advisorySupportText = (() => {
    const parts: string[] = [];
    if (loName) {
      const loDetails = [loNmls, loCompany].filter(Boolean).join(" - ");
      parts.push(`${loName}${loDetails ? ` (${loDetails})` : ""}`);
    }
    if (agentName) {
      const agDetails = [agentBrokerage, agentPhone ? `Phone: ${agentPhone}` : ""].filter(Boolean).join(", ");
      parts.push(`${agentName}${agDetails ? ` (${agDetails})` : ""}`);
    }
    if (parts.length === 0) return "Our mortgage team is here to guide you every step of the way.";
    return `${parts.join(" and ")} are here to guide you every step of the way. We can test additional purchase price bands, explore Oregon Down Payment Assistance (DPA) state grants, or structure seller concession rate buydowns before touring properties.`;
  })();

  const downPct = Math.round((profile.downPaymentSavings / Math.max(1, profile.targetPrice)) * 100 * 10) / 10;
  const formattedPrice = formatUSD(profile.targetPrice);
  const formattedDown = formatUSD(profile.downPaymentSavings);
  const formattedPITI = formatUSD(breakdown.totalMonthly);
  const formattedPI = formatUSD(breakdown.principalAndInterest);
  const formattedTaxes = formatUSD(breakdown.propertyTax);
  const formattedIns = formatUSD(breakdown.homeInsurance);
  const formattedPmi = formatUSD(breakdown.pmi);
  const formattedHoa = formatUSD(breakdown.hoa);
  const fDti = Number((breakdown as any).frontEndDTI ?? (breakdown as any).frontEndDti ?? 0);
  const bDti = Number((breakdown as any).backEndDTI ?? (breakdown as any).backEndDti ?? 0);

  // 1. Borrower Email
  const draftBorrowerEmailSubject = `Your Custom Home Purchase & Payment Scenario Breakdown (${formattedPrice} Target)`;
  
  let acceleratorSection = "";
  if (extraPrincipal && extraPrincipal > 0 && totalInterestSaved && yearsSaved) {
    acceleratorSection = `\n🚀 EARLY PAYOFF & WEALTH BUILDER ACCELERATOR:
By adding an extra ${formatUSD(extraPrincipal)}/month toward principal:
• Total Lifetime Interest Saved: ${formatUSD(totalInterestSaved)}
• Mortgage Paid Off: ${yearsSaved.toFixed(1)} years earlier!\n`;
  }

  const draftBorrowerEmailBody = `Hi ${firstName},

Following up on your homeownership goals and requested budget parameters, I ran an updated payment and affordability scenario for your requested price range and loan program to give you an exact, transparent picture of your options:

📊 SCENARIO SUMMARY:
• Target Purchase Price: ${formattedPrice}
• Loan Program: ${loanProgram} (${profile.loanTermYears}-Year Fixed @ ${profile.interestRate.toFixed(3)}%)
• Estimated Down Payment: ${formattedDown} (${downPct}%)
• Loan Amount: ${formatUSD(breakdown.loanAmount)}
${closingCosts ? `• Estimated Closing Costs & Prepaids: ${formatUSD(closingCosts)}\n` : ""}
💰 ITEMIZED MONTHLY PAYMENT (P.I.T.I.):
• Principal & Interest: ${formattedPI}/mo
• Estimated Property Taxes: ${formattedTaxes}/mo
• Homeowners Insurance: ${formattedIns}/mo
• Mortgage Insurance (PMI/MIP): ${formattedPmi}/mo
${breakdown.hoa > 0 ? `• HOA Dues: ${formattedHoa}/mo\n` : ""}• TOTAL ESTIMATED MONTHLY INVESTMENT: ${formattedPITI}/mo
${acceleratorSection}
🎯 CO-BRANDED ADVISORY SUPPORT:
${advisorySupportText}

Let's connect for 10 minutes to review these numbers or make any adjustments to match your exact comfort zone!

Warm regards,

${loSignBlock}
${agentSignBlock ? `\n${agentSignBlock}` : ""}`;

  // 2. Borrower SMS
  const draftBorrowerSmsText = `Hi ${firstName}, ${loName} here! I just ran your updated payment scenario for the ${formattedPrice} price point on a ${loanProgram} program (~${formattedPITI}/mo total PITI). Let me know if you'd like me to email you the complete itemized breakdown or test another price band!`;

  // 3. Realtor Co-Brand Email
  const draftRealtorEmailSubject = `Financing Scenario Update for Buyer: ${lead.fullName} (${formattedPrice} Purchasing Power)`;
  const agentGreetingName = agentName ? agentName.split(" ")[0] : "Partner";
  const draftRealtorEmailBody = `Hi ${agentGreetingName},

I just reviewed and structured an updated financing scenario for our shared buyer, ${lead.fullName}.

🔑 QUALIFICATION & PAYMENT OVERVIEW:
• Target Price Band: ${formattedPrice}
• Loan Program: ${loanProgram} (@ ${profile.interestRate.toFixed(3)}%)
• Down Payment Funds: ${formattedDown} (${downPct}%)
• Total Monthly Budget (PITI): ~${formattedPITI}/mo
• Front-End / Back-End DTI: ${fDti.toFixed(1)}% / ${bDti.toFixed(1)}%

${lead.grantInterest ? `• Grant Eligibility: Buyer is interested in state DPA assistance / seller concession closing cost credits.\n` : ""}
Feel free to show homes within this price bracket. Please let me know if you need a property-specific pre-approval letter for an active offer!

Best,

${loSignBlock}`;

  return {
    draftBorrowerEmailSubject,
    draftBorrowerEmailBody,
    draftBorrowerSmsText,
    draftRealtorEmailSubject,
    draftRealtorEmailBody
  };
}

/**
 * Creates a complete SavedScenario object ready to be appended to a lead record
 */
export function buildSavedScenario({
  lead,
  profile,
  breakdown,
  loanProgram,
  sourceTool,
  extraPrincipal,
  totalInterestSaved,
  yearsSaved,
  closingCosts,
  loanOfficer,
  agent,
  scenarioName,
  notes
}: {
  lead: CapturedLead;
  profile: FinancialProfile;
  breakdown: MonthlyMortgageBreakdown | {
    principalAndInterest: number;
    propertyTax: number;
    homeInsurance: number;
    pmi: number;
    hoa: number;
    totalMonthly: number;
    loanAmount: number;
    frontEndDTI?: number;
    backEndDTI?: number;
    frontEndDti?: number;
    backEndDti?: number;
  };
  loanProgram: string;
  sourceTool: 'calculator' | 'mortgagelab';
  extraPrincipal?: number;
  totalInterestSaved?: number;
  yearsSaved?: number;
  closingCosts?: number;
  loanOfficer?: LoanOfficerProfile;
  agent?: RealEstateAgentProfile;
  scenarioName?: string;
  notes?: string;
}): SavedScenario {
  const drafts = generateScenarioDrafts({
    lead,
    profile,
    breakdown,
    loanProgram,
    sourceTool,
    extraPrincipal,
    totalInterestSaved,
    yearsSaved,
    closingCosts,
    loanOfficer,
    agent
  });

  const downPct = Math.round((profile.downPaymentSavings / Math.max(1, profile.targetPrice)) * 100 * 10) / 10;
  const fDti = (breakdown as any).frontEndDTI ?? (breakdown as any).frontEndDti ?? 0;
  const bDti = (breakdown as any).backEndDTI ?? (breakdown as any).backEndDti ?? 0;

  return {
    id: `scen-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    sourceTool,
    scenarioName: scenarioName || `${loanProgram} @ ${formatUSD(profile.targetPrice)} (${formatUSD(breakdown.totalMonthly)}/mo)`,
    createdAt: new Date().toISOString(),
    targetPrice: profile.targetPrice,
    downPayment: profile.downPaymentSavings,
    downPaymentPercent: downPct,
    loanAmount: breakdown.loanAmount,
    loanProgram,
    interestRate: profile.interestRate,
    loanTermYears: profile.loanTermYears,
    monthlyPrincipalInterest: breakdown.principalAndInterest,
    monthlyPropertyTax: breakdown.propertyTax,
    monthlyHomeInsurance: breakdown.homeInsurance,
    monthlyPmi: breakdown.pmi,
    monthlyHoa: breakdown.hoa,
    totalMonthlyPayment: breakdown.totalMonthly,
    annualIncome: profile.annualIncome,
    monthlyDebt: profile.monthlyDebt,
    frontEndDti: fDti,
    backEndDti: bDti,
    extraMonthlyPrincipal: extraPrincipal,
    totalInterestSaved: totalInterestSaved,
    yearsSaved: yearsSaved,
    estimatedClosingCosts: closingCosts,
    notes: notes || "",
    ...drafts
  };
}
