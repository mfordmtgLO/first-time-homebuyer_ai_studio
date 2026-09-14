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
  priceAlertEnabled?: boolean;
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
  lakeviewNationalEligible?: boolean;
  lakeviewNational?: boolean;
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
  originalPrice?: number;
  priceDropAmount?: number;
  priceDropDate?: string;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
  propertyType: 'Single Family' | 'Townhouse' | 'Condo' | 'Multi-Family' | 'Manufactured' | 'Mobile' | 'Land' | 'Other';
  imageUrl?: string;
  galleryUrls?: string[];
  images?: string[];
  status: 'saved' | 'touring' | 'offered' | 'under_contract' | 'passed';
  notes: string;
  tourDate?: string;
  daysOnMarket: number;
  hoaMonthly: number;
  propertyTaxAnnual: number;
  scorecard?: TourScorecard;
  isFavorite: boolean;
  walkScore?: number;
  lat?: number;
  lng?: number;
  schoolDistrict?: string;
  assignedSchools?: {
    name: string;
    type: 'Elementary' | 'Middle' | 'High';
    rating: number;
    distanceMiles: number;
  }[];
  nearbyAmenities?: {
    name: string;
    category: 'transit' | 'school' | 'grocery' | 'park' | 'health' | 'dining';
    distanceMiles: number;
    walkTimeMinutes: number;
  }[];
  homebuyingReadiness?: {
    score: number;
    tier: 'High' | 'Moderate' | 'Developing';
    label: string;
    positiveFactors: string[];
    cautionFactors: string[];
  };
  isPubliclyPublished?: boolean;
  overlayEligibility?: OverlayEligibility;
  sourceGeoSphereId?: string;
  isLiveGeoSphere?: boolean;
  sourceDataset?: string;
  syncedAt?: string;
  mlsNumber?: string;
  mlsName?: string;
  zillowUrl?: string;
  priceAlertEnabled?: boolean;
  previousPrice?: number;
  listingAgent?: {
    id?: string;
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
  priceHistory?: { date: string; price: number; event: string }[];
  matchedRosterAgent?: {
    id: string;
    name: string;
    brokerage: string;
    headshotUrl?: string;
    email?: string;
    phone?: string;
    licenseNumber?: string;
    matchMethod?: 'name' | 'email' | 'phone' | 'fuzzy';
  };
  isRosterAgentMatched?: boolean;
  isLoAgentPair?: boolean;
  loPairing?: {
    id: string;
    title: string;
    loId: string;
    loName: string;
    agentId: string;
    agentName: string;
    customSlug: string;
    campaignTag?: string;
  };
  vantageAdsEngineStatus?: 'idle' | 'queued' | 'in_creation' | 'ready_for_review' | 'synced_to_ads_portal';
  vantageAdsEngineBatchId?: string;
  vantageAdsEngineLastSynced?: string;
}

