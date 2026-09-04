const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Update test-connection
code = code.replace(
  /app\.post\("\/api\/big-purple-dot\/test-connection", async \(req, res\) => {[\s\S]*?\/\/ Simulate connection/,
  `app.post("/api/big-purple-dot/test-connection", authenticateUser, async (req, res) => {
    try {
      let config = bpdConfig;
      if (req.body.bpdVault) {
        const decrypted = JSON.parse(decryptVault(req.body.bpdVault));
        config = decrypted;
      }
      
      const apiKeyToTest = (req.body.apiKey && !req.body.apiKey.includes("••")) ? req.body.apiKey.trim() : config.apiKey;
      const apiSecretToTest = (req.body.apiSecret && !req.body.apiSecret.includes("••")) ? req.body.apiSecret.trim() : config.apiSecret;
      const subdomainToTest = req.body.subdomain || config.subdomain || "cornerstone";
      const environment = req.body.environment || config.environment || "sandbox";

      if (!apiKeyToTest) {
        return res.status(400).json({
          success: false,
          status: "error",
          message: "Missing Big Purple Dot API Key. Please provide an API Key to test connection."
        });
      }

      // Simulate connection`
);

// Update sync
code = code.replace(
  /app\.post\("\/api\/big-purple-dot\/sync", \(req, res\) => {[\s\S]*?const { items, type } = req\.body;/,
  `app.post("/api/big-purple-dot/sync", authenticateUser, (req, res) => {
    try {
      const { items, type, bpdVault } = req.body;
      let config = bpdConfig;
      if (bpdVault) {
        config = JSON.parse(decryptVault(bpdVault));
      }
      if (!config || !config.apiKey) {
        return res.status(400).json({ error: "Missing Big Purple Dot credentials in vault." });
      }`
);

// We need to make sure bpdConfig uses the config inside sync
code = code.replace(
  /const environment = bpdConfig\.environment/,
  `const environment = config.environment`
);
code = code.replace(
  /bpdConfig\.environment === "sandbox"/g,
  `config.environment === "sandbox"`
);
code = code.replace(
  /bpdConfig\.lastSyncedAt = new Date\(\)\.toISOString\(\);/,
  `// (omitted global mutation)`
);

fs.writeFileSync('server.ts', code);
