const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /res\.status\(500\)\.json\({ error: "Knowledge ingestion failed" }\);/g,
  `res.status(500).json({ error: "Knowledge ingestion failed: " + (error.message || error.toString()) });`
);

fs.writeFileSync('server.ts', code);
console.log("Patched server outer catch block");
