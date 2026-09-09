const fs = require('fs');
let code = fs.readFileSync('src/services/propertyConversationService.ts', 'utf8');

code = code.replace(
  "  didYouKnowFact?: string;",
  "  didYouKnowFact?: string;\n  tcpaSmsOptIn?: boolean;\n  tcpaPhoneProvided?: string;"
);

// Inject into payload
code = code.replace(
  "      didYouKnowFact: params.didYouKnowFact",
  "      didYouKnowFact: params.didYouKnowFact,\n      tcpaSmsOptIn: params.tcpaSmsOptIn,\n      tcpaPhoneProvided: params.tcpaPhoneProvided"
);

code = code.replace(
  "        propertyCity: params.propertyCity,",
  "        propertyCity: params.propertyCity,\n        tcpaSmsOptIn: params.tcpaSmsOptIn,\n        tcpaPhoneProvided: params.tcpaPhoneProvided,"
);

fs.writeFileSync('src/services/propertyConversationService.ts', code);
