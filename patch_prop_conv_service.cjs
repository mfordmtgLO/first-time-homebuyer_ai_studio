const fs = require('fs');
let code = fs.readFileSync('src/services/propertyConversationService.ts', 'utf8');

code = code.replace(
  "    priority: /urgent|offer|asap|today|deadline/i.test(params.text) ? 'urgent' : 'high',\n    createdAt: now,",
  "    priority: /urgent|offer|asap|today|deadline/i.test(params.text) ? 'urgent' : 'high',\n    tcpaSmsOptIn: params.tcpaSmsOptIn,\n    tcpaPhoneProvided: params.tcpaPhoneProvided,\n    createdAt: now,"
);

fs.writeFileSync('src/services/propertyConversationService.ts', code);
