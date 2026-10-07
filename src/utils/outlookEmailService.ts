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
  } catch {
    // ignore local storage errors
  }

  if (!loanOfficer || loanOfficer.name === "Mike Ford" || !loanOfficer.name) {
    return DEFAULT_MIKE_FORD_SIGNATURE;
  }

  // Dynamic signature for another logged-in team member
  const sigLines: string[] = ["Best regards,", "", loanOfficer.name];
  if (loanOfficer.title) sigLines.push(loanOfficer.title);
  if (loanOfficer.company) sigLines.push(loanOfficer.company);
  
  const nmls = loanOfficer.nmlsId || loanOfficer.nmlsNumber;
  if (nmls) {
    sigLines.push(nmls.toString().startsWith("NMLS") ? nmls.toString() : `NMLS #${nmls}`);
  }
  if (loanOfficer.phone) sigLines.push(`Direct: ${loanOfficer.phone}`);
  if (loanOfficer.email) sigLines.push(`Email: ${loanOfficer.email}`);
  if (loanOfficer.websiteUrl) sigLines.push(`Website: ${loanOfficer.websiteUrl}`);
  if (loanOfficer.branch) sigLines.push(`Branch: ${loanOfficer.branch}`);
  sigLines.push("Equal Housing Opportunity | Equal Housing Lender");

  return sigLines.join("\n");
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
  // const loName = loanOfficer?.name || "Mike Ford";
  const agentName = agent?.name || lead.assignedAgent || "";
  const agentBrokerage = agent?.brokerage || (agent as any)?.company || "";
  const agentPhone = agent?.phone || "";

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
  
  let teamSection = "";
  if (agentName) {
    const agDetails = [agentBrokerage, agentPhone ? `📞 ${agentPhone}` : ""].filter(Boolean).join(", ");
    teamSection = `\n\n🤝 YOUR DEDICATED HOMEBUYING TEAM:\nI work closely with ${agentName}${agDetails ? ` (${agDetails})` : ""} to coordinate your financing pre-approval and arrange private property tours with zero stress.`;
  }

  const bodyWithoutSig = `Hi ${firstName},

Thank you for exploring your homebuying options on our interactive portal! Based on your target budget of ${budgetStr} in ${targetCity}, I wanted to reach out directly with some exciting financing options tailored for you.

💡 KEY FINANCING ADVANTAGES FOR ${targetCity.toUpperCase()}:
• Zero-Down USDA Financing: Many homes in and around ${targetCity} qualify for 100% USDA financing ($0 down payment required).
• Oregon Down Payment Assistance: Up to $15,000 in state-sponsored DPA grants or 3.5% Flex assistance to cover your down payment.
• 2-1 Temporary Rate Buydown: Seller concessions can lower your initial interest rate by 2% in Year 1 and 1% in Year 2, saving $350-$500/month!${teamSection}

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
  // const loName = loanOfficer?.name || "Mike Ford";
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
  htmlBody?: string;
  loanOfficer?: LoanOfficerProfile;
  lead?: CapturedLead;
  agent?: RealEstateAgentProfile;
  templateName?: string;
  flyerNames?: string[];
  autoDownloadEml?: boolean;
  onLogOutreach?: (historyItem: EmailHistoryItem) => void;
  onTriggerToast?: (msg: string) => void;
}

/**
 * Generates an RFC 822 MIME-compliant .eml message with the Microsoft Outlook 'X-Unsent: 1'
 * draft header. When opened on Windows or macOS with Microsoft Outlook installed,
 * Outlook immediately opens the native Compose / Draft window with all recipients,
 * attachments, rich HTML styling, and the official work signature pre-populated.
 */
export function generateOutlookEmlContent(options: {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  htmlBody?: string;
}): string {
  const { to, cc, bcc, subject, body, htmlBody } = options;
  const boundary = `----=_Part_OutlookDraft_${Date.now().toString(16)}_${Math.random().toString(36).substring(2, 8)}`;
  
  // Format recipients (Outlook accepts semicolons or commas; RFC 822 uses commas)
  const formatRecipients = (raw?: string) => {
    if (!raw) return "";
    return raw.split(/[;,]/).map((s) => s.trim()).filter(Boolean).join(", ");
  };

  const toFormatted = formatRecipients(to);
  const ccFormatted = formatRecipients(cc);
  const bccFormatted = formatRecipients(bcc);

  let eml = "X-Unsent: 1\r\n";
  if (toFormatted) eml += `To: ${toFormatted}\r\n`;
  if (ccFormatted) eml += `Cc: ${ccFormatted}\r\n`;
  if (bccFormatted) eml += `Bcc: ${bccFormatted}\r\n`;
  eml += `Subject: ${subject || "Loan Financing Update"}\r\n`;
  eml += "MIME-Version: 1.0\r\n";

  if (htmlBody) {
    eml += `Content-Type: multipart/alternative; boundary="${boundary}"\r\n\r\n`;
    
    // Plain text part
    eml += `--${boundary}\r\n`;
    eml += "Content-Type: text/plain; charset=utf-8\r\n";
    eml += "Content-Transfer-Encoding: 8bit\r\n\r\n";
    eml += `${(body || "").replace(/\r\n/g, "\n").replace(/\n/g, "\r\n")}\r\n\r\n`;
    
    // Rich HTML part
    eml += `--${boundary}\r\n`;
    eml += "Content-Type: text/html; charset=utf-8\r\n";
    eml += "Content-Transfer-Encoding: 8bit\r\n\r\n";
    eml += `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: Arial, sans-serif; font-size: 13px; color: #333333; line-height: 1.5;">${htmlBody}</body></html>\r\n\r\n`;
    
    eml += `--${boundary}--\r\n`;
  } else {
    eml += "Content-Type: text/plain; charset=utf-8\r\n";
    eml += "Content-Transfer-Encoding: 8bit\r\n\r\n";
    eml += `${(body || "").replace(/\r\n/g, "\n").replace(/\n/g, "\r\n")}\r\n`;
  }

  return eml;
}

