import { CapturedLead, LoanOfficerProfile, RealEstateAgentProfile } from "../types";
import { resolveLeadSource } from "../utils/leadSourceRegistry";

export type CrmExportFormat = "salesforce" | "totalexpert";

/**
 * ============================================================================
 * DATE FORMATTING UTILITIES FOR ENTERPRISE CRMS
 * ============================================================================
 */

/**
 * Parses and formats an ISO timestamp or date string into standard Salesforce Datetime:
 * Format: YYYY-MM-DDTHH:mm:ss.sssZ
 */
export function formatSalesforceDateTime(dateStr?: string): string {
  if (!dateStr) return new Date().toISOString();
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

/**
 * Formats a date string into standard Salesforce Date:
 * Format: YYYY-MM-DD
 */
export function formatSalesforceDate(dateStr?: string): string {
  if (!dateStr) return new Date().toISOString().split("T")[0];
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date().toISOString().split("T")[0] : d.toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

/**
 * Formats a date string into standard Total Expert Datetime:
 * Format: YYYY-MM-DD HH:mm:ss
 */
export function formatTotalExpertDateTime(dateStr?: string): string {
  if (!dateStr) {
    const now = new Date();
    return now.toISOString().replace("T", " ").substring(0, 19);
  }
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      return new Date().toISOString().replace("T", " ").substring(0, 19);
    }
    return d.toISOString().replace("T", " ").substring(0, 19);
  } catch {
    return new Date().toISOString().replace("T", " ").substring(0, 19);
  }
}

/**
 * Formats a date string into standard Total Expert Date:
 * Format: YYYY-MM-DD
 */
export function formatTotalExpertDate(dateStr?: string): string {
  if (!dateStr) return new Date().toISOString().split("T")[0];
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date().toISOString().split("T")[0] : d.toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

/**
 * Computes estimated purchase/close date based on the homebuyer's readiness timeline:
 * Returns both Salesforce (YYYY-MM-DD) and Total Expert (YYYY-MM-DD) formats.
 */
export function calculateEstimatedCloseDate(
  createdDateStr?: string,
  timeline?: string
): { sfDate: string; teDate: string } {
  const base = createdDateStr ? new Date(createdDateStr) : new Date();
  const validBase = isNaN(base.getTime()) ? new Date() : base;
  const result = new Date(validBase);

  const t = (timeline || "").toLowerCase();
  let daysToAdd = 60; // Default 60-day target

  if (t.includes("30") || t.includes("immediate") || t.includes("urgent") || t.includes("now")) {
    daysToAdd = 30;
  } else if (t.includes("60") || t.includes("30-60") || t.includes("2 mo")) {
    daysToAdd = 60;
  } else if (t.includes("90") || t.includes("3-6") || t.includes("quarter")) {
    daysToAdd = 120;
  } else if (t.includes("6+") || t.includes("year") || t.includes("exploring") || t.includes("future")) {
    daysToAdd = 180;
  }

  result.setDate(result.getDate() + daysToAdd);
  const dateIso = result.toISOString().split("T")[0];
  return { sfDate: dateIso, teDate: dateIso };
}

/**
 * ============================================================================
 * SOURCE FORMATTING UTILITIES FOR ENTERPRISE CRMS
 * ============================================================================
 */

export interface NormalizedSourceMetadata {
  leadSource: string;
  sourceDetail: string;
  campaignName: string;
  sourcePropertyAddress: string;
  leadPathTag: string;
  interactedSourceType: string;
  tcpaSource: string;
  channelCategory: string;
}

/**
 * Normalizes lead intake and digital touchpoint source fields for enterprise CRM ingestion
 */
export function normalizeSourceMetadata(lead: CapturedLead): NormalizedSourceMetadata {
  const canonical = resolveLeadSource(lead);
  const rawSource = lead.sourceLabel || canonical.label || lead.leadSource || "First-Time Homebuyer Roadmap";
  const campaignName = lead.sourceCampaignName || (lead.sourceCampaignId ? `Campaign #${lead.sourceCampaignId}` : "");
  const propertyAddress = lead.sourcePropertyAddress || "";
  const leadPathTag = lead.leadPathTag || (lead.grantInterest ? "grant_finder" : "affordability_calculator");
  const assetType = lead.interactedSourceType || (lead.sourcePropertyAddress ? "property_listing" : "campaign");

  // Determine standard channel category
  let channelCategory = "Digital Web";
  if (propertyAddress) {
    channelCategory = "Property Listing Inquired";
  } else if (campaignName) {
    channelCategory = "Paid Ad Campaign";
  } else if (lead.assignedAgentId || lead.assignedAgent) {
    channelCategory = "Realtor Partner Referral";
  } else if (canonical.slug === "plugin-chatbot" || canonical.slug === "plugin-email-link") {
    channelCategory = "House Finder Plugin";
  } else if (canonical.slug === "lead_intake_chatbot" || (lead.chatTranscript && lead.chatTranscript.length > 0)) {
    channelCategory = "AI Digital Chatbot";
  }

  const sourceDetail = [
    leadPathTag ? `Path: ${leadPathTag}` : null,
    campaignName ? `Campaign: ${campaignName}` : null,
    propertyAddress ? `Property: ${propertyAddress}` : null,
    assetType ? `Asset: ${assetType}` : null,
  ].filter(Boolean).join(" | ") || rawSource;

  const tcpaSource = lead.smsConsentSource || "Digital Intake Web Form - AI Roadmap";

  return {
    leadSource: rawSource,
    sourceDetail,
    campaignName,
    sourcePropertyAddress: propertyAddress,
    leadPathTag,
    interactedSourceType: assetType,
    tcpaSource,
    channelCategory,
  };
}

/**
 * ============================================================================
 * USER & ORIGINATOR METADATA RESOLUTION UTILITIES
 * ============================================================================
 */

export interface ResolvedUserMetadata {
  loId: string;
  loName: string;
  loEmail: string;
  loNmls: string;
  loPhone: string;
  loTitle: string;
  branchName: string;
  companyName: string;
  agentId: string;
  agentName: string;
  agentEmail: string;
  agentPhone: string;
  agentBrokerage: string;
  agentLicense: string;
  pairingId: string;
}

/**
 * Resolves Loan Officer and Partner Agent metadata from the system state
 */
export function resolveUserMetadata(
  lead: CapturedLead,
  loanOfficers: LoanOfficerProfile[] = [],
  agents: RealEstateAgentProfile[] = []
): ResolvedUserMetadata {
  const lo = loanOfficers.find(o => o.id === lead.assignedLoId);
  const agent = agents.find(a => a.id === lead.assignedAgentId);

  const loName = lo?.name || (lead as any).assignedLO || "Branch Office";
  const loEmail = lo?.email || "";
  const loNmls = lo?.nmlsId || (lo as any)?.nmlsNumber || "";
  const loPhone = lo?.phone || "";
  const loTitle = lo?.title || "Senior Loan Officer";
  const branchName = lo?.branch || lo?.company || "Portland Central Branch";
  const companyName = lo?.company || "Guild Mortgage";

  const agentName = agent?.name || (lead as any).assignedAgent || "Unassigned";
  const agentEmail = agent?.email || "";
  const agentPhone = agent?.phone || "";
  const agentBrokerage = agent?.brokerage || "";
  const agentLicense = agent?.licenseNumber || "";
  const pairingId = lead.pairingId || (lo && agent ? `${lo.id}-${agent.id}` : "");

  return {
    loId: lead.assignedLoId || lo?.id || "",
    loName,
    loEmail,
    loNmls,
    loPhone,
    loTitle,
    branchName,
    companyName,
    agentId: lead.assignedAgentId || agent?.id || "",
    agentName,
    agentEmail,
    agentPhone,
    agentBrokerage,
    agentLicense,
    pairingId,
  };
}

/**
 * Splits a full name into First and Last names conforming with CRM ingestion rules
 */
export function splitFullName(fullName?: string, email?: string): { firstName: string; lastName: string } {
  const trimmed = (fullName || "").trim();
  if (!trimmed) {
    if (email && email.includes("@")) {
      const emailUser = email.split("@")[0];
      return { firstName: "Homebuyer", lastName: emailUser };
    }
    return { firstName: "Homebuyer", lastName: "Lead" };
  }

  // Handle couple inquiry names e.g., "Tyler & Emily Richardson"
  if (trimmed.includes("&")) {
    const parts = trimmed.split(/\s+/);
    const lastName = parts[parts.length - 1];
    const firstName = parts.slice(0, parts.length - 1).join(" ");
    return { firstName, lastName: lastName || "Household" };
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "Household" };
  }

  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ");
  return { firstName, lastName };
}

