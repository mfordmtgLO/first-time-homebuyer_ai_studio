import { FinancialProfile, MonthlyMortgageBreakdown, AmortizationPoint } from "../types";

/**
 * Calculates monthly principal and interest using standard mortgage formula:
 * M = P * [r(1+r)^n] / [(1+r)^n - 1]
 */
export function calculateMonthlyPI(principal: number, annualRatePercent: number, loanTermYears: number): number {
  if (principal <= 0) return 0;
  if (annualRatePercent <= 0) return principal / (loanTermYears * 12);

  const monthlyRate = annualRatePercent / 100 / 12;
  const numberOfPayments = loanTermYears * 12;

  const monthlyPayment =
    (principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  return Math.round(monthlyPayment);
}

/**
 * Calculates complete monthly mortgage breakdown including taxes, insurance, PMI, and HOA
 */
export function calculateMortgageBreakdown(profile: FinancialProfile): MonthlyMortgageBreakdown {
  const {
    annualIncome,
    monthlyDebt,
    downPaymentSavings,
    targetPrice,
    interestRate,
    loanTermYears,
    propertyTaxRate,
    annualHomeInsurance,
    monthlyHOA,
    pmiRate
  } = profile;

  const downPayment = Math.min(downPaymentSavings, targetPrice);
  const loanAmount = Math.max(0, targetPrice - downPayment);
  const downPaymentPercent = targetPrice > 0 ? (downPayment / targetPrice) * 100 : 0;

  const principalAndInterest = calculateMonthlyPI(loanAmount, interestRate, loanTermYears);
  const monthlyPropertyTax = Math.round((targetPrice * (propertyTaxRate / 100)) / 12);
  const monthlyInsurance = Math.round(annualHomeInsurance / 12);
  
  // PMI applies if down payment is less than 20%
  const monthlyPMI = downPaymentPercent < 20
    ? Math.round((loanAmount * (pmiRate / 100)) / 12)
    : 0;

  const totalMonthly = principalAndInterest + monthlyPropertyTax + monthlyInsurance + monthlyPMI + monthlyHOA;

  const monthlyGrossIncome = Math.max(1, annualIncome / 12);
  const frontEndDTI = Math.round((totalMonthly / monthlyGrossIncome) * 1000) / 10;
  const backEndDTI = Math.round(((totalMonthly + monthlyDebt) / monthlyGrossIncome) * 1000) / 10;

  // Maximum purchasing power calculation using back-end DTI caps
  // Max housing budget = (MonthlyGross * TargetDTI) - MonthlyDebt
  const maxHousingBudgetConservative = Math.max(0, (monthlyGrossIncome * 0.36) - monthlyDebt);
  const maxHousingBudgetModerate = Math.max(0, (monthlyGrossIncome * 0.43) - monthlyDebt);
  const maxHousingBudgetAggressive = Math.max(0, (monthlyGrossIncome * 0.45) - monthlyDebt);

  const maxSafePriceConservative = estimateHomePriceFromMonthlyBudget(
    maxHousingBudgetConservative,
    downPaymentSavings,
    interestRate,
    loanTermYears,
    propertyTaxRate,
    annualHomeInsurance,
    monthlyHOA,
    pmiRate
  );

  const maxSafePriceModerate = estimateHomePriceFromMonthlyBudget(
    maxHousingBudgetModerate,
    downPaymentSavings,
    interestRate,
    loanTermYears,
    propertyTaxRate,
    annualHomeInsurance,
    monthlyHOA,
    pmiRate
  );

  const maxSafePriceAggressive = estimateHomePriceFromMonthlyBudget(
    maxHousingBudgetAggressive,
    downPaymentSavings,
    interestRate,
    loanTermYears,
    propertyTaxRate,
    annualHomeInsurance,
    monthlyHOA,
    pmiRate
  );

  return {
    principalAndInterest,
    propertyTax: monthlyPropertyTax,
    homeInsurance: monthlyInsurance,
    pmi: monthlyPMI,
    hoa: monthlyHOA,
    totalMonthly,
    loanAmount,
    downPaymentPercent: Math.round(downPaymentPercent * 10) / 10,
    frontEndDTI,
    backEndDTI,
    maxSafePriceConservative,
    maxSafePriceModerate,
    maxSafePriceAggressive
  };
}

/**
 * Estimates max purchase price for a given target monthly housing budget
 */
export function estimateHomePriceFromMonthlyBudget(
  monthlyBudget: number,
  downPayment: number,
  interestRate: number,
  loanTermYears: number,
  taxRate: number,
  annualInsurance: number,
  hoa: number,
  pmiRate: number
): number {
  if (monthlyBudget <= 0) return downPayment;

  // Binary search for maximum price
  let low = downPayment;
  let high = 3000000;
  let result = low;

  for (let iter = 0; iter < 20; iter++) {
    const mid = Math.round((low + high) / 2);
    const loan = Math.max(0, mid - downPayment);
    const pi = calculateMonthlyPI(loan, interestRate, loanTermYears);
    const taxes = (mid * (taxRate / 100)) / 12;
    const insurance = annualInsurance / 12;
    const pmi = (downPayment / mid) < 0.2 ? (loan * (pmiRate / 100)) / 12 : 0;
    const total = pi + taxes + insurance + pmi + hoa;

    if (total <= monthlyBudget) {
      result = mid;
      low = mid + 1000;
    } else {
      high = mid - 1000;
    }
  }

  return Math.round(result / 1000) * 1000;
}

/**
 * Generates year-by-year amortization curve and accelerated payoff metrics
 */
export function calculateAmortizationCurve(
  loanAmount: number,
  interestRate: number,
  loanTermYears: number,
  extraMonthlyPrincipal: number = 0
): {
  schedule: AmortizationPoint[];
  standardTotalInterest: number;
  acceleratedTotalInterest: number;
  interestSaved: number;
  standardMonths: number;
  acceleratedMonths: number;
  yearsSaved: number;
} {
  const monthlyRate = interestRate / 100 / 12;
  const standardPayment = calculateMonthlyPI(loanAmount, interestRate, loanTermYears);

  // Standard simulation
  let balanceStandard = loanAmount;
  let cumulativeInterestStandard = 0;
  let monthsStandard = 0;
  const standardBalancesByYear: { balance: number; interest: number; principalPaid: number }[] = [];

  for (let m = 1; m <= loanTermYears * 12; m++) {
    if (balanceStandard <= 0) break;
    const interest = balanceStandard * monthlyRate;
    const principal = Math.min(balanceStandard, standardPayment - interest);
    cumulativeInterestStandard += interest;
    balanceStandard -= principal;
    monthsStandard = m;

    if (m % 12 === 0 || balanceStandard <= 0) {
      standardBalancesByYear.push({
        balance: Math.max(0, Math.round(balanceStandard)),
        interest: Math.round(cumulativeInterestStandard),
        principalPaid: Math.round(loanAmount - Math.max(0, balanceStandard))
      });
    }
  }

  // Accelerated simulation
  let balanceAccelerated = loanAmount;
  let cumulativeInterestAccelerated = 0;
  let monthsAccelerated = 0;
  const acceleratedBalancesByYear: { balance: number; interest: number; principalPaid: number }[] = [];

  for (let m = 1; m <= loanTermYears * 12; m++) {
    if (balanceAccelerated <= 0) {
      if (m % 12 === 0) {
        acceleratedBalancesByYear.push({
          balance: 0,
          interest: Math.round(cumulativeInterestAccelerated),
          principalPaid: loanAmount
        });
      }
      continue;
    }
    const interest = balanceAccelerated * monthlyRate;
    const principal = Math.min(balanceAccelerated, standardPayment + extraMonthlyPrincipal - interest);
    cumulativeInterestAccelerated += interest;
    balanceAccelerated -= principal;
    monthsAccelerated = m;

    if (m % 12 === 0 || balanceAccelerated <= 0) {
      acceleratedBalancesByYear.push({
        balance: Math.max(0, Math.round(balanceAccelerated)),
        interest: Math.round(cumulativeInterestAccelerated),
        principalPaid: Math.round(loanAmount - Math.max(0, balanceAccelerated))
      });
    }
  }

  const schedule: AmortizationPoint[] = [];
  const maxYears = Math.min(loanTermYears, Math.max(standardBalancesByYear.length, acceleratedBalancesByYear.length));

  for (let y = 0; y < maxYears; y++) {
    const std = standardBalancesByYear[y] || { balance: 0, interest: cumulativeInterestStandard, principalPaid: loanAmount };
    const acc = acceleratedBalancesByYear[y] || { balance: 0, interest: cumulativeInterestAccelerated, principalPaid: loanAmount };

    schedule.push({
      year: y + 1,
      balanceStandard: std.balance,
      balanceAccelerated: acc.balance,
      cumulativeInterestStandard: std.interest,
      cumulativeInterestAccelerated: acc.interest,
      principalPaidStandard: std.principalPaid,
      principalPaidAccelerated: acc.principalPaid
    });
  }

  const interestSaved = Math.max(0, Math.round(cumulativeInterestStandard - cumulativeInterestAccelerated));
  const monthsSaved = Math.max(0, monthsStandard - monthsAccelerated);
  const yearsSaved = Math.round((monthsSaved / 12) * 10) / 10;

  return {
    schedule,
    standardTotalInterest: Math.round(cumulativeInterestStandard),
    acceleratedTotalInterest: Math.round(cumulativeInterestAccelerated),
    interestSaved,
    standardMonths: monthsStandard,
    acceleratedMonths: monthsAccelerated,
    yearsSaved
  };
}

/**
 * Calculates estimated closing costs itemized
 */
export function calculateClosingCosts(purchasePrice: number, loanAmount: number) {
  const originationFee = Math.round(loanAmount * 0.008); // 0.8%
  const appraisalFee = 550;
  const homeInspection = 450;
  const titleInsuranceAndSearch = Math.round(purchasePrice * 0.005 + 400);
  const recordingAndTransferTaxes = Math.round(purchasePrice * 0.006);
  const prepaidEscrowsAndInsurance = Math.round((purchasePrice * 0.012 / 12) * 4 + (1200 / 12) * 14); // 4 mo taxes + 14 mo insurance
  const lenderUnderwritingDocFee = 850;

  const totalEstimatedClosingCosts =
    originationFee +
    appraisalFee +
    homeInspection +
    titleInsuranceAndSearch +
    recordingAndTransferTaxes +
    prepaidEscrowsAndInsurance +
    lenderUnderwritingDocFee;

  const percentOfLoan = Math.round((totalEstimatedClosingCosts / loanAmount) * 1000) / 10;

  return {
    originationFee,
    appraisalFee,
    homeInspection,
    titleInsuranceAndSearch,
    recordingAndTransferTaxes,
    prepaidEscrowsAndInsurance,
    lenderUnderwritingDocFee,
    totalEstimatedClosingCosts,
    percentOfLoan
  };
}

/**
 * 10-Year Rent vs Buy Wealth & Equity comparison
 */
export function calculateRentVsBuy(
  homePrice: number,
  downPayment: number,
  monthlyRent: number,
  appreciationRate: number = 3.0, // 3.0% per year
  rentGrowthRate: number = 2.0, // 2.0% per year
  interestRate: number = 6.625
) {
  const loanAmount = homePrice - downPayment;
  const standardPI = calculateMonthlyPI(loanAmount, interestRate, 30);
  const monthlyPropertyTax = (homePrice * 0.012) / 12;
  const monthlyInsurance = 110;
  const initialMonthlyBuy = standardPI + monthlyPropertyTax + monthlyInsurance + (downPayment / homePrice < 0.2 ? (loanAmount * 0.007) / 12 : 0);

  const timeline = [];
  let currentHomeValue = homePrice;
  let currentRent = monthlyRent;
  let totalRentPaid = 0;
  let totalBuyPaid = 0;
  let currentLoanBalance = loanAmount;
  const monthlyRate = interestRate / 100 / 12;

  for (let year = 1; year <= 10; year++) {
    // 12 months in this year
    for (let m = 1; m <= 12; m++) {
      totalRentPaid += currentRent;
      totalBuyPaid += initialMonthlyBuy + (currentHomeValue * 0.008) / 12; // + 0.8% maintenance

      const interestPayment = currentLoanBalance * monthlyRate;
      const principalPayment = standardPI - interestPayment;
      currentLoanBalance = Math.max(0, currentLoanBalance - principalPayment);
    }

    currentHomeValue *= (1 + appreciationRate / 100);
    currentRent *= (1 + rentGrowthRate / 100);

    const homeEquity = Math.round(currentHomeValue - currentLoanBalance);
    const netHomeWealth = Math.round(homeEquity - totalBuyPaid + downPayment);

    // If renter invested the down payment + monthly difference in a 6% index fund
    timeline.push({
      year,
      homeValue: Math.round(currentHomeValue),
      loanBalance: Math.round(currentLoanBalance),
      homeEquity,
      totalRentPaid: Math.round(totalRentPaid),
      totalBuyPaid: Math.round(totalBuyPaid),
      netHomeWealth
    });
  }

  return timeline;
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export type LoanProgramType = "conventional" | "fha" | "usda" | "va";

export interface IPCLimitResult {
  loanProgram: LoanProgramType;
  programName: string;
  ltv: number;
  downPaymentPercent: number;
  maxIPCPercent: number;
  maxIPCDollar: number;
  closingBufferAmount: number;
  requestedConcessionDollar: number;
  requestedConcessionPercent: number;
  appliedConcessionDollar: number;
  excessOverProgramCap: number;
  excessOverClosingBuffer: number;
  isCappedByProgram: boolean;
  isCappedByClosingBuffer: boolean;
  regulatorySource: string;
  guidelineSummary: string;
}

/**
 * Calculates official Interested Party Contribution (IPC) and Seller Concession limits
 * according to Fannie Mae, Freddie Mac, FHA (HUD 4000.1), USDA RD (HB-1-3555), and VA guidelines.
 */
export function calculateIPCLimits(params: {
  loanProgram: LoanProgramType;
  targetPrice: number;
  downPaymentAmount: number;
  requestedConcessionAmount: number;
  closingBufferAmount: number;
}): IPCLimitResult {
  const { loanProgram, targetPrice, downPaymentAmount, requestedConcessionAmount, closingBufferAmount } = params;

  const sanitizedPrice = Math.max(1, targetPrice);
  const downPaymentPercent = targetPrice > 0 ? (downPaymentAmount / targetPrice) * 100 : 0;
  const ltv = Math.max(0, Math.min(100, 100 - downPaymentPercent));
  const requestedConcessionPercent = targetPrice > 0 ? (requestedConcessionAmount / targetPrice) * 100 : 0;

  let maxIPCPercent = 3;
  let programName = "Conventional Loan";
  let regulatorySource = "Fannie Mae Selling Guide B3-4.1-02 / Freddie Mac 5501.5";
  let guidelineSummary = "";

  switch (loanProgram) {
    case "conventional":
      if (ltv > 90) {
        maxIPCPercent = 3;
        guidelineSummary = "Conventional loans with LTV > 90% (< 10% down) cap seller contributions at 3% maximum.";
      } else if (ltv > 80) {
        maxIPCPercent = 6;
        guidelineSummary = "Conventional loans with LTV > 80% to 90% (10% to 19.99% down) cap seller contributions at 6% maximum.";
      } else {
        maxIPCPercent = 9;
        guidelineSummary = "Conventional loans with LTV ≤ 80% (≥ 20% down) allow seller contributions up to 9% maximum.";
      }
      programName = `Conventional (${ltv.toFixed(1)}% LTV)`;
      break;

    case "fha":
      maxIPCPercent = 6;
      programName = "FHA Loan";
      regulatorySource = "HUD Handbook 4000.1 Section II.A.4.d.iii";
      guidelineSummary = "FHA allows seller/interested party contributions up to 6% of the sales price or appraised value.";
      break;

    case "usda":
      maxIPCPercent = 6;
      programName = "USDA Rural Development (RD)";
      regulatorySource = "USDA HB-1-3555 Chapter 6 Section 6.3";
      guidelineSummary = "USDA RD loans cap interested party contributions at 6% of the total acquisition price.";
      break;

    case "va":
      maxIPCPercent = 4;
      programName = "VA Home Loan";
      regulatorySource = "VA Lenders Handbook Pamphlet 26-7 Chapter 8";
      guidelineSummary = "VA limits seller concessions (debt payoff, buydowns, funding fee) to 4% of property value (plus customary buyer closing costs).";
      break;
  }

  const maxIPCDollar = Math.round(sanitizedPrice * (maxIPCPercent / 100));
  
  // Limiter 1: Regulatory Program Maximum
  const allowableUnderProgram = Math.min(requestedConcessionAmount, maxIPCDollar);
  const excessOverProgramCap = Math.max(0, requestedConcessionAmount - maxIPCDollar);
  const isCappedByProgram = requestedConcessionAmount > maxIPCDollar;

  // Limiter 2: Closing Costs & Prepaids Buffer (Seller credits cannot pay minimum down payment)
  const appliedConcessionDollar = Math.min(allowableUnderProgram, closingBufferAmount);
  const excessOverClosingBuffer = Math.max(0, allowableUnderProgram - closingBufferAmount);
  const isCappedByClosingBuffer = allowableUnderProgram > closingBufferAmount;

  return {
    loanProgram,
    programName,
    ltv,
    downPaymentPercent,
    maxIPCPercent,
    maxIPCDollar,
    closingBufferAmount,
    requestedConcessionDollar: requestedConcessionAmount,
    requestedConcessionPercent,
    appliedConcessionDollar,
    excessOverProgramCap,
    excessOverClosingBuffer,
    isCappedByProgram,
    isCappedByClosingBuffer,
    regulatorySource,
    guidelineSummary,
  };
}