/**
 * Downloads a ready-to-open .eml file that immediately invokes the user's native local
 * Microsoft Outlook client in interactive compose draft mode with full rich styling,
 * unlimited recipients in To/Cc, and complete loan officer branding.
 */
export function downloadOutlookEmlDraft(options: {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  htmlBody?: string;
  fileName?: string;
}): void {
  const emlContent = generateOutlookEmlContent(options);
  const blob = new Blob([emlContent], { type: "message/rfc822;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  
  const rawTitle = options.fileName || options.subject || "Outlook-Draft";
  const sanitized = rawTitle
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .substring(0, 45);
  const filename = `${sanitized || "Outlook-Draft"}.eml`;

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
    URL.revokeObjectURL(url);
  }, 1200);
}

/**
 * Triggers the OS mailto: protocol safely without crashing Windows URL buffer limits
 * (capped at 1,800 chars) and without illegal top-level navigation in sandboxed iframes.
 */
export function triggerLocalMailto(options: {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
}): void {
  const { to, cc, bcc, subject, body } = options;
  if (!to || !to.trim()) return;

  const baseTo = to.trim().replace(/;/g, ",");
  const params: string[] = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);

  // Calculate budget to keep mailtoUri strictly under 1,800 chars
  const baseUri = `mailto:${encodeURIComponent(baseTo)}?${params.join("&")}`;
  let budget = 1800 - baseUri.length;

  if (cc && cc.trim()) {
    const formattedCc = cc.trim().replace(/;/g, ",");
    const encodedCc = encodeURIComponent(formattedCc);
    if (encodedCc.length < 450) {
      params.push(`cc=${encodedCc}`);
      budget -= encodedCc.length + 4;
    } else {
      // If CC list is massive (e.g. 40 agents), keep only what fits safely
      const list = formattedCc.split(",").map((s) => s.trim()).filter(Boolean);
      const safeList: string[] = [];
      let currentLen = 0;
      for (const em of list) {
        if (currentLen + em.length + 3 > 300) break;
        safeList.push(em);
        currentLen += em.length + 3;
      }
      if (safeList.length > 0) {
        params.push(`cc=${encodeURIComponent(safeList.join(","))}`);
        budget -= 320;
      }
    }
  }

  if (bcc && bcc.trim() && budget > 100) {
    params.push(`bcc=${encodeURIComponent(bcc.trim().replace(/;/g, ","))}`);
    budget -= 100;
  }

  // Budget remaining length for body excerpt
  if (body && budget > 120) {
    let bodyText = body;
    const maxChars = Math.max(200, Math.floor((budget - 120) / 2.5));
    if (bodyText.length > maxChars) {
      bodyText =
        bodyText.slice(0, maxChars) +
        "\n\n[Note: Complete message, property links, and official work signature are copied to your clipboard & loaded in the downloaded Outlook Draft file. Paste with Ctrl+V if needed.]";
    }
    params.push(`body=${encodeURIComponent(bodyText)}`);
  }

  const mailtoUri = `mailto:${encodeURIComponent(baseTo)}${params.length > 0 ? `?${params.join("&")}` : ""}`;

  // Safe invocation without _top navigation (which is blocked by sandboxed iframes)
  try {
    const hiddenIframe = document.createElement("iframe");
    hiddenIframe.style.display = "none";
    hiddenIframe.src = mailtoUri;
    document.body.appendChild(hiddenIframe);
    setTimeout(() => {
      if (document.body.contains(hiddenIframe)) {
        document.body.removeChild(hiddenIframe);
      }
    }, 2500);
  } catch {
    try {
      const a = document.createElement("a");
      a.href = mailtoUri;
      a.target = "_self";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a);
      }, 500);
    } catch {
      window.location.href = mailtoUri;
    }
  }
}