/**
 * Extracts normalized city from lead address attributes
 */
export function extractCity(lead: CapturedLead): string {
  if (lead.taggedCityArea) {
    return lead.taggedCityArea.split(/[,&/]/)[0].trim();
  }
  if (lead.preferredLocations) {
    const clean = lead.preferredLocations.replace(/\(.*\)/g, "").trim();
    return clean.split(/[,&/]/)[0].trim();
  }
  if (lead.sourcePropertyAddress) {
    const parts = lead.sourcePropertyAddress.split(",");
    if (parts.length > 1) {
      return parts[1].trim();
    }
  }
  return "Portland";
}

/**
 * RFC 4180 compliant CSV cell escaper
 */
export function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * ============================================================================
 * TOTAL EXPERT ENTERPRISE CSV SCHEMA & ROW DEFINITION
 * ============================================================================
 */

export interface TotalExpertLeadRow {
  // Contact Identification
  External_ID: string;
  First_Name: string;
  Last_Name: string;
  Email: string;
  Mobile_Phone: string;
  Home_Phone: string;
  Company_Household: string;
  Street_Address: string;
  City: string;
  State: string;
  Postal_Code: string;
  
  // Pipeline & Status
  Contact_Status: string;
  Contact_Type: string;
  Lead_Rating: string;
  
  // Mortgage & Financial Profile
  Loan_Purpose: string;
  Target_Purchase_Price: string;
  Monthly_Payment_Budget: string;
  Down_Payment_Savings: string;
  Credit_Rating: string;
  Down_Payment_Assistance: string;
  Readiness_Timeline: string;
  Property_Type: string;
  Annual_Income: string;

  // Date Fields (Total Expert Format: YYYY-MM-DD HH:mm:ss / YYYY-MM-DD)
  Created_Date: string;
  Last_Activity_Date: string;
  Target_Purchase_Date: string;
  TCPA_Consent_Date: string;

  // Source & Campaign Fields
  Lead_Source: string;
  Lead_Source_Detail: string;
  Campaign_Name: string;
  Inquired_Property: string;
  Lead_Path_Tag: string;
  Interacted_Source_Type: string;
  Original_Referrer: string;

  // User & Loan Officer Originator Metadata (Total Expert Tenant Mapping)
  Owner_Email: string;
  Owner_NMLS: string;
  Owner_First_Name: string;
  Owner_Last_Name: string;
  Owner_Full_Name: string;
  Owner_Phone: string;
  Owner_Title: string;
  Branch_Name: string;
  Lender_Company: string;

  // Co-Marketing Realtor Partner Metadata
  Co_Marketing_Partner_Name: string;
  Co_Marketing_Partner_Email: string;
  Co_Marketing_Partner_Phone: string;
  Co_Marketing_Partner_Brokerage: string;
  Co_Marketing_Partner_License: string;
  Co_Brand_Pairing_ID: string;

