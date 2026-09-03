import { CapturedLead, LoanOfficerProfile, RealEstateAgentProfile, EmailHistoryItem } from "../types";

/**
 * Universal Outlook Email & Work Signature Service
 * Ensures all "Draft Email" actions across the entire dashboard use the user's
 * local installed Microsoft Outlook email client with their official work email signature.
 */

const STORAGE_KEY_CUSTOM_SIGNATURE = "user_work_email_signature";

export const DEFAULT_MIKE_FORD_SIGNATURE = `Best regards,

Mike Ford
Senior Loan Officer | Producing Branch Manager
Cornerstone First Mortgage
NMLS #288455 | Company NMLS #173855
Direct: (541) 729-0819 | Mobile: (541) 729-0819
Email: mford@cfmtg.com | fordmj@gmail.com
Website: https://cfmtg.com/mford/
Branch Address: 1500 Valley River Drive, Suite 330, Eugene, OR 97401
Lake Oswego Branch: Serving Oregon & Washington Homebuyers State-Wide
Equal Housing Opportunity | Equal Housing Lender`;

/**
 * Resolves the active work email signature.
 * Checks for custom stored signature first, then uses current LO profile or Mike Ford default.
 */
export function getWorkEmailSignature(loanOfficer?: LoanOfficerProfile): string {
  try {
    const custom = localStorage.getItem(STORAGE_KEY_CUSTOM_SIGNATURE);
    if (custom && custom.trim().length > 10) {
      return custom.trim();
    }
  } catch (e) {
    // ignore local storage errors
  }

  if (!loanOfficer || loanOfficer.name === "Mike Ford" || !loanOfficer.name) {
    return DEFAULT_MIKE_FORD_SIGNATURE;
  }

  // Dynamic signature for another logged-in team member
  return `Best regards,

${loanOfficer.name}
${loanOfficer.title || "Loan Officer"}
${loanOfficer.company || "Cornerstone First Mortgage"}
${loanOfficer.nmlsId ? (loanOfficer.nmlsId.startsWith("NMLS") ? loanOfficer.nmlsId : `NMLS #${loanOfficer.nmlsId}`) : "NMLS #288455"} | Company NMLS #173855
Direct: ${loanOfficer.phone || "(541) 729-0819"}
Email: ${loanOfficer.email || "mford@cfmtg.com"}
${loanOfficer.websiteUrl ? `Website: ${loanOfficer.websiteUrl}\n` : ""}${loanOfficer.branch ? `Branch: ${loanOfficer.branch}\n` : ""}Equal Housing Opportunity | Equal Housing Lender`;
}

/**
 * Saves a user-customized work signature to local storage
 */
export function saveWorkEmailSignature(signature: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_SIGNATURE, signature.trim());
  } catch (e) {
    console.error("Failed to save work signature:", e);
  }
}

/**
 * Appends the work email signature to an email body if not already present.
 */
export function appendWorkEmailSignature(bodyText: string, loanOfficer?: LoanOfficerProfile): string {
  const signature = getWorkEmailSignature(loanOfficer);
  const trimmedBody = (bodyText || "").trim();

  // If already contains signature keywords, avoid double-attaching
  if (
    trimmedBody.includes("Cornerstone First Mortgage") &&
    (trimmedBody.includes("NMLS") || trimmedBody.includes("Senior Loan Officer"))
  ) {
    return trimmedBody;
  }

  if (trimmedBody.endsWith(signature.trim())) {
    return trimmedBody;
  }

  return `${trimmedBody}\n\n${signature}`;
}

/**
 * Generates an intelligent, personalized email draft for a captured website lead.
 */
export function generateLeadDraftEmailContent(
  lead: CapturedLead,
  loanOfficer?: LoanOfficerProfile,
  agent?: RealEstateAgentProfile
): { subject: string; body: string } {
  const firstName = (lead.fullName || (lead as any).name || "there").split(" ")[0];
  const targetCity = (lead as any).preferredArea || (lead as any).city || lead.preferredLocations || "your target area";
  const budgetStr = (lead as any).targetPrice 
    ? `$${Number((lead as any).targetPrice).toLocaleString()}` 
    : (lead.targetPriceRange || "$425,000");
  const loName = loanOfficer?.name || "Mike Ford";
  const agentName = agent?.name || lead.assignedAgent || "Sarah Jenkins";
  const agentBrokerage = agent?.brokerage || "Cascade Valley Real Estate";
  const agentPhone = agent?.phone || "(503) 555-0144";

  // Check if lead has saved scenarios
  if (lead.savedScenarios && lead.savedScenarios.length > 0) {
    const latestScen = lead.savedScenarios[0];
    if (latestScen.draftBorrowerEmailSubject && latestScen.draftBorrowerEmailBody) {
      return {
        subject: latestScen.draftBorrowerEmailSubject,
        body: appendWorkEmailSignature(latestScen.draftBorrowerEmailBody, loanOfficer)
      };
    }
  }

  const subject = `Your ${targetCity} Homebuyer Payment Options & Financing Blueprint (${budgetStr})`;
  
  const bodyWithoutSig = `Hi ${firstName},

Thank you for exploring your homebuying options on our interactive portal! Based on your target budget of ${budgetStr} in ${targetCity}, I wanted to reach out directly with some exciting financing options tailored for you.

💡 KEY FINANCING ADVANTAGES FOR ${targetCity.toUpperCase()}:
• Zero-Down USDA Financing: Many homes in and around ${targetCity} qualify for 100% USDA financing ($0 down payment required).
• Oregon Down Payment Assistance: Up to $15,000 in state-sponsored DPA grants or 3.5% Flex assistance to cover your down payment.
• 2-1 Temporary Rate Buydown: Seller concessions can lower your initial interest rate by 2% in Year 1 and 1% in Year 2, saving $350-$500/month!

🤝 YOUR DEDICATED HOMEBUYING TEAM:
I work closely with ${agentName} (${agentBrokerage}, 📞 ${agentPhone}) to coordinate your financing pre-approval and arrange private property tours with zero stress.

Would you be open to a quick 10-minute call this week to review your exact monthly numbers and ensure you're in the strongest position possible?`;

  return {
    subject,
    body: appendWorkEmailSignature(bodyWithoutSig, loanOfficer)
  };
}

