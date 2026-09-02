const fs = require('fs');

let content = fs.readFileSync('src/components/RealtorCoBrandingHub.tsx', 'utf8');

// Replace origin definition to handle ais-dev- vs ais-pre-
content = content.replace(
  /const origin = typeof window !== "undefined" \? window\.location\.origin : "https:\/\/homereadypdx\.com";/,
  `let origin = typeof window !== "undefined" ? window.location.origin : "https://homereadypdx.com";\n  if (origin.includes("ais-dev-")) {\n    origin = origin.replace("ais-dev-", "ais-pre-");\n  }`
);

// Update smsLink scheme for better cross-device support (iOS and Android)
content = content.replace(
  /const smsLink = \`sms:\?body=\$\{encodeURIComponent\(smsBody\)\}\`;/,
  `const smsLink = \`sms:?&body=\$\{encodeURIComponent(smsBody)}\`;`
);

// Add target="_top" to the Draft SMS a tag
content = content.replace(
  /<a\s+href=\{smsLink\}\s+className="text-xs font-bold text-white bg-\[\#4A5D4E\] hover:bg-\[\#3A4A3D\] px-3 py-1\.5 rounded-lg flex items-center gap-1\.5 transition-colors shadow-sm"\s*>/g,
  `<a\n                        href={smsLink}\n                        target="_top"\n                        className="text-xs font-bold text-white bg-[#4A5D4E] hover:bg-[#3A4A3D] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"\n                      >`
);

// Add target="_top" to the Draft Email a tag
content = content.replace(
  /<a\s+href=\{mailtoLink\}\s+className="text-xs font-bold text-white bg-\[\#4A5D4E\] hover:bg-\[\#3A4A3D\] px-3 py-1\.5 rounded-lg flex items-center gap-1\.5 transition-colors shadow-sm"\s*>/g,
  `<a\n                        href={mailtoLink}\n                        target="_top"\n                        className="text-xs font-bold text-white bg-[#4A5D4E] hover:bg-[#3A4A3D] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"\n                      >`
);

fs.writeFileSync('src/components/RealtorCoBrandingHub.tsx', content);
console.log("RealtorCoBrandingHub fixes applied.");
