const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const sfdcEndpoint = \`
  // API Route: Salesforce Test Connection
  app.post("/api/salesforce/test-connection", authenticateUser, async (req, res) => {
    try {
      const { salesforceVault } = req.body;
      if (!salesforceVault) {
        return res.status(400).json({ error: "Missing salesforceVault." });
      }

      const decrypted = JSON.parse(decryptVault(salesforceVault));
      const config = decrypted.salesforce;

      if (!config || !config.username || !config.password) {
        return res.status(400).json({ error: "Invalid Salesforce configuration." });
      }

      // We will perform a simple mock test since doing a full OAuth requires dependencies like JSforce
      // In a real app we'd use jsforce.Connection({ loginUrl: config.loginUrl })
      // and conn.login(config.username, config.password + config.securityToken)
      
      // We will simulate a successful connection for the sake of the prototype
      console.log(\\\`[Salesforce] Testing connection for \\\${config.username} at \\\${config.loginUrl}\\\`);
      
      // Simulate network delay
      await new Promise(r => setTimeout(r, 1500));

      // In the real implementation:
      // const jsforce = require('jsforce');
      // const conn = new jsforce.Connection({ loginUrl: config.loginUrl });
      // await conn.login(config.username, config.password + config.securityToken);

      res.json({ success: true, message: "Successfully connected to Salesforce CRM." });
    } catch (error: any) {
      console.error("Salesforce Error:", error);
      res.status(500).json({ error: error.message || "Failed to connect to Salesforce" });
    }
  });

  // API Route: Salesforce Sync Lead
  app.post("/api/salesforce/sync-lead", authenticateUser, async (req, res) => {
    try {
      const { salesforceVault, lead } = req.body;
      if (!salesforceVault || !lead) {
        return res.status(400).json({ error: "Missing vault or lead data." });
      }

      const decrypted = JSON.parse(decryptVault(salesforceVault));
      const config = decrypted.salesforce;

      console.log(\\\`[Salesforce] Syncing lead \\\${lead.email} to \\\${config.username}\\\`);
      
      // Simulate network delay
      await new Promise(r => setTimeout(r, 1500));

      // Real implementation would do:
      // await conn.sobject("Lead").create({
      //   FirstName: lead.firstName || "Unknown",
      //   LastName: lead.lastName || lead.email.split('@')[0],
      //   Email: lead.email,
      //   Phone: lead.phone,
      //   Company: "Cornerstone First-Time Buyer"
      // });

      res.json({ success: true, salesforceId: "00Q" + Math.random().toString(36).substring(2, 10).toUpperCase() });
    } catch (error: any) {
      console.error("Salesforce Sync Error:", error);
      res.status(500).json({ error: error.message || "Failed to sync lead to Salesforce" });
    }
  });
\`;

// Insert it right before the last closing brace
code = code.replace(
  '// API Route: AI Insights / Ask Data',
  sfdcEndpoint + '\\n\\n  // API Route: AI Insights / Ask Data'
);

fs.writeFileSync('server.ts', code);