  // Compliance & Transcript Notes
  TCPA_Consent_Granted: string;
  TCPA_Consent_Source: string;
  TCPA_Consent_IP: string;
  Notes: string;
}

export interface CrmColumnDefinition<T> {
  key: keyof T;
  label: string;
  description: string;
  category: "identity" | "date" | "source" | "user" | "mortgage" | "compliance";
}

export const TOTAL_EXPERT_SCHEMA_COLUMNS: CrmColumnDefinition<TotalExpertLeadRow>[] = [
  { key: "External_ID", label: "External ID", description: "Unique lead ID for Total Expert contact deduplication and API matching", category: "identity" },
  { key: "First_Name", label: "First Name", description: "Borrower primary first name", category: "identity" },
  { key: "Last_Name", label: "Last Name", description: "Borrower last name / household identifier", category: "identity" },
  { key: "Email", label: "Email", description: "Primary borrower email address", category: "identity" },
  { key: "Mobile_Phone", label: "Mobile Phone", description: "Direct mobile phone number for automated SMS marketing sequences", category: "identity" },
  { key: "Home_Phone", label: "Home Phone", description: "Secondary phone number", category: "identity" },
  { key: "Company_Household", label: "Company / Household", description: "Household name for family / co-borrower file grouping", category: "identity" },
  { key: "Street_Address", label: "Street Address", description: "Mailing or inquired property street address", category: "identity" },
  { key: "City", label: "City", description: "Target market city (e.g., Portland, Bend, Eugene)", category: "identity" },
  { key: "State", label: "State", description: "State postal abbreviation (OR)", category: "identity" },
  { key: "Postal_Code", label: "Postal Code", description: "Target zip code", category: "identity" },
  { key: "Contact_Status", label: "Contact Status", description: "Total Expert lifecycle status (New Lead, Contacted, Pre-Approved, Under Contract)", category: "mortgage" },
  { key: "Contact_Type", label: "Contact Type", description: "Contact type taxonomy in Total Expert (Borrower)", category: "identity" },
  { key: "Lead_Rating", label: "Lead Rating", description: "Total Expert priority score: Hot, Warm, Cold", category: "mortgage" },
  { key: "Loan_Purpose", label: "Loan Purpose", description: "Mortgage loan purpose (Purchase)", category: "mortgage" },
  { key: "Target_Purchase_Price", label: "Target Purchase Price", description: "Target home price or pre-approval search envelope", category: "mortgage" },
  { key: "Monthly_Payment_Budget", label: "Monthly Payment Budget", description: "Comfortable target monthly PITI payment budget", category: "mortgage" },
  { key: "Down_Payment_Savings", label: "Down Payment Savings", description: "Reported liquid down payment capital", category: "mortgage" },
  { key: "Credit_Rating", label: "Credit Rating", description: "Self-reported credit tier (e.g. Excellent 740+, Good 680-739)", category: "mortgage" },
  { key: "Down_Payment_Assistance", label: "Down Payment Assistance", description: "Flag for Oregon DPA / cash grant eligibility (Yes / No)", category: "mortgage" },
  { key: "Readiness_Timeline", label: "Readiness Timeline", description: "Buyer purchase timeline (e.g., 30-60 Days, 3-6 Months)", category: "mortgage" },
  { key: "Property_Type", label: "Property Type", description: "Target dwelling category (Single Family, Townhome, Condo)", category: "mortgage" },
  { key: "Annual_Income", label: "Annual Income", description: "Estimated gross annual household income", category: "mortgage" },
  
  // Date Fields
  { key: "Created_Date", label: "Created Date", description: "Standard Total Expert timestamp format: YYYY-MM-DD HH:mm:ss", category: "date" },
  { key: "Last_Activity_Date", label: "Last Activity Date", description: "Date/time of most recent consumer engagement: YYYY-MM-DD HH:mm:ss", category: "date" },
  { key: "Target_Purchase_Date", label: "Target Purchase Date", description: "Estimated closing target date calculated from timeline: YYYY-MM-DD", category: "date" },
  { key: "TCPA_Consent_Date", label: "TCPA Consent Date", description: "Timestamp of express written TCPA consent: YYYY-MM-DD HH:mm:ss", category: "date" },
  
  // Source Fields
  { key: "Lead_Source", label: "Lead Source", description: "Primary intake channel (AI First-Time Homebuyer Roadmap, Ad, Partner)", category: "source" },
  { key: "Lead_Source_Detail", label: "Lead Source Detail", description: "Granular entry attribution including path and campaign", category: "source" },
  { key: "Campaign_Name", label: "Campaign Name", description: "Marketing campaign or ad creative name", category: "source" },
  { key: "Inquired_Property", label: "Inquired Property", description: "Full street address if originated from a property listing inquiry", category: "source" },
  { key: "Lead_Path_Tag", label: "Lead Path Tag", description: "Consumer path tag (grant_finder, affordability_calculator, tour_scorecard)", category: "source" },
  { key: "Interacted_Source_Type", label: "Interacted Source Type", description: "Asset type classification (campaign, property_listing, chatbot)", category: "source" },
  { key: "Original_Referrer", label: "Original Referrer", description: "Referrer URL or platform origin", category: "source" },

  // User Metadata Fields
  { key: "Owner_Email", label: "Owner Email", description: "Loan Officer email address used for automatic Total Expert user routing", category: "user" },
  { key: "Owner_NMLS", label: "Owner NMLS", description: "Originator NMLS license number", category: "user" },
  { key: "Owner_First_Name", label: "Owner First Name", description: "Originator first name", category: "user" },
  { key: "Owner_Last_Name", label: "Owner Last Name", description: "Originator last name", category: "user" },
  { key: "Owner_Full_Name", label: "Owner Full Name", description: "Loan Officer full name", category: "user" },
  { key: "Owner_Phone", label: "Owner Phone", description: "Loan Officer direct contact number", category: "user" },
  { key: "Owner_Title", label: "Owner Title", description: "Loan Officer professional title", category: "user" },
  { key: "Branch_Name", label: "Branch Name", description: "Originating mortgage branch name", category: "user" },
  { key: "Lender_Company", label: "Lender Company", description: "Lending institution name", category: "user" },

  // Co-Marketing Partner Fields
  { key: "Co_Marketing_Partner_Name", label: "Co-Marketing Partner Name", description: "Paired real estate agent full name", category: "user" },
  { key: "Co_Marketing_Partner_Email", label: "Co-Marketing Partner Email", description: "Paired real estate agent email", category: "user" },
  { key: "Co_Marketing_Partner_Phone", label: "Co-Marketing Partner Phone", description: "Paired real estate agent phone number", category: "user" },
  { key: "Co_Marketing_Partner_Brokerage", label: "Co-Marketing Partner Brokerage", description: "Realtor brokerage agency", category: "user" },
  { key: "Co_Marketing_Partner_License", label: "Co-Marketing Partner License", description: "Realtor state license / DRE number", category: "user" },
  { key: "Co_Brand_Pairing_ID", label: "Co-Brand Pairing ID", description: "LO-Agent co-brand pairing identifier", category: "user" },

  // Compliance & Notes
  { key: "TCPA_Consent_Granted", label: "TCPA Consent Granted", description: "Express written TCPA consent flag (True / False)", category: "compliance" },
  { key: "TCPA_Consent_Source", label: "TCPA Consent Source", description: "Form name or URL where TCPA opt-in was captured", category: "compliance" },
  { key: "TCPA_Consent_IP", label: "TCPA Consent IP", description: "Consumer IP address at time of consent", category: "compliance" },
  { key: "Notes", label: "Notes / AI Transcript", description: "Complete intake brief, loan officer notes, and AI conversational transcript", category: "compliance" },
];

