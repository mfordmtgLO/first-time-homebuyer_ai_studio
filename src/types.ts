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

export interface FirstHomeDetails {
  available?: boolean;
  priceEligible?: boolean | null;
  lmiEligible?: boolean;
  areaType?: 'targeted' | 'non_targeted' | 'non-targeted' | string;
  priceLimit?: number;
  county?: string;
  targetedAreaDetails?: string;
}

export interface OverlayEligibility {
  usdaEligible?: boolean;
  usda?: boolean;
  usdaZoneName?: string;
  usdaInterpretation?: string;
  lmiEligible?: boolean;
  lmi?: boolean;
  lmiLevel?: 'Low' | 'Moderate' | string;
  lmiPercentage?: number; // e.g. 78% of AMI
  lmiCensusTract?: string;
  firstHomeEligible?: boolean;
  firstHomePriceCap?: number;
  targetedArea?: boolean;
  geoid?: string;
  countyName?: string;
  sourceDataset?: string;
  firstHome?: FirstHomeDetails;
}

export interface PropertyListing {
  id: string;
  title: string;
  address: string;
  city: string;
  county?: string;
  state: string;
  zip: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
  propertyType: 'Single Family' | 'Townhouse' | 'Condo' | 'Multi-Family' | 'Manufactured' | 'Mobile' | 'Land' | 'Other';
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
  walkScore?: number;
  isPubliclyPublished?: boolean;
  overlayEligibility?: OverlayEligibility;
  sourceGeoSphereId?: string;
  syncedAt?: string;
  mlsNumber?: string;
  mlsName?: string;
  zillowUrl?: string;
  listingAgent?: {
    name?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
  listingOffice?: {
    name?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
}

export interface GrantProgram {
  id: string;
  name: string;
  provider: string;
  scope: 'National' | 'State' | 'County';
  state?: string;
  assistanceType: 'Down Payment Assistance (DPA)' | 'Silent Second Loan' | 'Matched Savings' | 'Tax Credit (MCC)' | '0% Down Program';
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
  city?: string;
  county?: string;
  state?: string;
  isTeamMember?: boolean;
  recruitmentStatus?: 'New' | 'Contacted' | 'Scheduled Interview' | 'Onboarding' | 'Declined';
  outreachHistory?: { id: string; date: string; type: 'email' | 'sms'; subject?: string; content: string }[];
  email: string;
  phone: string;
  headshotUrl: string;
  bio: string;
  specialties: string[];
  bookingUrl: string;
  licenseStates: string[];
  websiteUrl?: string;
  yearsExperience?: number;
  production12MoVolume?: number;
  production12MoUnits?: number;
  licenseVerificationYear?: number;
  licenseLastVerifiedDate?: string;
  isAdmin?: boolean; // Mike Ford = true
  parentManagerId?: string;
  customSlug?: string;
  password?: string;
  passwordResetAuthorized?: boolean; // Must be authorized by Branch Manager (Mike Ford)
  passwordResetRequestedAt?: string;
  passwordResetAuthorizedAt?: string;
  passwordResetPin?: string;
  lastLogin?: string;
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
  agentType?: 'buyer_agent' | 'listing_agent' | 'dual_agent';
  experienceYears?: number;
  activeListingsCount?: number;
  rating?: number;
  websiteUrl?: string;
  socialLinks?: {
    zillow?: string;
    linkedin?: string;
    instagram?: string;
    facebook?: string;
  };
  assignedLoIds?: string[];
  customSlug?: string;
  aiGenerated?: boolean;
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

export interface CapturedLead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  preferredContactTime: string;
  timeline: string;
  targetPriceRange: string;
  targetMonthlyBudget: string;
  downPaymentSavings: string;
  grantInterest: boolean;
  creditScoreTier: string;
  annualIncome?: string;
  preferredLocations: string;
  propertyType: string;
  sendSampleHomes?: boolean;
  sendSampleHomesOption?: string;
  assignedLoId: string;
  assignedAgentId?: string;
  assignedLO?: string;
  assignedAgent?: string;
  pairingId?: string;
  leadSource: string;
  sourceCampaignId?: string;
  sourceCampaignName?: string;
  sourcePropertyId?: string;
  sourcePropertyAddress?: string;
  interactedSourceType?: 'campaign' | 'property_listing' | 'chatbot' | 'flyer' | 'calculator';
  taggedCityArea?: string;
  leadPathTag?: string;
  intentScore: 'hot' | 'warm' | 'exploring';
  status: 'new' | 'contacted' | 'pre_approved' | 'in_escrow' | 'closed' | 'archived';
  notes?: string;
  chatTranscript?: { sender: string; text: string; time: string }[];
  createdAt: string;
  nurtureSequenceEnabled?: boolean;
  nurtureSequenceStage?: 'new_welcome' | 'contacted_followup' | 'pre_approved_homehunt' | 'escrow_closing_prep' | 'closed_post_close' | 'paused';
  nurtureCurrentStep?: number;
  nurtureTotalSteps?: number;
  nurtureStageText?: string;
  lastEmailSentAt?: string;
  lastEmailTemplateName?: string;
  nurtureSequenceLogs?: { id: string; stageName: string; templateName?: string; emailSubject: string; sentAt: string; status: 'sent' | 'scheduled' | 'opened' }[];
  // SMS Text Messaging & TCPA Consent Fields
  smsConsentAuthorized?: boolean;
  smsConsentTimestamp?: string;
  smsConsentSource?: string;
  smsConsentIp?: string;
  smsAuthRequestSentAt?: string;
  smsOptOutTimestamp?: string;
  textNurtureEnabled?: boolean;
  textNurtureCurrentStep?: number;
  textNurtureTotalSteps?: number;
  textNurtureStageText?: string;
  lastTextSentAt?: string;
  lastTextTemplateName?: string;
  smsMessages?: { id: string; direction: 'inbound' | 'outbound'; text: string; timestamp: string; attachmentUrl?: string; attachmentType?: 'flyer' | 'property_list' | 'link'; attachmentTitle?: string; status?: 'delivered' | 'sent' | 'read' }[];
  textNurtureLogs?: { id: string; stepNumber: number; templateName: string; messageText: string; sentAt: string; status: 'delivered' | 'scheduled' | 'sent' }[];
}

export interface RecruitingCampaignStep {
  id: string;
  dayOffset: number;
  type: 'email' | 'sms';
  subject?: string;
  content: string;
}

export interface RecruitingCampaign {
  id: string;
  name: string;
  category?: string;
  targetAudience: string;
  description: string;
  steps: RecruitingCampaignStep[];
  performanceMetrics?: {
    sentCount: number;
    activeTalksCount: number;
    onboardedCount: number;
    avgTouchesToHire: number;
    avgJourneyDays: number;
    conversionScore: number;
  };
}

export interface ProfessionalGuidesState {
  currentUserId: string; // "lo-mike-ford" or a downstream LO id
  adminLoanOfficerId: string; // "lo-mike-ford"
  loanOfficers: LoanOfficerProfile[];
  loanOfficer: LoanOfficerProfile;
  agentRoster: RealEstateAgentProfile[];
  activeAgentId: string;
  isCoBranded?: boolean; // false for individual LO links (/mike-ford, /mford), true for pairings (/mike-and-sarah)
  pairings: LOPairing[];
  recruitingCampaigns: RecruitingCampaign[];
  socialCampaigns: SocialPushCampaign[];
  adCampaignDrafts: AdCampaignDraft[];
  leads?: CapturedLead[];
  syncedProperties?: PropertyListing[];
  smsTemplates?: SmsTemplate[];
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


export interface CurationTask {
  id: string;
  leadId: string;
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  sourceTag: string;
  requestedCityArea: string;
  targetPriceRange: string;
  grantInterest: boolean;
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  priority: 'urgent' | 'high' | 'normal';
  createdAt: string;
  completedAt?: string;
  matchedPropertyIds?: string[];
  assignedAgentId?: string;
  notes?: string;
}

export interface SmsTemplate {
  id: string;
  title: string;
  content: string;
  category: 'new_lead' | 'follow_up' | 'pre_approved' | 'in_escrow' | 'post_close' | 'custom';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

export interface EmailTemplate {
  id: string;
  title: string;
  subject: string;
  body: string; // HTML string
  tags?: string[]; // e.g. ['Welcome', 'Follow-up', 'Promotion', 'USDA']
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}
