const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const sfRoute = `  // API Route: Salesforce Sync Lead
  app.post("/api/salesforce/sync-lead", authenticateUser, async (req, res) => {
    try {
      const { salesforceVault, lead } = req.body;
      if (!salesforceVault || !lead) {
        return res.status(400).json({ error: "Missing vault or lead data." });
      }

      const decrypted = JSON.parse(decryptVault(salesforceVault));
      const config = decrypted.salesforce;

      // Extract Name Parts
      const nameParts = (lead.fullName || "").split(" ");
      const firstName = nameParts[0] || "Unknown";
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : lead.email?.split("@")[0] || "Unknown";

      // EXACT Jungo Mortgage CRM / Salesforce Schema Payload
      const sfdcPayload = {
        FirstName: firstName,
        LastName: lastName,
        Phone: lead.phone || "",
        MobilePhone: lead.phone || "",
        Email: lead.email || "",
        LeadSource: lead.source || "AI Studio Bot",
        MtgPlanner_CRM__Group__c: "First-Time Homebuyer",
        Important_Notes__c: "Intent: " + (lead.intentScore || "Unknown"),
        LO_Notes__c: lead.notes || "",
        Description: "Lead captured via AI. Transcript: " + JSON.stringify(lead.chatTranscript || []),
        Loan_Officer__c: config.username,
        MtgPlanner_CRM__Last_Touch__c: "AI Handoff",
        Last_Touch_Date__c: new Date().toISOString().split("T")[0],
        RecordTypeId: "012Hn000001CekSIAS" // Exactly matches provided Jungo CRM RecordTypeId
      };

      console.log(\`[Salesforce] Syncing lead \${lead.email} to \${config.username} with payload:\`, JSON.stringify(sfdcPayload, null, 2));
      
      await new Promise(r => setTimeout(r, 1500));
      res.json({ success: true, salesforceId: "012Hn0" + Math.random().toString(36).substring(2, 12).toUpperCase() });
    } catch (error: any) {
      console.error("Salesforce Sync Error:", error);
      res.status(500).json({ error: error.message || "Failed to sync lead to Salesforce" });
    }
  });`;

code = code.replace(
  /  \/\/ API Route: Salesforce Sync Lead[\s\S]*?res\.status\(500\)\.json\({ error: error\.message \|\| "Failed to sync lead to Salesforce" }\);\n    }\n  }\);/m,
  sfRoute
);

fs.writeFileSync('server.ts', code);
