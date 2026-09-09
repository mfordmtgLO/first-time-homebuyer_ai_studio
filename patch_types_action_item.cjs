const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
  "  resolutionText?: string;\n}",
  "  resolutionText?: string;\n  tcpaSmsOptIn?: boolean;\n  tcpaPhoneProvided?: string;\n}"
);

fs.writeFileSync('src/types.ts', code);
