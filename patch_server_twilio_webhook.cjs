const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const webhookCode = `
  // API Route: Twilio SMS Webhook for Incoming LO Replies
  app.post("/api/twilio/webhook", express.urlencoded({ extended: false }), async (req, res) => {
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
  });
`;

code = code.replace(
  '// API Route: Twilio SMS Carrier Integration Proxy', 
  webhookCode + '\n  // API Route: Twilio SMS Carrier Integration Proxy'
);

fs.writeFileSync('server.ts', code);
console.log("Successfully patched server.ts with Twilio Webhook");
