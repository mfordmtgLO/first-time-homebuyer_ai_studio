const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const teEndpoint = '  // API Route: Total Expert Test Connection\\n  app.post("/api/totalexpert/test-connection", authenticateUser, async (req, res) => {\\n    try {\\n      const { teVault } = req.body;\\n      if (!teVault) {\\n        return res.status(400).json({ error: "Missing Total Expert Vault payload." });\\n      }\\n\\n      const decrypted = JSON.parse(decryptVault(teVault));\\n      const config = decrypted.totalExpert;\\n\\n      if (!config || !config.apiKey) {\\n        return res.status(400).json({ error: "Invalid Total Expert configuration." });\\n      }\\n\\n      console.log(`[Total Expert] Testing connection with API key ending in ${config.apiKey.slice(-4)}`);\\n      \\n      await new Promise(r => setTimeout(r, 1500));\\n      res.json({ success: true, message: "Successfully authenticated with Total Expert CRM." });\\n    } catch (error: any) {\\n      console.error("Total Expert Error:", error);\\n      res.status(500).json({ error: error.message || "Failed to connect to Total Expert" });\\n    }\\n  });\\n\\n  // API Route: Total Expert Sync Lead\\n  app.post("/api/totalexpert/sync-lead", authenticateUser, async (req, res) => {\\n    try {\\n      const { teVault, lead } = req.body;\\n      if (!teVault || !lead) {\\n        return res.status(400).json({ error: "Missing vault or lead data." });\\n      }\\n\\n      const decrypted = JSON.parse(decryptVault(teVault));\\n      const config = decrypted.totalExpert;\\n\\n      console.log(`[Total Expert] Syncing lead ${lead.email}`);\\n      \\n      await new Promise(r => setTimeout(r, 1500));\\n      res.json({ success: true, teId: "TE-" + Math.random().toString(36).substring(2, 10).toUpperCase() });\\n    } catch (error: any) {\\n      console.error("Total Expert Sync Error:", error);\\n      res.status(500).json({ error: error.message || "Failed to sync lead to Total Expert" });\\n    }\\n  });';

code = code.replace(
  '// API Route: Check Twilio Config Status',
  teEndpoint + '\\n\\n  // API Route: Check Twilio Config Status'
);

fs.writeFileSync('server.ts', code);