/**
 * Maps system lead status to Total Expert lifecycle contact status
 */
export function mapToTotalExpertStatus(status?: string): string {
  switch (status) {
    case "new":
      return "New Lead";
    case "contacted":
      return "Contacted";
    case "pre_approved":
      return "Pre-Approved";
    case "in_escrow":
      return "Under Contract";
    case "closed":
      return "Closed Loan";
    case "archived":
      return "Archived";
    default:
      return "New Lead";
  }
}

/**
 * Maps system intent score to Total Expert priority rating
 */
export function mapToTotalExpertRating(intent?: string): string {
  switch (intent) {
    case "hot":
      return "Hot";
    case "warm":
      return "Warm";
    case "exploring":
      return "Cold";
    default:
      return "Warm";
  }
}

/**
 * Formats a CapturedLead into a TotalExpertLeadRow
 */
export function formatLeadToTotalExpertRow(
  lead: CapturedLead,
  loanOfficers: LoanOfficerProfile[] = [],
  agents: RealEstateAgentProfile[] = []
): TotalExpertLeadRow {
  const { firstName, lastName } = splitFullName(lead.fullName, lead.email);
  const userMeta = resolveUserMetadata(lead, loanOfficers, agents);
  const sourceMeta = normalizeSourceMetadata(lead);

  const { teDate: targetPurchaseDate } = calculateEstimatedCloseDate(lead.createdAt, lead.timeline);

  const createdDateTime = formatTotalExpertDateTime(lead.createdAt);
  const lastActivityDateTime = formatTotalExpertDateTime(
    lead.lastEmailSentAt || lead.lastTextSentAt || lead.createdAt
  );
  const tcpaConsentDate = lead.smsConsentTimestamp
    ? formatTotalExpertDateTime(lead.smsConsentTimestamp)
    : lead.smsConsentAuthorized
    ? createdDateTime
    : "";

  const loNameParts = splitFullName(userMeta.loName, userMeta.loEmail);

  // Build structured notes
  const noteLines: string[] = [
    `=== TOTAL EXPERT MORTGAGE INTAKE SUMMARY ===`,
    `Lead ID: ${lead.id}`,
    `Full Name: ${lead.fullName}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone}`,
    `Target Purchase Price: ${lead.targetPriceRange || "Not specified"}`,
    `Monthly Budget: ${lead.targetMonthlyBudget || "Not specified"}`,
    `Down Payment Savings: ${lead.downPaymentSavings || "Not specified"}`,
    `Credit Score Tier: ${lead.creditScoreTier || "Not specified"}`,
    `Readiness Timeline: ${lead.timeline || "Not specified"}`,
    `Target Purchase Date: ${targetPurchaseDate}`,
    `Property Type: ${lead.propertyType || "Not specified"}`,
    `Oregon DPA / Cash Grant Interest: ${lead.grantInterest ? "YES" : "No"}`,
    `Preferred Geography: ${lead.preferredLocations || lead.taggedCityArea || "Oregon"}`,
  ];

  if (lead.notes) {
    noteLines.push(`LO Advisory Notes: ${lead.notes}`);
  }

  if (lead.sourcePropertyAddress) {
    noteLines.push(`Inquired Listing Address: ${lead.sourcePropertyAddress}`);
  }

  if (lead.chatTranscript && lead.chatTranscript.length > 0) {
    noteLines.push(`\n--- AI INTAKE CONVERSATION TRANSCRIPT (${lead.chatTranscript.length} messages) ---`);
    lead.chatTranscript.forEach(msg => {
      noteLines.push(`[${msg.time || ""}] ${msg.sender}: ${msg.text}`);
    });
  }

  return {
    External_ID: (lead as any).totalExpertId || lead.id,
    First_Name: firstName,
    Last_Name: lastName,
    Email: lead.email || "",
    Mobile_Phone: lead.phone || "",
    Home_Phone: lead.phone || "",
    Company_Household: `${lastName} Household`,
    Street_Address: lead.sourcePropertyAddress || "",
    City: extractCity(lead),
    State: "OR",
    Postal_Code: "97201",
    Contact_Status: mapToTotalExpertStatus(lead.status),
    Contact_Type: "Borrower",
    Lead_Rating: mapToTotalExpertRating(lead.intentScore),
    Loan_Purpose: "Purchase",
    Target_Purchase_Price: lead.targetPriceRange || "",
    Monthly_Payment_Budget: lead.targetMonthlyBudget || "",
    Down_Payment_Savings: lead.downPaymentSavings || "",
    Credit_Rating: lead.creditScoreTier || "",
    Down_Payment_Assistance: lead.grantInterest ? "Yes" : "No",
    Readiness_Timeline: lead.timeline || "",
    Property_Type: lead.propertyType || "",
    Annual_Income: lead.annualIncome || "",
    Created_Date: createdDateTime,
    Last_Activity_Date: lastActivityDateTime,
    Target_Purchase_Date: targetPurchaseDate,
    TCPA_Consent_Date: tcpaConsentDate,
    Lead_Source: sourceMeta.leadSource,
    Lead_Source_Detail: sourceMeta.sourceDetail,
    Campaign_Name: sourceMeta.campaignName,
    Inquired_Property: sourceMeta.sourcePropertyAddress,
    Lead_Path_Tag: sourceMeta.leadPathTag,
    Interacted_Source_Type: sourceMeta.interactedSourceType,
    Original_Referrer: sourceMeta.channelCategory,
    Owner_Email: userMeta.loEmail,
    Owner_NMLS: userMeta.loNmls,
    Owner_First_Name: loNameParts.firstName,
    Owner_Last_Name: loNameParts.lastName,
    Owner_Full_Name: userMeta.loName,
    Owner_Phone: userMeta.loPhone,
    Owner_Title: userMeta.loTitle,
    Branch_Name: userMeta.branchName,
    Lender_Company: userMeta.companyName,
    Co_Marketing_Partner_Name: userMeta.agentName,
    Co_Marketing_Partner_Email: userMeta.agentEmail,
    Co_Marketing_Partner_Phone: userMeta.agentPhone,
    Co_Marketing_Partner_Brokerage: userMeta.agentBrokerage,
    Co_Marketing_Partner_License: userMeta.agentLicense,
    Co_Brand_Pairing_ID: userMeta.pairingId,
    TCPA_Consent_Granted: lead.smsConsentAuthorized ? "True" : "False",
    TCPA_Consent_Source: sourceMeta.tcpaSource,
    TCPA_Consent_IP: lead.smsConsentIp || "",
    Notes: noteLines.join("\n"),
  };
}

