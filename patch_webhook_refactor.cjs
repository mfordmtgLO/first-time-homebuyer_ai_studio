const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "return handleIncomingTwilioWebhook(req, res, adminApp);",
  "return handleIncomingTwilioWebhook(req, res, adminApp, decryptVault);"
);

fs.writeFileSync('server.ts', code);