export interface VantageCoBrandedAdKit {
  id: string;
  propertyId: string;
  propertyAddress: string;
  propertyCity: string;
  propertyPrice: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  imageUrl?: string;
  loId: string;
  loName: string;
  loNmls: string;
  loPhone: string;
  loHeadshotUrl: string;
  agentId: string;
  agentName: string;
  agentBrokerage: string;
  agentLicense: string;
  agentPhone: string;
  agentHeadshotUrl: string;
  pairingId: string;
  coBrandSlug: string;
  coBrandUrl: string;
  metaAd: {
    headline: string;
    hook: string;
    primaryText: string;
    description: string;
    cta: string;
    targetUrl: string;
  };
  googleAd: {
    headlines: string[];
    descriptions: string[];
    sitelinks: { title: string; url: string }[];
    finalUrl: string;
  };
  videoScript: {
    hook: string;
    estimatedSeconds: number;
    scenes: {
      sceneNumber: number;
      durationSec: number;
      visual: string;
      narration: string;
      onScreenText: string;
    }[];
    videoUrl?: string;
    captionText: string;
    hashtags: string[];
  };
  queueStatus: 'queued_for_mktg' | 'in_creation' | 'ready_for_review' | 'synced_to_ads_portal';
  assignedRole: 'mktg_ads_creator' | 'loa' | 'loan_officer';
  createdByRole: string;
  completedBy?: string;
  completedAt?: string;
  timestamp: string;
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

export interface MilestoneNotificationHistoryItem {
  id: string;
  milestoneId: string;
  milestoneTitle: string;
  stepNumber: number;
  sentAt: string;
  recipientEmail: string;
  progressPercent: number;
  subject: string;
  status: 'sent' | 'simulated' | 'failed';
}

export interface MilestoneEmailAlertSettings {
  enabled: boolean;
  recipientEmail: string;
  recipientName?: string;
  includeProperties: boolean;
  includeNextSteps: boolean;
  includeFinancialSnapshot: boolean;
  lastNotifiedMilestoneId?: string;
  lastNotifiedAt?: string;
  history: MilestoneNotificationHistoryItem[];
}

export interface DocumentItem {
  id: string;
  title: string;
  category: 'Income & Taxes' | 'Assets & Bank' | 'Identification & Credit' | 'Property & Contract';
  required: boolean;
  status: 'pending' | 'ready' | 'submitted';
  description: string;
  acceptedFormats: string;
  fileUrl?: string;
  driveFileId?: string;
  driveMimeType?: string;
  driveWebViewLink?: string;
  importedFrom?: 'google_drive' | 'google_docs' | 'firebase' | 'upload' | 'sample';
  ragProcessed?: boolean;
  importedAt?: string;
  fileSizeFormatted?: string;
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

export interface CoClosedBusinessPartner {
  partnerId?: string;
  partnerName: string;
  partnerCompanyOrBrokerage: string;
  partnerRole: 'agent' | 'loan_officer';
  closedUnits12Mo: number;
  closedVolume12Mo: number; // in dollars e.g. 8450000
  partnerHeadshotUrl?: string;
  partnerNmlsOrLicense?: string;
  partnerEmail?: string;
  partnerPhone?: string;
  buysideSharePct?: number;
  notes?: string;
}

export interface LoanOfficerProfile {
  accountRestricted?: boolean;
  accountRestrictedAt?: string;
  enrichmentStatus?: 'none' | 'syncing' | 'enriched';
  topRealtorPartners?: { name: string; volume: number; company: string }[];
  topPartners12Mo?: CoClosedBusinessPartner[];
  nmlsNumber?: string;
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
  teamStarStatus?: 'red' | 'blue' | 'green';
  recruitmentStatus?: 'Not Contacted' | 'In Outreach' | 'Interested' | 'Meeting Scheduled' | 'Declined' | 'Hired';
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
  leadGenFormUrl?: string;
  leadGenQrCodeUrl?: string;
  password?: string;
  passwordResetAuthorized?: boolean; // Must be authorized by Branch Manager (Mike Ford)
  passwordResetRequestedAt?: string;
  passwordResetAuthorizedAt?: string;
  passwordResetPin?: string;
  lastLogin?: string;
  themePreference?: 'dark' | 'light' | 'system';
  adSettings?: LoanOfficerAdSettings;
  bigPurpleDotId?: string;
  bigPurpleDotStatus?: 'synced' | 'pending' | 'error' | 'not_synced';
  bigPurpleDotLastSynced?: string;
  bigPurpleDotNotes?: string;
  realTrendsVerified?: boolean;
  realTrendsRank?: string;
  realTrendsVolume?: number;
  realTrendsUnits?: number;
  realTrendsYear?: number;
  emailHistory?: EmailHistoryItem[];
  marketNewsSpotlightAgentId?: string;
}

export interface EmailHistoryItem {
  id: string;
  timestamp: string;
  templateType: string;
  subject?: string;
  channel?: 'portal_email' | 'gmail' | 'outlook' | 'nurture_auto' | 'custom' | 'sms';
  recipientEmail?: string;
  recipientName?: string;
  sentBy?: string;
  status?: 'sent' | 'delivered' | 'opened' | 'drafted';
  notes?: string;
  flyerNames?: string[];
}

export interface OutreachLog {
  id: string;
  timestamp: string;
  channel: 'email' | 'sms' | 'system';
  templateName: string;
  subject?: string;
  recipientName: string;
  notes?: string;
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
  activeAdCounties?: string[];
  agentType?: 'buyer_agent' | 'listing_agent' | 'dual_agent';
  experienceYears?: number;
  production12MoVolume?: number;
  production12MoUnits?: number;
  buysideVolume12Mo?: number;
  buysideUnits12Mo?: number;
  listingVolume12Mo?: number;
  listingUnits12Mo?: number;
  buysideSharePct?: number;
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
  outreachLogs?: OutreachLog[];
  recruitmentStatus?: 'Not Contacted' | 'In Outreach' | 'Interested' | 'Meeting Scheduled' | 'Partner Active' | 'Declined';
  bigPurpleDotId?: string;
  bigPurpleDotStatus?: 'synced' | 'pending' | 'error' | 'not_synced';
  bigPurpleDotLastSynced?: string;
  bigPurpleDotNotes?: string;
  realTrendsVerified?: boolean;
  realTrendsRank?: string;
  realTrendsSides?: number;
  realTrendsVolume?: number;
  realTrendsYear?: number;
  realTrendsCategory?: string;
  emailHistory?: EmailHistoryItem[];
  topPartners12Mo?: CoClosedBusinessPartner[];
  mlsAffiliation?: 'RMLS' | 'WVMLS' | 'CESMLS' | 'SOMLS' | string;
  mlsAreas?: string[];
  licensedCounties?: string[];
}

export interface Top50Candidate {
  rank: number;
  previousRank?: number;
  rankDelta?: number; // positive = climbed spots (e.g. +2), negative = dropped spots (e.g. -3), 0 = unchanged
  isNewEntry?: boolean;
  id: string;
  name: string;
  title: string;
  company: string;
  officeLocation: string;
  city: string;
  state: string;
  licenseOrNmls: string;
  email: string;
  phone: string;
  headshotUrl: string;
  yearsExperience: number;
  production12MoVolume: number;
  production12MoUnits: number;
  buysideSharePct: number;
  buysideVolume12Mo: number;
  buysideUnits12Mo: number;
  listingVolume12Mo: number;
  listingUnits12Mo: number;
  accoladeRank: string;
  accoladeVerified: boolean;
  source: 'active_pipeline' | 'organic_web_sweep';
  inActivePipeline: boolean;
  pipelineStatus?: string;
  candidateType: 'loan_officer' | 'real_estate_agent';
  lastSweptAt: string;
}

export interface BigPurpleDotConfig {
  apiKey: string;
  apiSecret: string;
  subdomain: string;
  accountEmail: string;
  webhookSecret: string;
  environment: 'sandbox' | 'production';
  autoSyncRecruits: boolean;
  syncLoanOfficers: boolean;
  syncRealEstateAgents: boolean;
  syncDirection: 'bi_directional' | 'push_only' | 'pull_only';
  lastSyncedAt?: string;
  connectionStatus: 'not_configured' | 'connected' | 'error' | 'testing';
  lastStatusMessage?: string;
  loStageMapping?: Record<string, string>;
  agentStageMapping?: Record<string, string>;
  webhookEventsSubscribed?: string[];
}

export interface BigPurpleDotWebhookEvent {
  id: string;
  timestamp: string;
  event: string;
  status: 'received' | 'processed' | 'failed';
  candidateName?: string;
  candidateType?: 'loan_officer' | 'real_estate_agent' | 'lead';
  source?: string;
  payloadSummary?: string;
  details?: any;
  ownerLoId?: string;
}

export type { RbacRole, RbacPermissions, RbacRoleDefinition, WhitelistedUserRecord } from "./utils/rbac";

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
  isCompliancePaused?: boolean;
  leadCap?: number;
  currentLeads?: number;
  auditLog?: CampaignAuditEntry[];
  keywords?: string[];
  specialHousingCategory: boolean;
  adObjective: 'LEAD_GENERATION' | 'TRAFFIC' | 'CONVERSIONS';
  status: 'ready_to_launch' | 'draft' | 'live';
  lastSaved: string;
}

export interface SavedScenario {
  id: string;
  sourceTool: 'calculator' | 'mortgagelab';
  scenarioName: string;
  createdAt: string;
  targetPrice: number;
  downPayment: number;
  downPaymentPercent: number;
  loanAmount: number;
  loanProgram: string;
  interestRate: number;
  loanTermYears: number;
  monthlyPrincipalInterest: number;
  monthlyPropertyTax: number;
  monthlyHomeInsurance: number;
  monthlyPmi: number;
  monthlyHoa: number;
  totalMonthlyPayment: number;
  annualIncome?: number;
  monthlyDebt?: number;
  frontEndDti?: number;
  backEndDti?: number;
  extraMonthlyPrincipal?: number;
  totalInterestSaved?: number;
  yearsSaved?: number;
  estimatedClosingCosts?: number;
  notes?: string;
  draftBorrowerEmailSubject: string;
  draftBorrowerEmailBody: string;
  draftBorrowerSmsText: string;
  draftRealtorEmailSubject: string;
  draftRealtorEmailBody: string;
}

export interface CapturedLead {
  // Conversational Ask Maps / Google Maps Sync
  savedGoogleMapsToken?: string;
  curatedPropertyIds?: string[];
  lastAskMapsQuery?: string;
  hasOptedInToGoogleMapsSync?: boolean;

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
  savedScenarios?: SavedScenario[];
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
  outreachLogs?: OutreachLog[];
  emailHistory?: EmailHistoryItem[];
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
  bigPurpleDotConfig?: BigPurpleDotConfig;
  bigPurpleDotEvents?: BigPurpleDotWebhookEvent[];
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

export interface PublicWebsiteMetadata {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  canonicalUrl: string;
  robots: string; // "index, follow" | "noindex, nofollow"
  author: string;
  