/**
 * ============================================================================
 * SALESFORCE ENTERPRISE CSV SCHEMA & ROW DEFINITION
 * ============================================================================
 */

export interface SalesforceLeadRow {
  Id: string;
  FirstName: string;
  LastName: string;
  Company: string;
  Title: string;
  Email: string;
  Phone: string;
  MobilePhone: string;
  LeadSource: string;
  Status: string;
  Rating: string;
  MtgPlanner_CRM__Group__c: string;
  RecordTypeId: string;
  Loan_Officer__c: string;
  Assigned_LO_Name__c: string;
  Assigned_LO_Email__c: string;
  Assigned_LO_NMLS__c: string;
  Assigned_LO_Phone__c: string;
  Branch_Name__c: string;
  Assigned_Agent_Name__c: string;
  Assigned_Agent_Email__c: string;
  Assigned_Agent_Phone__c: string;
  Assigned_Agent_Brokerage__c: string;
  Pairing_Id__c: string;
  City: string;
  State: string;
  Country: string;
  Target_Price__c: string;
  Target_Monthly_Budget__c: string;
  Down_Payment_Savings__c: string;
  Credit_Score_Tier__c: string;
  Timeline__c: string;
  Property_Type__c: string;
  Grant_Interest__c: string;
  Important_Notes__c: string;
  LO_Notes__c: string;
  Description: string;
  MtgPlanner_CRM__Last_Touch__c: string;
  Last_Touch_Date__c: string;
  Target_Close_Date__c: string;
  TCPA_Consent_Authorized__c: string;
  TCPA_Consent_Timestamp__c: string;
  TCPA_Consent_Source__c: string;
  Source_Campaign__c: string;
  Source_Property_Address__c: string;
  Lead_Path_Tag__c: string;
  Interacted_Source_Type__c: string;
  CreatedDate: string;
}

