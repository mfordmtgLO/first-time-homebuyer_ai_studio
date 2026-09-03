const fs = require('fs');
let content = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

const handleBulkReplace = `  const handleBulkSmsDispatch = (template: SmsTemplate) => {
    const currentLeads = guidesState.leads || [];
    let dispatchCount = 0;
    
    const updated = currentLeads.map(l => {
      if (selectedLeadIds.has(l.id) && l.smsConsentAuthorized) {
        dispatchCount++;
        const firstName = l.fullName ? l.fullName.split(" ")[0] : "there";
        const loName = currentLo.name.split(" ")[0];
        const agentName = l.assignedAgent ? l.assignedAgent.split(" ")[0] : "Your Agent";
        
        const filledText = template.content
          .replace(/{{firstName}}/g, firstName)
          .replace(/\\[Name\\]/g, firstName)
          .replace(/{{loName}}/g, loName)
          .replace(/\\[AgentName\\]/g, agentName)
          .replace(/{{location}}/g, l.preferredLocations || "Oregon")
          .replace(/\\[City\\]/g, l.preferredLocations || "Oregon");

        const newMsg = {
          id: \`sms-bulk-\${Date.now()}-\${l.id}\`,
          direction: "outbound" as const,
          text: filledText,
          timestamp: new Date().toISOString(),
          status: "sent" as const
        };
        
        const newLog = {
          id: \`bulk-sms-\${Date.now()}-\${l.id}\`,
          timestamp: new Date().toISOString(),
          channel: 'sms' as const,
          templateName: template.name,
          recipientName: l.fullName,
          notes: \`Bulk SMS Dispatch\`
        };

        return {
          ...l,
          smsMessages: [...(l.smsMessages || []), newMsg],
          lastTextSentAt: new Date().toISOString(),
          lastTextTemplateName: template.name,
          outreachLogs: [newLog, ...(l.outreachLogs || [])]
        };
      }
      return l;
    });`;

content = content.replace(/  const handleBulkSmsDispatch = \(template: SmsTemplate\) => \{[\s\S]*?lastTextTemplateName: template\.name\n        \};\n      \}\n      return l;\n    \}\);/, handleBulkReplace);

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', content);
console.log("Updated handleBulkSmsDispatch");