  // Open Graph (Facebook, LinkedIn, iMessage, WhatsApp)
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  ogSiteName: string;
  
  // Twitter / X Card
  twitterCard: "summary_large_image" | "summary";
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterSite?: string;

  // Structured Data / Schema.org (JSON-LD)
  enableStructuredData?: boolean;
  businessName?: string;
  nmlsId?: string;
  phone?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  streetAddress?: string;
  
  // Audit / Save Info
  lastUpdated?: string;
  updatedBy?: string;
}

// CRM & RBAC Asset Access Audit Log Definitions
export type AuditAssetCategory = 'api_keys' | 'webhooks' | 'customer_pii' | 'rbac_admin';

export type AuditActionType = 
  | 'view_secret'
  | 'rotate_key'
  | 'update_webhook'
  | 'dispatch_webhook'
  | 'view_lead_pii'
  | 'export_lead_data'
  | 'inspect_tcpa_cert'
  | 'lateral_access_blocked'
  | 'modify_role'
  | 'whitelist_member'
  | 'security_hardening';

export type AuditLogStatus = 'granted' | 'blocked' | 'flagged' | 'elevated';
export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface CrmAuditLogEntry {
  id: string;
  timestamp: string; // ISO 8601 string
  actorEmail: string;
  actorName: string;
  actorRole: 'admin' | 'branch_manager' | 'sales_manager' | 'loan_officer' | 'senior_lo' | 'team_lo' | 'processor';
  actionType: AuditActionType;
  actionLabel: string;
  assetCategory: AuditAssetCategory;
  assetName: string;
  targetAssetId?: string;
  status: AuditLogStatus;
  severity: AuditSeverity;
  ipAddress: string;
  userAgent?: string;
  details: string;
  rbacPolicyRule: string;
  integrityHash: string; // SHA-256 tamper-evident hash
  previousHash?: string; // Cryptographic hash link to previous audit log entry (Hash Chain)
  sequenceIndex?: number; // Monotonically increasing sequence index in hash chain
  leadId?: string;
  leadName?: string;
}

// DailyPulse AI Performance & Task Sentiment Persistence
export type DailyPulsePhase = 'morning' | 'midday' | 'afternoon' | 'end_of_day';

export interface DailyPulseTaskSnapshot {
  id: string;
  title: string;
  completed: boolean;
  category?: string;
  isDefault?: boolean;
}

export type RatioCritiqueTier = 'zero_reset' | 'lagging_triage' | 'mid_flight_bubble' | 'high_tempo' | 'championship_pace';

export interface DailySalesManagerCritique {
  ratioTier: RatioCritiqueTier;
  ratioLabel: string; // e.g. "0 of 5 Goals (0%)"
  tone: string; // e.g. "Candid & Empathetic Reality Check", "Urgent High-Energy Triage"
  diagnosis: string; // Surgical breakdown of why the ratio is lagging or high
  tacticalPivot: string; // Prescriptive next action to take immediately
  accountabilityCheck: string; // High-energy closing standard from the branch manager
  conversionMathNote?: string; // Dollar impact note e.g. "1 closed purchase app = $4,500+"
}

export interface DailyPulseEntry {
  id: string; // e.g. pulse_${loId}_${date}_${phase}
  loId: string;
  loName: string;
  date: string; // YYYY-MM-DD
  timePhase: DailyPulsePhase;
  timeString: string; // e.g. "9:30 AM"
  timestamp: string; // ISO 8601
  totalTasks: number;
  completedTasks: number;
  completionPercent: number;
  completedTitles: string[];
  pendingTitles: string[];
  allTasksSnapshot?: DailyPulseTaskSnapshot[];
  reviewData: {
    headline: string;
    motivationalBadge: string;
    whatDoneSummary: string;
    managerPerspective?: string;
    salesManagerCritique?: DailySalesManagerCritique;
    topProducerTip?: {
      headline: string;
      advice: string;
      focusOutcome: string;
    };
    topPriorities: string[];
    coachingQuote: string;
    nextActionRecommendation?: {
      tabId: string;
      actionTitle: string;
      actionReason: string;
    };
  };
  yesterdayHandoffSummary?: string;
}

// WeeklyPulse AI Performance & Week-over-Week Variance
export interface WeeklyPulseReviewData {
  headline: string;
  performanceGrade: string; // e.g. "A - High Momentum", "B+ Solid Pacing"
  weekOverWeekTrend: "improving" | "steady" | "needs_recalibration";
  priorWeekComparisonSummary: string;
  keyAccomplishments: string[];
  topProducerPlaybookNextWeek: string[];
  salesManagerWeeklyDirective: string;
  recommendedFocusTab?: string;
}

export interface WeeklyPulseEntry {
  id: string; // e.g. weekly_${loId}_${year}_W${weekNumber}
  loId: string;
  loName: string;
  weekNumber: number;
  year: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  weekLabel: string; // e.g. "Week 36 (Sep 1 - Sep 7, 2026)"
  totalTasksTargeted: number;
  totalTasksCompleted: number;
  completionRate: number;
  daysActive: number;
  reviewData: WeeklyPulseReviewData;
  timestamp: string;
}

// MonthlyHorizonPulse: 30-Day Lookback Retrospective & 30-Day Forward Production Roadmap
export interface MonthlyHorizonMilestone {
  weekLabel: string;
  milestone: string;
  focusArea: string;
  status: "planned" | "in_progress" | "completed";
}

export interface MonthlyHorizonReviewData {
  headline: string;
  productivityScore: number; // 0 - 100
  pacingStatus: "ahead_of_quota" | "on_track" | "needs_acceleration";
  lookback30Days: {
    totalDaysTracked: number;
    averageDailyTaskCompletionRate: number;
    pipelineVelocity: string;
    retrospectiveSummary: string;
    biggestWins: string[];
    missedOpportunities: string[];
  };
  lookforward30Days: {
    revenueGoalVolume: string;
    recommendedFocus: string;
    weeklyMilestones: MonthlyHorizonMilestone[];
    topProducer30DayBlueprint: string;
    executiveSalesManagerPrescription: string;
  };
}

export interface MonthlyHorizonPulseEntry {
  id: string; // e.g. monthly_${loId}_${yearMonth}
  loId: string;
  loName: string;
  month: string; // YYYY-MM
  monthLabel: string; // e.g. "September 2026"
  timestamp: string;
  lookbackStats?: any;
  reviewData: MonthlyHorizonReviewData;
}

export interface UserPreference {
  userId: string;
  themePreference: 'dark' | 'light' | 'system';
  updatedAt?: string;
}

export interface PropertyConversationMessage {
  id: string;
  sender: 'buyer' | 'loan_officer' | 'realtor' | 'system';
  senderName: string;
  senderRole?: string;
  text: string;
  timestamp: string;
  messageType?: 'question' | 'response' | 'note' | 'system';
  questionCategory?: 'financing' | 'rate_buydown' | 'down_payment' | 'property_condition' | 'qualification' | 'general';
  status?: 'pending' | 'resolved';
  questionId?: string;
  actionItemId?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionText?: string;
  programTag?: string;
  didYouKnowFact?: string;
  pointsAwarded?: number;
}

export interface PropertyActionItem {
  id: string; // e.g. `action-${messageId}`
  conversationId: string;
  messageId: string;
  propertyId: string;
  propertyAddress: string;
  propertyPrice?: number;
  propertyCity?: string;
  leadId: string;
  leadName: string;
  leadEmail?: string;
  leadPhone?: string;
  questionText: string;
  questionCategory: 'financing' | 'rate_buydown' | 'down_payment' | 'property_condition' | 'qualification' | 'general';
  programTag?: string;
  status: 'pending' | 'resolved';
  priority: 'urgent' | 'high' | 'normal';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionText?: string;
  tcpaSmsOptIn?: boolean;
  tcpaPhoneProvided?: string;
}

export interface PropertyConversation {
  id: string; // `${propertyId}_${leadId}` or `${propertyId}`
  propertyId: string;
  leadId: string;
  leadName?: string;
  leadEmail?: string;
  leadPhone?: string;
  propertyAddress: string;
  propertyPrice?: number;
  propertyCity?: string;
  assignedLoId?: string;
  assignedLoName?: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  notes?: string;
  messages: PropertyConversationMessage[];
  pendingActionItems?: PropertyActionItem[];
  hasPendingActionItem?: boolean;
  lastQuestionAt?: string;
  matchedPrograms?: string[];
  gamifiedStats?: {
    points: number;
    unlockedBadges: string[];
    quizAnsweredCount: number;
  };
  updatedAt: string;
  createdAt?: string;
}


export interface CampaignAuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details?: string;
}