export const SALESFORCE_SCHEMA_COLUMNS: CrmColumnDefinition<SalesforceLeadRow>[] = [
  { key: "Id", label: "Id", description: "Salesforce 18-char Lead ID (if previously synchronized)", category: "identity" },
  { key: "FirstName", label: "FirstName", description: "Contact First Name", category: "identity" },
  { key: "LastName", label: "LastName", description: "Contact Last Name (Required by Salesforce Lead Object)", category: "identity" },
  { key: "Company", label: "Company", description: "Household / Company Name (Required by Salesforce Lead Object)", category: "identity" },
  { key: "Title", label: "Title", description: "Prospective Homebuyer", category: "identity" },
  { key: "Email", label: "Email", description: "Primary Contact Email Address", category: "identity" },
  { key: "Phone", label: "Phone", description: "Primary Contact Phone", category: "identity" },
  { key: "MobilePhone", label: "MobilePhone", description: "Mobile Phone for SMS Outreach", category: "identity" },
  { key: "City", label: "City", description: "Target / Inquired City Area", category: "identity" },
  { key: "State", label: "State", description: "Target State (OR)", category: "identity" },
  { key: "Country", label: "Country", description: "Country (USA)", category: "identity" },
  
  // Status & Pipeline
  { key: "Status", label: "Status", description: "Salesforce Standard Lead Status picklist value", category: "mortgage" },
  { key: "Rating", label: "Rating", description: "Salesforce Rating (Hot, Warm, Cold)", category: "mortgage" },
  { key: "MtgPlanner_CRM__Group__c", label: "MtgPlanner_CRM__Group__c", description: "Jungo / Mortgage CRM Lead Group", category: "mortgage" },
  { key: "RecordTypeId", label: "RecordTypeId", description: "Jungo Mortgage CRM RecordTypeId (012Hn000001CekSIAS)", category: "mortgage" },
  
  // Financial & Mortgage Profile
  { key: "Target_Price__c", label: "Target_Price__c", description: "Target Home Purchase Price Range", category: "mortgage" },
  { key: "Target_Monthly_Budget__c", label: "Target_Monthly_Budget__c", description: "Desired Monthly Mortgage Budget", category: "mortgage" },
  { key: "Down_Payment_Savings__c", label: "Down_Payment_Savings__c", description: "Liquid Down Payment Savings", category: "mortgage" },
  { key: "Credit_Score_Tier__c", label: "Credit_Score_Tier__c", description: "Self-Reported Credit Tier", category: "mortgage" },
  { key: "Timeline__c", label: "Timeline__c", description: "Home Purchase Readiness Timeline", category: "mortgage" },
  { key: "Property_Type__c", label: "Property_Type__c", description: "Preferred Property Category", category: "mortgage" },
  { key: "Grant_Interest__c", label: "Grant_Interest__c", description: "Eligible / Interested in Down Payment Assistance Grants", category: "mortgage" },
  { key: "Important_Notes__c", label: "Important_Notes__c", description: "High-Priority Readiness & DPA Notes", category: "mortgage" },
  { key: "LO_Notes__c", label: "LO_Notes__c", description: "Internal Loan Officer Advisory Notes", category: "mortgage" },
  { key: "Description", label: "Description", description: "Complete Intake Overview & AI Transcript", category: "mortgage" },

  // Dates (Salesforce ISO Formats)
  { key: "CreatedDate", label: "CreatedDate", description: "Salesforce ISO 8601 Datetime: YYYY-MM-DDTHH:mm:ss.sssZ", category: "date" },
  { key: "Last_Touch_Date__c", label: "Last_Touch_Date__c", description: "Salesforce Date: YYYY-MM-DD", category: "date" },
  { key: "Target_Close_Date__c", label: "Target_Close_Date__c", description: "Calculated Target Closing Date: YYYY-MM-DD", category: "date" },
  { key: "MtgPlanner_CRM__Last_Touch__c", label: "MtgPlanner_CRM__Last_Touch__c", description: "Last Touch Channel", category: "date" },
  
  // Sources
  { key: "LeadSource", label: "LeadSource", description: "Salesforce Standard Lead Source picklist", category: "source" },
  { key: "Source_Campaign__c", label: "Source_Campaign__c", description: "Ad Campaign or Marketing Source Name", category: "source" },
  { key: "Source_Property_Address__c", label: "Source_Property_Address__c", description: "Listing Address Inquired", category: "source" },
  { key: "Lead_Path_Tag__c", label: "Lead_Path_Tag__c", description: "Consumer Entrance Path Tag", category: "source" },
  { key: "Interacted_Source_Type__c", label: "Interacted_Source_Type__c", description: "Asset Type Classification", category: "source" },

  // User Metadata
  { key: "Loan_Officer__c", label: "Loan_Officer__c", description: "Assigned Loan Officer Identifier / NMLS", category: "user" },
  { key: "Assigned_LO_Name__c", label: "Assigned_LO_Name__c", description: "Assigned LO Full Name", category: "user" },
  { key: "Assigned_LO_Email__c", label: "Assigned_LO_Email__c", description: "Assigned LO Email Address", category: "user" },
  { key: "Assigned_LO_NMLS__c", label: "Assigned_LO_NMLS__c", description: "Assigned LO NMLS License Number", category: "user" },
  { key: "Assigned_LO_Phone__c", label: "Assigned_LO_Phone__c", description: "Assigned LO Phone Number", category: "user" },
  { key: "Branch_Name__c", label: "Branch_Name__c", description: "Lending Branch Office Name", category: "user" },
  { key: "Assigned_Agent_Name__c", label: "Assigned_Agent_Name__c", description: "Assigned Realtor Partner Name", category: "user" },
  { key: "Assigned_Agent_Email__c", label: "Assigned_Agent_Email__c", description: "Assigned Realtor Partner Email", category: "user" },
  { key: "Assigned_Agent_Phone__c", label: "Assigned_Agent_Phone__c", description: "Assigned Realtor Partner Phone", category: "user" },
  { key: "Assigned_Agent_Brokerage__c", label: "Assigned_Agent_Brokerage__c", description: "Assigned Realtor Partner Brokerage", category: "user" },
  { key: "Pairing_Id__c", label: "Pairing_Id__c", description: "Co-Brand Pairing Identifier", category: "user" },

  // Compliance
  { key: "TCPA_Consent_Authorized__c", label: "TCPA_Consent_Authorized__c", description: "TCPA SMS Consent Status (TRUE / FALSE)", category: "compliance" },
  { key: "TCPA_Consent_Timestamp__c", label: "TCPA_Consent_Timestamp__c", description: "TCPA Audit Timestamp (ISO 8601)", category: "compliance" },
  { key: "TCPA_Consent_Source__c", label: "TCPA_Consent_Source__c", description: "TCPA Consent Intake Source Form / URL", category: "compliance" },
];

