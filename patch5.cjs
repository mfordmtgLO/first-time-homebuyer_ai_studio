const fs = require('fs');
let code = fs.readFileSync('src/components/LeadIntakeChatbot.tsx', 'utf8');

const urgentNote = 'initialIntent === "chat_listings" ? "[URGENT ACTION REQUIRED]: Lead requested a curated list of low/no down payment homes in their desired city. Generate and send a property list via the SMS Hub or Email Outreach!\\n\\n" : ""';

code = code.replace(
  'notes: contactForm.notes?.trim() \n        ? `${sanitizeSSN(contactForm.notes.trim())}\\n\\n[System Record]: Captured via 24/7 AI Lead Intake Assistant. Source: ${computedLeadSource}. Target: ${leadState.targetPriceRange || "N/A"}, Income: ${leadState.annualIncome || `${formatIncomeCurrency(annualIncomeAmount)}/yr`}, Timeline: ${leadState.timeline || "N/A"}.`\n        : `Captured via 24/7 AI Lead Intake Assistant. Source: ${computedLeadSource}. Target: ${leadState.targetPriceRange || "N/A"}, Income: ${leadState.annualIncome || `${formatIncomeCurrency(annualIncomeAmount)}/yr`}, Timeline: ${leadState.timeline || "N/A"}.`,',
  'notes: (contactForm.notes?.trim() \n        ? `${sanitizeSSN(contactForm.notes.trim())}\\n\\n[System Record]: Captured via 24/7 AI Lead Intake Assistant. Source: ${computedLeadSource}. Target: ${leadState.targetPriceRange || "N/A"}, Income: ${leadState.annualIncome || `${formatIncomeCurrency(annualIncomeAmount)}/yr`}, Timeline: ${leadState.timeline || "N/A"}.`\n        : `Captured via 24/7 AI Lead Intake Assistant. Source: ${computedLeadSource}. Target: ${leadState.targetPriceRange || "N/A"}, Income: ${leadState.annualIncome || `${formatIncomeCurrency(annualIncomeAmount)}/yr`}, Timeline: ${leadState.timeline || "N/A"}.`).replace(/^/, initialIntent === "chat_listings" ? "[URGENT ACTION REQUIRED]: Lead requested a curated list of low/no down payment homes in their desired city. Generate and send a property list via the SMS Hub or Email Outreach!\\n\\n" : ""),`
);

fs.writeFileSync('src/components/LeadIntakeChatbot.tsx', code);
