const fs = require('fs');
let c = fs.readFileSync('server.ts', 'utf8');

if (!c.includes('/api/functions/trigger-price-drop')) {
    const functionCode = `
  // =======================================================================
  // SIMULATED FIREBASE CLOUD FUNCTION: Price Drop Monitor
  // =======================================================================
  // In a production Firebase environment, this would be deployed via the 
  // Firebase CLI as a Pub/Sub Scheduled Function or HTTPS Callable Function.
  // We expose it here as an Express API route so it can be tested in the preview.
  app.post("/api/functions/trigger-price-drop", async (req, res) => {
    try {
      const { leadEmail, leadName, propertyId, dropAmount } = req.body;
      
      console.log(\`[Firebase Cloud Function Log] Executing price drop monitor for \${leadEmail}...\`);
      
      // Simulate Firebase Admin SDK Firestore Update
      // admin.firestore().collection('properties').doc(propertyId).update({ priceDropAmount: dropAmount });

      // Simulate sending an email via SendGrid/Mailgun triggered by Firebase
      const emailPayload = {
        to: leadEmail,
        subject: \`🔥 Price Drop Alert: Your saved property dropped by $\${dropAmount.toLocaleString()}!\`,
        htmlBody: \`<p>Hi \${leadName},</p><p>Great news! A property on your tracker just dropped in price by <strong>$\${dropAmount.toLocaleString()}</strong>.</p><p>Check your dashboard to see your new monthly payment.</p>\`
      };

      // Simulate sending a Firebase Cloud Messaging (FCM) Push Notification
      const fcmPayload = {
        token: "device_token_xyz_123",
        notification: {
          title: "🔥 Price Drop Detected!",
          body: \`A saved property dropped by $\${dropAmount.toLocaleString()}! Tap to view updated map.\`
        },
        data: {
          action: "open_property_tracker",
          propertyId: propertyId
        }
      };

      console.log(\`[Firebase Cloud Function Log] FCM Push Notification dispatched.\`);

      res.json({
        success: true,
        message: "Cloud function executed successfully.",
        logs: [
          \`Queried MLS/Rentcast for recent price changes.\`,
          \`Detected $\${dropAmount.toLocaleString()} drop for property ID: \${propertyId}.\`,
          \`Updated Firestore document for property.\`,
          \`Dispatched FCM Push Notification to device token.\`,
          \`Dispatched Email Alert to \${leadEmail}.\`
        ],
        dispatchedEmail: emailPayload,
        dispatchedPush: fcmPayload
      });
    } catch (err: any) {
      console.error("[Firebase Cloud Function Error]", err);
      res.status(500).json({ error: "Cloud Function execution failed." });
    }
  });
  // =======================================================================
`;

    c = c.replace('// Property Compare AI Endpoint', functionCode + '\n  // Property Compare AI Endpoint');
    fs.writeFileSync('server.ts', c);
}
