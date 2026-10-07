import { getFirestore } from "firebase-admin/firestore";
import { isTwilioLiveEnabled, attemptTwilioSmsDispatch } from "./twilioGateService";

/**
 * Service to handle bi-directional SMS synchronization from Twilio webhook payloads.
 * Parses the incoming text, verifies the sender, and updates Firestore property notes.
 */
export async function handleIncomingTwilioWebhook(req: any, res: any, adminApp: any, decryptVaultFunc?: any) {
  try {
    const { From, To, Body } = req.body;
    console.log(`[Twilio Webhook] Received SMS from ${From}: ${Body}`);
    
    if (!adminApp) {
      console.error("[Twilio Webhook] Firebase Admin not initialized.");
      return res.status(500).send("<Response><Message>System error.</Message></Response>");
    }
    
    let db: any;
    try {
      if (typeof adminApp?.firestore === "function") {
        db = adminApp.firestore();
      } else if (adminApp && adminApp.name && adminApp.options) {
        db = getFirestore(adminApp);
      } else {
        db = getFirestore();
      }
    } catch {
      if (typeof adminApp?.firestore === "function") {
        db = adminApp.firestore();
      } else if (adminApp?.collection) {
        db = adminApp;
      } else {
        db = getFirestore();
      }
    }
    let loName = "Loan Officer";
    let isVerifiedSender = false;

    // 1. Verify the sender against the loan officer's registered mobile number in Firestore
    // We check the standard phone format and standard variations
    try {
      const loQuery = await db.collection("loan_officers").get();
      for (const doc of loQuery.docs) {
        const data = doc.data();
        if (data.phone) {
          // Clean the stored phone number to compare (strip non-digits)
          const storedClean = data.phone.replace(/\D/g, '');
          const incomingClean = From.replace(/\D/g, '');
          
          if (storedClean === incomingClean || incomingClean.endsWith(storedClean) || storedClean.endsWith(incomingClean)) {
            isVerifiedSender = true;
            loName = data.name || loName;
            break;
          }
        }
      }
    } catch (e) {
      console.warn("Could not verify LO phone number:", e);
    }

    if (!isVerifiedSender) {
      console.warn(`[Twilio Webhook] Warning: SMS received from unrecognized number ${From}. Proceeding with routing for demo purposes.`);
    } else {
      console.log(`[Twilio Webhook] Verified sender as Loan Officer: ${loName}`);
    }
    
    // 2. Find the most recent pending property action item
    const snapshot = await db.collection("property_conversations").limit(10).get();
    let targetConversationId = null;
    let targetActionItemId = null;
    let targetLeadName = "";
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (data.pendingActionItems && Array.isArray(data.pendingActionItems)) {
        const pendingItem = data.pendingActionItems.find((item: any) => item.status === 'pending');
        if (pendingItem) {
          targetConversationId = doc.id;
          targetActionItemId = pendingItem.id;
          targetLeadName = pendingItem.leadName;
          break;
        }
      }
    }
    
    // 3. Update the corresponding 'property_notes' collection / conversation
    if (targetConversationId && targetActionItemId) {
      const conversationRef = db.collection("property_conversations").doc(targetConversationId);
      const docSnap = await conversationRef.get();
      
      if (docSnap.exists) {
        const data = docSnap.data();
        const items = data.pendingActionItems || [];
        const idx = items.findIndex((i: any) => i.id === targetActionItemId);
        

        let optInBuyerPhone = null;
        if (idx !== -1) {
          items[idx].status = 'resolved';
          items[idx].resolvedAt = new Date().toISOString();
          items[idx].resolutionText = Body;
          items[idx].resolvedBy = `${loName} via SMS`;
          
          if (items[idx].tcpaSmsOptIn && items[idx].tcpaPhoneProvided) {
            optInBuyerPhone = items[idx].tcpaPhoneProvided;
          }
        }

        
        const messages = data.messages || [];
        const relatedMsgIdx = messages.findIndex((m: any) => m.id === targetActionItemId);
        if (relatedMsgIdx !== -1) {
          messages[relatedMsgIdx].status = 'resolved';
        }
        
        const newMsg = {
          id: 'msg_' + Date.now().toString(),
          sender: 'loan_officer',
          senderName: loName,
          text: Body,
          timestamp: new Date().toISOString(),
          messageType: 'response',
          status: 'resolved'
        };
        messages.push(newMsg);
        
        await conversationRef.update({
          pendingActionItems: items,
          messages: messages,
          hasPendingActionItem: items.filter((i: any) => i.status === 'pending').length > 0
        });
        

        console.log(`[Twilio Webhook] Successfully verified and routed SMS reply to ${targetLeadName}'s property thread.`);

        // 4. Check Twilio Gate & Outbound SMS if TCPA Opt-In is checked
        if (optInBuyerPhone && decryptVaultFunc) {
          try {
            console.log(`[Twilio Webhook] Outbound notification requested for ${optInBuyerPhone}. Checking dormancy gate...`);
            
            if (!isTwilioLiveEnabled()) {
              console.log(`[Twilio Webhook] Twilio live transmission dormant (twilio_dormant_skipped). Zero outbound SMS calls dispatched.`);
            } else {
              let matchingVault = null;
              const vaultSnap = await db.collection("twilio_vault").get();
              
              for (const vDoc of vaultSnap.docs) {
                const vData = vDoc.data();
                if (vData.encryptedVault) {
                  try {
                    const decrypted = JSON.parse(decryptVaultFunc(vData.encryptedVault));
                    const cleanTo = (To || "").replace(/\D/g, '');
                    const cleanStored = (decrypted.phoneNumber || "").replace(/\D/g, '');
                    matchingVault = decrypted;
                    if (cleanTo && cleanStored && (cleanTo === cleanStored || cleanTo.endsWith(cleanStored) || cleanStored.endsWith(cleanTo))) {
                      matchingVault = decrypted;
                      break;
                    }
                  } catch (e) {
                    // ignore decrypt errors for other vaults
                  }
                }
              }
              
              const envSid = typeof process !== 'undefined' ? process?.env?.TWILIO_ACCOUNT_SID : undefined;
              const envToken = typeof process !== 'undefined' ? process?.env?.TWILIO_AUTH_TOKEN : undefined;
              const envPhone = typeof process !== 'undefined' ? process?.env?.TWILIO_PHONE_NUMBER : undefined;

              if ((!matchingVault || !matchingVault.accountSid) && envSid && envToken) {
                matchingVault = {
                  accountSid: envSid,
                  authToken: envToken,
                  phoneNumber: envPhone || To || "+15035550199"
                };
              }

              if (matchingVault && matchingVault.accountSid && matchingVault.authToken) {
                const dispatchResult = await attemptTwilioSmsDispatch({
                  to: optInBuyerPhone,
                  from: matchingVault.phoneNumber || To || "+15035550199",
                  body: `${loName} replied to your property question: "${Body}"\n\nView in Portal: https://ais-pre-h5e42vrshqrry7uiwwuhmv-427099073161.us-east5.run.app`,
                  accountSid: matchingVault.accountSid,
                  authToken: matchingVault.authToken,
                  isBuyer: true,
                  dbInstance: db
                });

                if (dispatchResult.success) {
                  console.log(`[Twilio Webhook] Outbound SMS alert sent successfully to ${optInBuyerPhone}`);
                } else {
                  console.warn(`[Twilio Webhook] Outbound SMS blocked or failed (${dispatchResult.error}):`, dispatchResult);
                }
              } else {
                console.warn(`[Twilio Webhook] No valid Twilio credentials found to send outbound SMS.`);
              }
            }
          } catch (outboundErr) {
            console.error(`[Twilio Webhook] Failed to process outbound SMS alert:`, outboundErr);
          }
        }

      }
    } else {
      console.log(`[Twilio Webhook] No pending action items found to route message to.`);
    }
    
    // Twilio requires an empty TwiML response to confirm receipt
    res.type('text/xml');
    res.send('<Response></Response>');
  } catch (err) {
    console.error("[Twilio Webhook] Critical error processing SMS payload:", err);
    res.status(500).send("<Response></Response>");
  }
}