/**
 * Maps system lead status to Salesforce Standard Lead Status picklist
 */
export function mapToSalesforceStatus(status?: string): string {
  switch (status) {
    case "new":
      return "Open - Not Contacted";
    case "contacted":
      return "Working - Contacted";
    case "pre_approved":
      return "Qualified - Pre-Approved";
    case "in_escrow":
      return "Under Contract / Escrow";
    case "closed":
      return "Closed - Converted";
    case "archived":
      return "Closed - Not Converted";
    default:
      return "Open - Not Contacted";
  }
}

/**
 * Maps system intent score to Salesforce Rating picklist
 */
export function mapToSalesforceRating(intent?: string): string {
  switch (intent) {
    case "hot":
      return "Hot";
    case "warm":
      return "Warm";
    case "exploring":
      return "Cold";
    default:
      return "Warm";
  }
}

/**
 * Formats a CapturedLead into a SalesforceLeadRow
 */
export function formatLeadToSalesforceRow(
  lead: CapturedLead,
  loanOfficers: LoanOfficerProfile[] = [],
  agents: RealEstateAgentProfile[] = []
): SalesforceLeadRow {
  const { firstName, lastName } = splitFullName(lead.fullName, lead.email);
  const userMeta = resolveUserMetadata(lead, loanOfficers, agents);
  const sourceMeta = normalizeSourceMetadata(lead);

  const { sfDate: targetCloseDate } = calculateEstimatedCloseDate(lead.createdAt, lead.timeline);

  const createdDateTime = formatSalesforceDateTime(lead.createdAt);
  const lastTouchDate = formatSalesforceDate(lead.lastEmailSentAt || lead.lastTextSentAt || lead.createdAt);
  const tcpaTimestamp = lead.smsConsentTimestamp
    ? formatSalesforceDateTime(lead.smsConsentTimestamp)
    : lead.smsConsentAuthorized
    ? createdDateTime
    : "";

  const descriptionLines: string[] = [
    `=== AI HOMEBUYER ROADMAP INTAKE ===`,
    `Lead ID: ${lead.id}`,
    `Full Name: ${lead.fullName}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone}`,
    `Target Purchase Price: ${lead.targetPriceRange || "Not specified"}`,
    `Monthly Payment Budget: ${lead.targetMonthlyBudget || "Not specified"}`,
    `Down Payment Savings: ${lead.downPaymentSavings || "Not specified"}`,
    `Credit Score Tier: ${lead.creditScoreTier || "Not specified"}`,
    `Timeline: ${lead.timeline || "Not specified"}`,
    `Estimated Target Close Date: ${targetCloseDate}`,
    `Property Type: ${lead.propertyType || "Not specified"}`,
    `Down Payment Assistance (DPA) Interest: ${lead.grantInterest ? "YES (Wants Oregon Cash Grants)" : "No"}`,
    `Preferred Geography: ${lead.preferredLocations || lead.taggedCityArea || "Oregon"}`,
  ];

  if (lead.sourcePropertyAddress) {
    descriptionLines.push(`Inquired Property: ${lead.sourcePropertyAddress}`);
  }

  if (lead.chatTranscript && lead.chatTranscript.length > 0) {
    descriptionLines.push(`\n--- AI INTAKE TRANSCRIPT (${lead.chatTranscript.length} messages) ---`);
    lead.chatTranscript.forEach(msg => {
      descriptionLines.push(`[${msg.time || ""}] ${msg.sender}: ${msg.text}`);
    });
  }

  const importantNotes = [
    `Intent: ${lead.intentScore ? lead.intentScore.toUpperCase() : "WARM"}`,
    `Timeline: ${lead.timeline || "N/A"}`,
    `Target Close: ${targetCloseDate}`,
    `DPA Grant: ${lead.grantInterest ? "Eligible/Interested" : "Standard"}`,
    lead.leadPathTag ? `Path: ${lead.leadPathTag}` : null,
  ].filter(Boolean).join(" | ");

  return {
    Id: (lead as any).salesforceId || "",
    FirstName: firstName,
    LastName: lastName,
    Company: `${lastName} Household`,
    Title: "Prospective Homebuyer",
    Email: lead.email || "",
    Phone: lead.phone || "",
    MobilePhone: lead.phone || "",
    LeadSource: sourceMeta.leadSource,
    Status: mapToSalesforceStatus(lead.status),
    Rating: mapToSalesforceRating(lead.intentScore),
    MtgPlanner_CRM__Group__c: "First-Time Homebuyer",
    RecordTypeId: "012Hn000001CekSIAS",
    Loan_Officer__c: userMeta.loNmls || userMeta.loEmail || userMeta.loId || "Branch Office",
    Assigned_LO_Name__c: userMeta.loName,
    Assigned_LO_Email__c: userMeta.loEmail,
    Assigned_LO_NMLS__c: userMeta.loNmls,
    Assigned_LO_Phone__c: userMeta.loPhone,
    Branch_Name__c: userMeta.branchName,
    Assigned_Agent_Name__c: userMeta.agentName,
    Assigned_Agent_Email__c: userMeta.agentEmail,
    Assigned_Agent_Phone__c: userMeta.agentPhone,
    Assigned_Agent_Brokerage__c: userMeta.agentBrokerage,
    Pairing_Id__c: userMeta.pairingId,
    City: extractCity(lead),
    State: "OR",
    Country: "USA",
    Target_Price__c: lead.targetPriceRange || "",
    Target_Monthly_Budget__c: lead.targetMonthlyBudget || "",
    Down_Payment_Savings__c: lead.downPaymentSavings || "",
    Credit_Score_Tier__c: lead.creditScoreTier || "",
    Timeline__c: lead.timeline || "",
    Property_Type__c: lead.propertyType || "",
    Grant_Interest__c: lead.grantInterest ? "TRUE" : "FALSE",
    Important_Notes__c: importantNotes,
    LO_Notes__c: lead.notes || "",
    Description: descriptionLines.join("\n"),
    MtgPlanner_CRM__Last_Touch__c: "AI Handoff",
    Last_Touch_Date__c: lastTouchDate,
    Target_Close_Date__c: targetCloseDate,
    TCPA_Consent_Authorized__c: lead.smsConsentAuthorized ? "TRUE" : "FALSE",
    TCPA_Consent_Timestamp__c: tcpaTimestamp,
    TCPA_Consent_Source__c: sourceMeta.tcpaSource,
    Source_Campaign__c: sourceMeta.campaignName,
    Source_Property_Address__c: sourceMeta.sourcePropertyAddress,
    Lead_Path_Tag__c: sourceMeta.leadPathTag,
    Interacted_Source_Type__c: sourceMeta.interactedSourceType,
    CreatedDate: createdDateTime,
  };
}

