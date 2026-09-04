const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace the send-sms environment fallback
code = code.replace(
  /let sid = accountSid \|\| process\.env\.TWILIO_ACCOUNT_SID;\n\s*let token = authToken \|\| process\.env\.TWILIO_AUTH_TOKEN;\n\s*let from = fromNumber \|\| process\.env\.TWILIO_PHONE_NUMBER;/,
  `let sid = accountSid;\n      let token = authToken;\n      let from = fromNumber;`
);

// Delete the config-status endpoint
code = code.replace(
  /\n\s*\/\/ API Route: Check Twilio Config Status\n\s*app\.get\("\/api\/twilio\/config-status", \(_req, res\) => \{[\s\S]*?\}\);\n/,
  '\n'
);

fs.writeFileSync('server.ts', code);
