const fs = require('fs');
let content = fs.readFileSync('src/components/SmsMessagingModal.tsx', 'utf8');

const handleSendSmsReplace = `    const updatedSmsList = [...currentSms, newMsg];
    setMessage("");
    setSelectedFlyerId("");
    setSelectedListId("");
    setShowAttachmentMenu(false);

    // Save to lead
    onUpdateLead({
      ...lead,
      smsMessages: updatedSmsList,
      lastTextSentAt: new Date().toISOString(),
      lastTextTemplateName: selectedFlyerId ? "Flyer Attachment SMS" : (selectedListId ? "Property List Attachment SMS" : "Custom Direct Text"),
      outreachLogs: [
        {
          id: \`sms-\${Date.now()}\`,
          timestamp: new Date().toISOString(),
          channel: 'sms',
          templateName: selectedFlyerId ? "Flyer Attachment SMS" : (selectedListId ? "Property List Attachment SMS" : "Custom Direct Text"),
          recipientName: lead.fullName,
          notes: \`\${selectedFlyerId ? 'Attached Flyer. ' : ''}\${selectedListId ? 'Attached Property List. ' : ''}\`
        },
        ...(lead.outreachLogs || [])
      ]
    });`;

content = content.replace(/    const updatedSmsList = \[\.\.\.currentSms, newMsg\];\n    setMessage\(""\);\n    setSelectedFlyerId\(""\);\n    setSelectedListId\(""\);\n    setShowAttachmentMenu\(false\);\n\n    \/\/ Save to lead\n    onUpdateLead\(\{[\s\S]*?\}\);/, handleSendSmsReplace);

// add to handleForceNextStep
const handleForceNextReplace = `    const existingLogs = lead.textNurtureLogs || [];

    onUpdateLead({
      ...lead,
      smsMessages: updatedSmsList,
      textNurtureCurrentStep: nextStepNum,
      textNurtureStageText: \`\${nextStepNum} of 4 automated text nurture sent\`,
      lastTextSentAt: new Date().toISOString(),
      lastTextTemplateName: nextTemplateName,
      textNurtureLogs: [newLog, ...existingLogs],
      outreachLogs: [
        {
          id: \`auto-sms-\${Date.now()}\`,
          timestamp: new Date().toISOString(),
          channel: 'sms',
          templateName: nextTemplateName,
          recipientName: lead.fullName,
          notes: \`Automated Nurture Step \${nextStepNum}\`
        },
        ...(lead.outreachLogs || [])
      ]
    });`;

content = content.replace(/    const existingLogs = lead\.textNurtureLogs \|\| \[\];\n\n    onUpdateLead\(\{[\s\S]*?\}\);/, handleForceNextReplace);

fs.writeFileSync('src/components/SmsMessagingModal.tsx', content);
console.log("Updated SmsMessagingModal");
