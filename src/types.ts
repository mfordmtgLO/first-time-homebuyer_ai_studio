export interface FinancialProfile {
  annualIncome: number;
  monthlyDebt: number;
  downPaymentSavings: number;
  creditScore: number;
  targetPrice: number;
  interestRate: number;
  loanTermYears: number;
  propertyTaxRate: number; // e.g. 1.2%
  annualHomeInsurance: number;
  monthlyHOA: number;
  state: string;
  pmiRate: number; // e.g. 0.75%
  targetMaxMonthlyPayment?: number; // Self-restricted max monthly payment goal
}

export interface MonthlyMortgageBreakdown {
  principalAndInterest: number;
  propertyTax: number;
  homeInsurance: number;
  pmi: number;
  hoa: number;
  totalMonthly: number;
  loanAmount: number;
  downPaymentPercent: number;
  frontEndDTI: number;
  backEndDTI: number;
  maxSafePriceConservative: number; // 28/36 rule
  maxSafePriceModerate: number; // 33/43 rule
  maxSafePriceAggressive: number; // 36/45 rule
}

export interface TourScorecard {
  roofAndExterior: number; // 1-10
  foundationAndStructure: number; // 1-10
  hvacAndElectrical: number; // 1-10
  plumbingAndWaterPressure: number; // 1-10
  kitchenAndBathrooms: number; // 1-10
  layoutAndNaturalLight: number; // 1-10
  neighborhoodAndSafety: number; // 1-10
  parkingAndAccess: number; // 1-10
  noiseAndSurroundings: number; // 1-10
  estimatedRenovationCost: number; // USD
  redFlags: string[];
  positives: string[];
  overallRating: number; // calculated score
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
}

export interface PropertyListing {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
  propertyType: 'Single Family' | 'Townhouse' | 'Condo' | 'Multi-Family';
  imageUrl: string;
  galleryUrls?: string[];
  status: 'saved' | 'touring' | 'offered' | 'under_contract' | 'passed';
  notes: string;
  tourDate?: string;
  daysOnMarket: number;
  hoaMonthly: number;
  propertyTaxAnnual: number;
  scorecard?: TourScorecard;
  isFavorite: boolean;
}

export interface GrantProgram {
  id: string;
  name: string;
  provider: string;
  scope: 'National' | 'State' | 'County';
  state?: string;
  assistanceType: 'Forgivable Grant' | 'Silent Second Loan' | 'Matched Savings' | 'Tax Credit (MCC)' | '0% Down Program';
  maxAssistance: string;
  incomeLimitDescription: string;
  minCreditScore: number;
  firstTimeBuyerRequired: boolean;
  description: string;
  link: string;
  highlights: string[];
}

export interface RoadmapMilestone {
  id: string;
  stepNumber: number;
  stage: 'Readiness' | 'Financing' | 'Hunting' | 'Contract' | 'Closing';
  title: string;
  summary: string;
  duration: string;
  completed: boolean;
  tasks: { id: string; text: string; done: boolean }[];
  keyTips: string[];
  commonPitfalls: string[];
}

export interface DocumentItem {
  id: string;
  title: string;
  category: 'Income & Taxes' | 'Assets & Bank' | 'Identification & Credit' | 'Property & Contract';
  required: boolean;
  status: 'pending' | 'ready' | 'submitted';
  description: string;
  acceptedFormats: string;
}

export interface EscrowMilestone {
  id: string;
  dayTarget: string; // e.g. "Day 1-3"
  title: string;
  status: 'upcoming' | 'in_progress' | 'completed';
  description: string;
  actionItems: string[];
  criticalDeadline: boolean;
}

export interface GlossaryTerm {
  term: string;
  category: 'Mortgage & Rates' | 'Closing & Legal' | 'Property & Inspection' | 'Financial & DTI';
  definition: string;
  whyItMatters: string;
  proTip: string;
}

export interface LoanOfficerAdSettings {
  metaAdAccountId?: string;
  metaPixelId?: string;
  metaAccessToken?: string;
  googleCustomerId?: string;
  googleConversionId?: string;
  targetCities?: string[];
  dailyBudgetUSD?: number;
  adSpendMonthlyCap?: number;
  creditCardConfigured?: boolean;
}

export interface LoanOfficerProfile {
  id: string;
  name: string;
  title: string;
  nmlsId: string;
  company: string;
  branch?: string;
  email: string;
  phone: string;
  headshotUrl: string;
  bio: string;
  specialties: string[];
  bookingUrl: string;
  licenseStates: string[];
  isAdmin?: boolean; // Mike Ford = true
  parentManagerId?: string;
  customSlug?: string;
  adSettings?: LoanOfficerAdSettings;
}

export interface RealEstateAgentProfile {
  id: string;
  name: string;
  title: string;
  brokerage: string;
  licenseNumber: string;
  email: string;
  phone: string;
  headshotUrl: string;
  bio: string;
  specialties: string[];
  marketAreas: string[];
  websiteUrl?: string;
  assignedLoIds?: string[];
  customSlug?: string;
}

export interface LOPairing {
  id: string;
  loId: string;
  agentId: string;
  title: string;
  customSlug?: string;
  campaignTag?: string;
  notes?: string;
  createdAt: string;
  active: boolean;
  totalViews?: number;
  totalLeads?: number;
}

export interface SocialPushCampaign {
  id: string;
  platform: 'facebook' | 'instagram' | 'tiktok' | 'linkedin' | 'crm_email' | 'crm_sms';
  senderMode: 'lo' | 'agent' | 'dual';
  loId: string;
  agentId: string;
  title: string;
  topic: string;
  hook: string;
  bodyCopy: string;
  hashtags: string[];
  shareUrl: string;
  status: 'draft' | 'pushed' | 'scheduled';
  createdAt: string;
}

export interface AdCampaignDraft {
  id: string;
  platform: 'meta' | 'google';
  loId: string;
  agentId: string;
  campaignName: string;
  headline: string;
  secondaryHeadlines?: string[];
  primaryText: string;
  descriptionText: string;
  targetUrl: string;
  dailyBudget: number;
  targetLocations: string[];
  keywords?: string[];
  specialHousingCategory: boolean;
  adObjective: 'LEAD_GENERATION' | 'TRAFFIC' | 'CONVERSIONS';
  status: 'ready_to_launch' | 'draft' | 'live';
  lastSaved: string;
}

export interface ProfessionalGuidesState {
  currentUserId: string; // "lo-mike-ford" or a downstream LO id
  adminLoanOfficerId: string; // "lo-mike-ford"
  loanOfficers: LoanOfficerProfile[];
  loanOfficer: LoanOfficerProfile;
  agentRoster: RealEstateAgentProfile[];
  activeAgentId: string;
  pairings: LOPairing[];
  socialCampaigns: SocialPushCampaign[];
  adCampaignDrafts: AdCampaignDraft[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'advisor';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
}

export interface AmortizationPoint {
  year: number;
  balanceStandard: number;
  balanceAccelerated: number;
  cumulativeInterestStandard: number;
  cumulativeInterestAccelerated: number;
  principalPaidStandard: number;
  principalPaidAccelerated: number;
}
