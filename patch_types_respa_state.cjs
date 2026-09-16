const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

if (!code.includes('respaExpenses?: RespaCostSharingExpense[];')) {
  code = code.replace(
    'bigPurpleDotEvents?: BigPurpleDotWebhookEvent[];',
    'bigPurpleDotEvents?: BigPurpleDotWebhookEvent[];\n  respaExpenses?: RespaCostSharingExpense[];'
  );
  fs.writeFileSync('src/types.ts', code);
  console.log("Added respaExpenses to ProfessionalGuidesState");
}
