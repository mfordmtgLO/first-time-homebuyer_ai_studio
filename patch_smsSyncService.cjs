const fs = require('fs');
let code = fs.readFileSync('src/services/smsSyncService.ts', 'utf8');

// 1. Update signature
code = code.replace(
  "export async function handleIncomingTwilioWebhook(req: any, res: any, adminApp: any) {",
  "export async function handleIncomingTwilioWebhook(req: any, res: any, adminApp: any, decryptVaultFunc?: any) {"
);

// 2. Destructure 'To' as well
code = code.replace(
  "const { From, Body } = req.body;",
  "const { From, To, Body } = req.body;"
);

// 3. Inject outbound SMS logic
const outboundLogic = `
        let optInBuyerPhone = null;
        if (idx !== -1) {
          items[idx].status = 'resolved';
          items[idx].resolvedAt = new Date().toISOString();
          items[idx].resolutionText = Body;
          items[idx].resolvedBy = \`\${loName} via SMS\`;
          
          if (items[idx].tcpaSmsOptIn && items[idx].tcpaPhoneProvided) {
            optInBuyerPhone = items[idx].tcpaPhoneProvided;
          }
        }
`;

code = code.replace(
  `        if (idx !== -1) {
          items[idx].status = 'resolved';
          items[idx].resolvedAt = new Date().toISOString();
          items[idx].resolutionText = Body;
          items[idx].resolvedBy = \`\${loName} via SMS\`;
        }`,
  outboundLogic
);

const outboundTrigger = `
        console.log(\`[Twilio Webhook] Successfully verified and routed SMS reply to \${targetLeadName}'s property thread.\`);

        // 4. Send Outbound SMS if TCPA Opt-In is checked
        if (optInBuyerPhone && decryptVaultFunc) {
          try {
            console.log(\`[Twilio Webhook] Buyer opted in for SMS alerts. Attempting to send outbound notification to \${optInBuyerPhone}...\`);
            let matchingVault = null;
            const vaultSnap = await db.collection("twilio_vault").get();
            
            for (const vDoc of vaultSnap.docs) {
              const vData = vDoc.data();
              if (vData.encryptedVault) {
                try {
                  const decrypted = JSON.parse(decryptVaultFunc(vData.encryptedVault));
                  // If the To number matches the stored Twilio number
                  const cleanTo = (To || "").replace(/\\D/g, '');
                  const cleanStored = (decrypted.phoneNumber || "").replace(/\\D/g, '');
                  
                  // For demo, we might just take the first valid vault if matching fails
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
            
            if (matchingVault && matchingVault.accountSid && matchingVault.authToken) {
              // We will use native fetch to call Twilio REST API to avoid requiring the twilio SDK if it's not installed
              const twilioUrl = \`https://api.twilio.com/2010-04-01/Accounts/\${matchingVault.accountSid}/Messages.json\`;
              const authHeader = "Basic " + Buffer.from(\`\${matchingVault.accountSid}:\${matchingVault.authToken}\`).toString("base64");
              
              const formData = new URLSearchParams();
              formData.append("To", optInBuyerPhone);
              formData.append("From", matchingVault.phoneNumber || To || "+15035550199");
              formData.append("Body", \`\${loName} replied to your property question: "\${Body}"\\n\\nView in Portal: https://ais-pre-h5e42vrshqrry7uiwwuhmv-427099073161.us-east5.run.app\`);
              
              const smsRes = await fetch(twilioUrl, {
                method: "POST",
                headers: {
                  "Authorization": authHeader,
                  "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formData.toString()
              });
              
              if (smsRes.ok) {
                console.log(\`[Twilio Webhook] Outbound SMS alert sent successfully to \${optInBuyerPhone}\`);
              } else {
                const errText = await smsRes.text();
                console.warn(\`[Twilio Webhook] Twilio API error sending outbound SMS:\`, errText);
              }
            } else {
               console.warn(\`[Twilio Webhook] No valid Twilio credentials found to send outbound SMS.\`);
            }
          } catch (outboundErr) {
            console.error(\`[Twilio Webhook] Failed to send outbound SMS alert:\`, outboundErr);
          }
        }
`;

code = code.replace(
  "        console.log(`[Twilio Webhook] Successfully verified and routed SMS reply to ${targetLeadName}'s property thread.`);",
  outboundTrigger
);

fs.writeFileSync('src/services/smsSyncService.ts', code);