/**
 * Opens Microsoft 365 / Outlook on the Web deeplink as a convenient cloud fallback.
 */
export function openOutlookWebDraft(options: {
  to: string;
  cc?: string;
  subject: string;
  body: string;
}): void {
  const { to, cc, subject, body } = options;
  const webTo = encodeURIComponent(to.replace(/;/g, ","));
  const webCc = cc ? encodeURIComponent(cc.replace(/;/g, ",")) : "";
  const webSubject = encodeURIComponent(subject || "");
  const webBody = encodeURIComponent(body || "");
  const url = `https://outlook.office.com/mail/deeplink/compose?to=${webTo}${webCc ? `&cc=${webCc}` : ""}&subject=${webSubject}&body=${webBody}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Launches the user's local installed Microsoft Outlook email client.
 * 1. Generates and triggers an RFC 822 .eml draft file with 'X-Unsent: 1'
 *    (opens directly in installed desktop Outlook with unlimited CC recipients and rich HTML).
 * 2. Signals the local OS mailto: protocol handler with safe URL length.
 * 3. Copies rich formatted text and plain text to the clipboard.
 * 4. Logs to CRM outreach tracking.
 */
export function launchLocalOutlookDraft(options: LaunchOutlookOptions): { emlDownloaded: boolean; mailtoTriggered: boolean } {
  const {
    to,
    cc,
    bcc,
    subject,
    body,
    htmlBody,
    loanOfficer,
    lead,
    agent,
    templateName = "Outlook Outreach",
    autoDownloadEml = true,
    onLogOutreach,
    onTriggerToast
  } = options;

  if (!to || !to.trim()) {
    alert("Please provide a valid recipient email address.");
    return { emlDownloaded: false, mailtoTriggered: false };
  }

  // 1. Ensure authentic work email signature is appended
  const fullBody = appendWorkEmailSignature(body, loanOfficer);
  
  let fullHtml = htmlBody;
  if (!fullHtml) {
    fullHtml = `<div>${fullBody.replace(/\n/g, "<br/>")}</div>`;
  }

  // 2. Pre-copy formatted body to clipboard (both rich HTML and plain text)
  try {
    if (navigator?.clipboard) {
      if ((window as any).ClipboardItem && fullHtml) {
        const textBlob = new Blob([fullBody], { type: "text/plain" });
        const htmlBlob = new Blob([fullHtml], { type: "text/html" });
        navigator.clipboard.write([
          new ClipboardItem({
            "text/plain": textBlob,
            "text/html": htmlBlob,
          })
        ]).catch(() => {
          navigator.clipboard?.writeText?.(fullBody).catch(() => {});
        });
      } else if (navigator.clipboard.writeText) {
        navigator.clipboard.writeText(fullBody).catch(() => {});
      }
    }
  } catch {
    // non-fatal
  }

  // 3. Trigger Local Outlook native EML Draft (bypasses all character limits & works with installed Outlook)
  let emlSuccess = false;
  if (autoDownloadEml !== false) {
    try {
      const draftName = `Outlook-Draft-${(lead?.fullName || agent?.name || subject || "Outreach").replace(/[^a-zA-Z0-9]/g, "-")}`;
      downloadOutlookEmlDraft({
        to,
        cc,
        bcc,
        subject,
        body: fullBody,
        htmlBody: fullHtml,
        fileName: draftName
      });
      emlSuccess = true;
    } catch (err) {
      console.warn("Failed to generate .eml draft:", err);
    }
  }

  // 4. Trigger local install Outlook mailto: protocol handler (safely length-capped)
  let mailtoSuccess = false;
  try {
    triggerLocalMailto({
      to,
      cc,
      bcc,
      subject,
      body: fullBody
    });
    mailtoSuccess = true;
  } catch (err) {
    console.warn("Failed to invoke mailto handler:", err);
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
  const toastMsg = `Draft email launched for your local Outlook client with your work signature for ${recipientName}!`;
  if (onTriggerToast) {
    onTriggerToast(toastMsg);
  }

  return { emlDownloaded: emlSuccess, mailtoTriggered: mailtoSuccess };
}
