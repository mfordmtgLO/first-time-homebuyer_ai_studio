const fs = require('fs');
let code = fs.readFileSync('src/components/LeadIntakeChatbot.tsx', 'utf8');

code = code.replace(
  'timestamp: new Date().toISOString()',
  'time: "Just now"'
);

code = code.replace(
  'timestamp: new Date().toISOString()',
  'time: "Just now"'
);

fs.writeFileSync('src/components/LeadIntakeChatbot.tsx', code);