/**
 * ============================================================================
 * BULK TRANSFORMERS & CSV GENERATION PIPELINE
 * ============================================================================
 */

export interface CrmExportResult {
  csvString: string;
  rowCount: number;
  fileName: string;
  format: CrmExportFormat;
  columnCount: number;
}

/**
 * Transforms an array of CapturedLeads into TotalExpertLeadRows
 */
export function transformLeadsToTotalExpertRows(
  leads: CapturedLead[],
  loanOfficers: LoanOfficerProfile[] = [],
  agents: RealEstateAgentProfile[] = []
): TotalExpertLeadRow[] {
  return leads.map(lead => formatLeadToTotalExpertRow(lead, loanOfficers, agents));
}

/**
 * Transforms an array of CapturedLeads into SalesforceLeadRows
 */
export function transformLeadsToSalesforceRows(
  leads: CapturedLead[],
  loanOfficers: LoanOfficerProfile[] = [],
  agents: RealEstateAgentProfile[] = []
): SalesforceLeadRow[] {
  return leads.map(lead => formatLeadToSalesforceRow(lead, loanOfficers, agents));
}

/**
 * Generates the full Total Expert CSV string with UTF-8 BOM encoding
 */
export function generateTotalExpertCsv(
  leads: CapturedLead[],
  loanOfficers: LoanOfficerProfile[] = [],
  agents: RealEstateAgentProfile[] = []
): CrmExportResult {
  const headers = TOTAL_EXPERT_SCHEMA_COLUMNS.map(col => escapeCsvCell(col.label)).join(",");
  const rows = transformLeadsToTotalExpertRows(leads, loanOfficers, agents);

  const dataRows = rows.map(row => {
    return TOTAL_EXPERT_SCHEMA_COLUMNS.map(col => escapeCsvCell(row[col.key])).join(",");
  });

  // UTF-8 BOM to prevent character glitching in Excel and CRM data import tools
  const csvString = "\uFEFF" + [headers, ...dataRows].join("\r\n");
  const today = new Date().toISOString().split("T")[0];
  const fileName = `total_expert_leads_export_${today}.csv`;

  return {
    csvString,
    rowCount: leads.length,
    fileName,
    format: "totalexpert",
    columnCount: TOTAL_EXPERT_SCHEMA_COLUMNS.length,
  };
}

/**
 * Generates the full Salesforce CSV string with UTF-8 BOM encoding
 */
export function generateSalesforceCsv(
  leads: CapturedLead[],
  loanOfficers: LoanOfficerProfile[] = [],
  agents: RealEstateAgentProfile[] = []
): CrmExportResult {
  const headers = SALESFORCE_SCHEMA_COLUMNS.map(col => escapeCsvCell(col.key)).join(",");
  const rows = transformLeadsToSalesforceRows(leads, loanOfficers, agents);

  const dataRows = rows.map(row => {
    return SALESFORCE_SCHEMA_COLUMNS.map(col => escapeCsvCell(row[col.key])).join(",");
  });

  const csvString = "\uFEFF" + [headers, ...dataRows].join("\r\n");
  const today = new Date().toISOString().split("T")[0];
  const fileName = `salesforce_leads_export_${today}.csv`;

  return {
    csvString,
    rowCount: leads.length,
    fileName,
    format: "salesforce",
    columnCount: SALESFORCE_SCHEMA_COLUMNS.length,
  };
}

/**
 * Unified CSV generator for both Salesforce and Total Expert formats
 */
export function generateCrmCsv(
  format: CrmExportFormat,
  leads: CapturedLead[],
  loanOfficers: LoanOfficerProfile[] = [],
  agents: RealEstateAgentProfile[] = []
): CrmExportResult {
  if (format === "totalexpert") {
    return generateTotalExpertCsv(leads, loanOfficers, agents);
  }
  return generateSalesforceCsv(leads, loanOfficers, agents);
}

/**
 * Triggers a browser download of the generated CSV file
 */
export function triggerCrmCsvDownload(
  format: CrmExportFormat,
  leads: CapturedLead[],
  loanOfficers: LoanOfficerProfile[] = [],
  agents: RealEstateAgentProfile[] = []
): CrmExportResult {
  const result = generateCrmCsv(format, leads, loanOfficers, agents);

  const blob = new Blob([result.csvString], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", result.fileName);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return result;
}
