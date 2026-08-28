const fs = require('fs');
let content = fs.readFileSync('src/components/ScrapeRealtorModal.tsx', 'utf8');

content = content.replace(/ScrapeLoRosterModalProps/g, 'ScrapeRealtorModalProps');
content = content.replace(/ScrapeLoRosterModal/g, 'ScrapeRealtorModal');
content = content.replace(/LoanOfficerProfile/g, 'RealEstateAgentProfile');
content = content.replace(/onAddMultipleLos/g, 'onAddMultipleAgents');
content = content.replace(/"\/api\/gemini\/lo-roster-lookup"/g, '"/api/gemini/realtor-roster-lookup"');
content = content.replace(/Targeted LO Recruiting Scraper/g, 'Targeted Realtor Recruiting Scraper');
content = content.replace(/nmlsId/g, 'licenseNumber');
content = content.replace(/NMLS: /g, 'License: ');
content = content.replace(/OR Licensed/g, 'OR Licensed'); // It's okay
content = content.replace(/Qualified LO/g, 'Qualified Agent');

fs.writeFileSync('src/components/ScrapeRealtorModal.tsx', content);
