/**
 * Twilio Gate & SMS Dormancy Service
 * 
 * STANDING RULE: Twilio is DORMANT in this suite.
 * Live SMS sending is disabled by default (process.env.TWILIO_LIVE_SENDS !== "true").
 * Two-way Firestore property notes are the primary buyer communication channel.
 */

import { getFirestore } from "firebase-admin/firestore";

/**
 * Returns true only if live Twilio sends are explicitly authorized via environment variable.
 */
export function isTwilioLiveEnabled(): boolean {
  return process.env.TWILIO_LIVE_SENDS === "true";
}

/**
 * Verifies if a buyer/lead has valid, unrevoked TCPA SMS consent on file.
 * Requires smsConsentAuthorized === true AND a stored consent timestamp,
 * or a record in the tcpa_consents collection.
 */
export async function checkBuyerSmsConsent(
  phone: string,
  dbInstance?: any
): Promise<{ hasConsent: boolean; reason?: string; consentRecord?: any }> {
  if (!phone) {
    return { hasConsent: false, reason: "No phone number provided" };
  }

  const cleanPhone = phone.replace(/\D/g, "");
  if (!cleanPhone) {
    return { hasConsent: false, reason: "Invalid phone number format" };
  }

  try {
    let db = dbInstance;
    if (!db) {
      try {
        db = getFirestore();
      } catch {
        db = null;
      }
    }

    if (!db) {
      return { hasConsent: false, reason: "Database unavailable for consent verification" };
    }

    // 1. Check dedicated tcpa_consents collection
    try {
      const tcpaSnap = await db.collection("tcpa_consents").where("phoneClean", "==", cleanPhone).limit(1).get();
      if (!tcpaSnap.empty) {
        const consentData = tcpaSnap.docs[0].data();
        if (consentData.revoked !== true && (consentData.timestamp || consentData.consentedAt)) {
          return { hasConsent: true, consentRecord: consentData };
        }
      }
    } catch {
      // Continue to check leads collection
    }

    // 2. Check leads collection
    try {
      const leadsSnap = await db.collection("leads").get();
      for (const doc of leadsSnap.docs) {
        const data = doc.data();
        const leadPhoneClean = (data.phone || data.cellPhone || "").replace(/\D/g, "");
        if (leadPhoneClean === cleanPhone || leadPhoneClean.endsWith(cleanPhone) || cleanPhone.endsWith(leadPhoneClean)) {
          const hasAuthorized = data.smsConsentAuthorized === true;
          const hasTimestamp = Boolean(data.smsConsentTimestamp || data.tcpaConsentTimestamp || data.consentTimestamp || data.createdAt);
          const isNotOptedOut = !data.smsOptOutTimestamp && data.smsOptOut !== true;

          if (hasAuthorized && hasTimestamp && isNotOptedOut) {
            return {
              hasConsent: true,
              consentRecord: {
                leadId: doc.id,
                source: data.smsConsentSource || "lead_intake",
                timestamp: data.smsConsentTimestamp || data.tcpaConsentTimestamp || data.createdAt,
                ip: data.smsConsentIp || null,
              }
            };
          } else {
            return {
              hasConsent: false,
              reason: !hasAuthorized 
                ? "Buyer has not authorized SMS consent (smsConsentAuthorized !== true)"
                : !hasTimestamp
                  ? "Missing required stored TCPA consent timestamp"
                  : "Buyer has opted out of SMS messages"
            };
          }
        }
      }
    } catch {
      // Query error
    }

    // 3. Check property_conversations for action items with TCPA opt-in
    try {
      const convSnap = await db.collection("property_conversations").limit(20).get();
      for (const doc of convSnap.docs) {
        const cData = doc.data();
        const items = cData.pendingActionItems || [];
        const matchingItem = items.find((item: any) => {
          const itemPhone = (item.tcpaPhoneProvided || item.phone || "").replace(/\D/g, "");
          return itemPhone && (itemPhone === cleanPhone || cleanPhone.endsWith(itemPhone));
        });

        if (matchingItem && matchingItem.tcpaSmsOptIn === true && matchingItem.createdAt) {
          return {
            hasConsent: true,
            consentRecord: {
              conversationId: doc.id,
              source: "property_conversation_action_item",
              timestamp: matchingItem.createdAt,
            }
          };
        }
      }
    } catch {
      // Query error
    }

    return { hasConsent: false, reason: "No verified TCPA SMS consent on file for this number" };
  } catch (err: any) {
    return { hasConsent: false, reason: `Consent check error: ${err.message}` };
  }
}

