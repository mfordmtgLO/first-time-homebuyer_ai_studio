const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyTracker.tsx', 'utf8');

if (!code.includes("Megaphone")) {
  code = code.replace("Share2", "Share2,\n  Megaphone");
}

const actionButtonHtml = `
            <button
              onClick={() => {
                 const listToSync = selectedPropertyIds.length > 0 ? properties.filter(p => selectedPropertyIds.includes(p.id)) : filtered;
                 if (listToSync.length === 0) {
                   alert("No properties found to send.");
                   return;
                 }
                 alert(\`\${listToSync.length} properties synced to Vantage AI Ads Engine! The Marketing Team has been notified.\`);
                 // In production, this would trigger a webhook payload containing the array of properties
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-pink-600 text-white hover:bg-pink-700 font-semibold text-xs shadow-sm transition-all cursor-pointer hover:scale-105"
              title="Push selected properties to Vantage AI Ads Engine for campaign generation"
            >
              <Megaphone className="w-4 h-4 text-pink-200" />
              <span>Push to Ads Engine {selectedPropertyIds.length > 0 ? \`(\${selectedPropertyIds.length})\` : ""}</span>
            </button>
`;

if (!code.includes("Push to Ads Engine")) {
  code = code.replace(
    /<button\\s+onClick=\{handleShareList\}/,
    actionButtonHtml.trim() + '\\n            <button\\n              onClick={handleShareList}'
  );
  fs.writeFileSync('src/components/PropertyTracker.tsx', code, 'utf8');
  console.log("Updated PropertyTracker.tsx with Bulk Ads Sync button");
} else {
  console.log("Already updated.");
}
