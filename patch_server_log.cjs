const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  /console\.error\("URL ingestion failed:", urlErr\);/g,
  `console.error("URL ingestion failed:", urlErr);
   require('fs').appendFileSync('ingest_debug.log', "URL ERROR: " + urlErr.stack + "\\n");`
);
code = code.replace(
  /console\.error\("Failed to extract text from URL or file:", e\);/g,
  `console.error("Failed to extract text from URL or file:", e);
   require('fs').appendFileSync('ingest_debug.log', "EXTRACT ERROR: " + e.stack + "\\n");`
);
fs.writeFileSync('server.ts', code);
console.log("Patched server logging");