/**
 * Standard gate wrapper for any outbound Twilio SMS dispatch attempt.
 */
export async function attemptTwilioSmsDispatch(params: {
  to: string;
  from: string;
  body: string;
  mediaUrl?: string;
  accountSid: string;
  authToken: string;
  isBuyer?: boolean;
  dbInstance?: any;
  auditLogger?: (event: string, meta: any) => Promise<any> | void;
}): Promise<{
  success: boolean;
  error?: string;
  httpStatus: number;
  messageSid?: string;
  status?: string;
  to?: string;
  from?: string;
  dateCreated?: string;
}> {
  const { to, from, body, mediaUrl, accountSid, authToken, isBuyer = false, dbInstance, auditLogger } = params;

  // PART 2: Gate Check
  if (!isTwilioLiveEnabled()) {
    const logMeta = {
      event: "twilio_dormant_skipped",
      reason: "Twilio live transmission is dormant (TWILIO_LIVE_SENDS !== 'true')",
      targetPhone: to ? `${to.slice(0, 4)}***${to.slice(-4)}` : "unknown",
      attemptedAt: new Date().toISOString(),
    };
    console.warn(`[TWILIO DORMANT] twilio_dormant_skipped — Blocked outbound SMS to ${logMeta.targetPhone}`);
    if (auditLogger) {
      await auditLogger("twilio_dormant_skipped", logMeta);
    }
    return {
      success: false,
      error: "twilio_dormant",
      httpStatus: 403,
    };
  }

  // PART 3: Consent Check (if recipient is a buyer or client)
  if (isBuyer) {
    const consentResult = await checkBuyerSmsConsent(to, dbInstance);
    if (!consentResult.hasConsent) {
      const consentMeta = {
        event: "consent_blocked",
        reason: consentResult.reason || "No valid TCPA consent on file",
        targetPhone: to ? `${to.slice(0, 4)}***${to.slice(-4)}` : "unknown",
        attemptedAt: new Date().toISOString(),
      };
      console.warn(`[TWILIO CONSENT BLOCKED] consent_blocked — Blocked send to ${consentMeta.targetPhone}: ${consentResult.reason}`);
      if (auditLogger) {
        await auditLogger("consent_blocked", consentMeta);
      }
      return {
        success: false,
        error: "consent_blocked",
        httpStatus: 403,
      };
    }
  }

  // Execute live API call only if gate is open and consent verified
  try {
    const cleanTo = to.replace(/[^0-9+]/g, "");
    const formattedTo = cleanTo.startsWith("+")
      ? cleanTo
      : cleanTo.length === 10
        ? `+1${cleanTo}`
        : `+${cleanTo}`;

    const twilioEndpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const authHeader = "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    const formParams = new URLSearchParams();
    formParams.append("To", formattedTo);
    formParams.append("From", from);
    formParams.append("Body", body);
    if (mediaUrl && (mediaUrl.startsWith("http://") || mediaUrl.startsWith("https://"))) {
      formParams.append("MediaUrl", mediaUrl);
    }

    const twilioRes = await fetch(twilioEndpoint, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formParams.toString(),
    });

    const twilioData: any = await twilioRes.json().catch(() => ({}));

    if (!twilioRes.ok) {
      return {
        success: false,
        error: twilioData.message || twilioData.detail || `Twilio API error HTTP ${twilioRes.status}`,
        httpStatus: twilioRes.status,
      };
    }

    return {
      success: true,
      httpStatus: 200,
      messageSid: twilioData.sid,
      status: twilioData.status,
      to: twilioData.to,
      from: twilioData.from,
      dateCreated: twilioData.date_created,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to dispatch SMS via Twilio API",
      httpStatus: 500,
    };
  }
}
