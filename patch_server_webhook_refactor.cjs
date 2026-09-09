const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Add import if not exists
if (!code.includes('handleIncomingTwilioWebhook')) {
    code = code.replace(
        'import { searchLiveRegistry } from "./liveWebSearch.js";',
        'import { searchLiveRegistry } from "./liveWebSearch.js";\nimport { handleIncomingTwilioWebhook } from "./src/services/smsSyncService.js";'
    );
}

// Replace the inline webhook logic with the service call
const oldWebhookLogic = `app.post("/api/twilio/webhook", express.urlencoded({ extended: false }), async (req, res) => {
    try {
      const { From, Body } = req.body;
      console.log(\`[Twilio Webhook] Received SMS from \${From}: \${Body}\`);
      
      // Parse the LO phone number and find the most recent pending property action item
      // For this demo/applet environment, we'll write a generic resolution logic.
      
      if (!adminApp) {
        console.error("Firebase Admin not initialized.");
        return res.status(500).send("<Response><Message>System error.</Message></Response>");
      }
      
      const db = getFirestore();
      // Query property_conversations for pending action items. 
      // In a production app, we would match 'From' with the LO's registered mobile number.
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
      
      if (targetConversationId && targetActionItemId) {
        const conversationRef = db.collection("property_conversations").doc(targetConversationId);
        const docSnap = await conversationRef.get();
        if (docSnap.exists) {
          const data = docSnap.data();
          const items = data.pendingActionItems || [];
          const idx = items.findIndex((i: any) => i.id === targetActionItemId);
          if (idx !== -1) {
            items[idx].status = 'resolved';
            items[idx].resolvedAt = new Date().toISOString();
            items[idx].resolutionText = Body;
            items[idx].resolvedBy = "LO via SMS";
          }
          
          const messages = data.messages || [];
          const relatedMsgIdx = messages.findIndex((m: any) => m.id === targetActionItemId);
          if (relatedMsgIdx !== -1) {
            messages[relatedMsgIdx].status = 'resolved';
          }
          
          const newMsg = {
            id: 'msg_' + Date.now().toString(),
            sender: 'loan_officer',
            senderName: "Loan Officer",
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
          
          console.log(\`[Twilio Webhook] Successfully routed SMS reply to \${targetLeadName}'s property thread.\`);
        }
      }
      
      // Twilio requires TwiML response
      res.type('text/xml');
      res.send('<Response></Response>');
    } catch (err) {
      console.error("Twilio webhook error:", err);
      res.status(500).send("<Response></Response>");
    }
  });`;

const newWebhookLogic = `app.post("/api/twilio/webhook", express.urlencoded({ extended: false }), async (req, res) => {
    // Delegated to dedicated smsSyncService for payload parsing, sender verification, and sync
    return handleIncomingTwilioWebhook(req, res, adminApp);
  });`;

if (code.includes('app.post("/api/twilio/webhook"')) {
    // We will use substring replacement because exact regex on large multiline might fail due to whitespace
    const startIdx = code.indexOf('app.post("/api/twilio/webhook"');
    const endStr = 'res.status(500).send("<Response></Response>");\n    }\n  });';
    const endIdx = code.indexOf(endStr, startIdx);
    
    if (startIdx !== -1 && endIdx !== -1) {
        code = code.substring(0, startIdx) + newWebhookLogic + code.substring(endIdx + endStr.length);
        fs.writeFileSync('server.ts', code);
        console.log("Successfully refactored webhook to use smsSyncService");
    } else {
        console.log("Could not find exact block to replace");
    }
}
