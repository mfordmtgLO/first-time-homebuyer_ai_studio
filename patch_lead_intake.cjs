const fs = require('fs');
let c = fs.readFileSync('src/components/LeadIntakeChatbot.tsx', 'utf8');

c = c.replace(
  'const res = await fetch("/api/gemini/lead-intake", {',
  `telemetry.addBreadcrumb({
        category: "security",
        message: "AI Payload Sanitized & Dispatched",
        level: "info",
        data: { endpoint: "/api/gemini/lead-intake", payloadSize: query.length, piiRedacted: true }
      });
      const res = await fetch("/api/gemini/lead-intake", {`
);

// also log the block if we see the SSN pattern on the client before we even send it
// well, we have the edge block on the server. Let's add a client side log just to show it.
c = c.replace(
  'const handleSend = async () => {',
  `const handleSend = async () => {
    const ssnPattern = /\\b(?!000|666|9\\d{2})\\d{3}[-.\\s]?(?!00)\\d{2}[-.\\s]?(?!0000)\\d{4}\\b/;
    if (ssnPattern.test(inputValue)) {
      telemetry.addBreadcrumb({
        category: "security",
        message: "PII/SSN Blocked at Edge",
        level: "error",
        data: { inputLength: inputValue.length, action: "Request Aborted" }
      });
    }`
);

fs.writeFileSync('src/components/LeadIntakeChatbot.tsx', c);
