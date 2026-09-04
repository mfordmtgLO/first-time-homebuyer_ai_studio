const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/  \}\);\n  \}\);\n\n  \/\/ ==========================================\n  \/\/ BIG PURPLE DOT/, '  });\n\n  // ==========================================\n  // BIG PURPLE DOT');
fs.writeFileSync('server.ts', code);
