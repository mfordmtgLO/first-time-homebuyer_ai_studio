const fs = require('fs');
let content = fs.readFileSync('src/components/SmsMessagingModal.tsx', 'utf8');

content = content.replace(/lastTextTemplateName: nextTemplateName,/g, 'lastTextTemplateName: "Automated Nurture SMS",');
content = content.replace(/templateName: nextTemplateName,/g, 'templateName: "Automated Nurture SMS",');

fs.writeFileSync('src/components/SmsMessagingModal.tsx', content);
console.log("Fixed sms modal");