/**
 * Generates a co-branded partnership email draft for a real estate agent partner.
 */
export function generateAgentDraftEmailContent(
  agent: RealEstateAgentProfile,
  loanOfficer?: LoanOfficerProfile,
  customPortalUrl?: string
): { subject: string; body: string } {
  const firstName = (agent.name || "Partner").split(" ")[0];
  const loName = loanOfficer?.name || "Mike Ford";
  const portalUrl = customPortalUrl || (agent as any).coBrandedLandingUrl || agent.websiteUrl || `https://geosphere.mortgage/agent/${(agent as any).customSlug || "partner"}`;

  const subject = `Co-Branded Homebuyer Portal & 2-1 Buydown Flyer Kit for ${agent.name}`;
  
  const bodyWithoutSig = `Hi ${firstName},

I wanted to share a dedicated marketing technology asset I created for our partnership: a co-branded digital homebuyer portal featuring both of our contact information, headshots, and interactive loan tools for your buyer clients.

Here is your dedicated portal link:
${portalUrl}

TOP CLIENT-CONVERTING TOOLS INCLUDED:
1. Live 2-1 Seller Rate Buydown Engine: Shows buyers how to save $350-$500/month without seller price drops.
2. Oregon Bond & Flex DPA 3.5% Grant Finders: Instantly identifies down payment assistance for first-time buyers.
3. Co-Branded Open House Flyer Generator: Generates instant flyers with custom QR codes linking back to our shared portal.

Let's connect this week to launch a co-branded campaign for your upcoming listings or open houses!`;

  return {
    subject,
    body: appendWorkEmailSignature(bodyWithoutSig, loanOfficer)
  };
}

export interface LaunchOutlookOptions {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  loanOfficer?: LoanOfficerProfile;
  lead?: CapturedLead;
  agent?: RealEstateAgentProfile;
  templateName?: string;
  flyerNames?: string[];
  onLogOutreach?: (historyItem: EmailHistoryItem) => void;
  onTriggerToast?: (msg: string) => void;
}

/**
 * Launches the user's local installed Microsoft Outlook email client via mailto: protocol
 * with the full email draft and authentic work email signature pre-populated.
 * Also copies the message to the clipboard as a convenient fallback.
 */
export function launchLocalOutlookDraft(options: LaunchOutlookOptions): void {
  const {
    to,
    cc,
    bcc,
    subject,
    body,
    loanOfficer,
    lead,
    agent,
    templateName = "Outlook Outreach",
    onLogOutreach,
    onTriggerToast
  } = options;

  if (!to || !to.trim()) {
    alert("Please provide a valid recipient email address.");
    return;
  }

  // 1. Ensure authentic work email signature is appended
  const fullBody = appendWorkEmailSignature(body, loanOfficer);

  // 2. Pre-copy formatted body to clipboard so user can effortlessly paste if Outlook rich formatting is desired
  try {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(fullBody).catch(() => {});
    }
  } catch (e) {
    // non-fatal
  }

  // 3. Build RFC-compliant mailto URI with encoded subject and body
  const params: string[] = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (fullBody) params.push(`body=${encodeURIComponent(fullBody)}`);
  if (cc) params.push(`cc=${encodeURIComponent(cc)}`);
  if (bcc) params.push(`bcc=${encodeURIComponent(bcc)}`);

  const mailtoUri = `mailto:${encodeURIComponent(to.trim())}${params.length > 0 ? `?${params.join("&")}` : ""}`;

  // 4. Trigger local install Outlook using top-level anchor navigation (safe in sandboxed iframes)
  try {
    const a = document.createElement("a");
    a.href = mailtoUri;
    a.target = "_top";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
    }, 500);
  } catch (err) {
    // Fallback direct location assignment
    try {
      window.location.href = mailtoUri;
    } catch (err2) {
      window.open(mailtoUri, "_top");
    }
  }

  // 5. Create audit history log item for CRM tracking
  const timestamp = new Date().toISOString();
  const loName = loanOfficer?.name || "Mike Ford";
  const recipientName = lead?.fullName || agent?.name || to;

  const historyItem: EmailHistoryItem = {
    id: `eh-outlook-${Date.now()}`,
    timestamp,
    templateType: templateName,
    subject,
    channel: "outlook",
    recipientEmail: to,
    recipientName,
    sentBy: `${loName} (Cornerstone First Mortgage)`,
    status: "sent",
    notes: `Local Outlook email draft launched with authentic work email signature.`
  };

  if (onLogOutreach) {
    onLogOutreach(historyItem);
  }

  // 6. User feedback confirmation toast
  const toastMsg = `📧 Draft email opened in your local Outlook with your work email signature for ${recipientName}!`;
  if (onTriggerToast) {
    onTriggerToast(toastMsg);
  }
}
