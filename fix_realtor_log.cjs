const fs = require('fs');
let content = fs.readFileSync('src/components/RealtorCoBrandingHub.tsx', 'utf8');

const logFunc = `  const logAgentOutreach = (channel: 'email' | 'sms', templateName: string, subject?: string) => {
    if (!selectedAgent) return;
    const newLog = {
      id: \`agent-outreach-\${Date.now()}\`,
      timestamp: new Date().toISOString(),
      channel,
      templateName,
      recipientName: selectedAgent.name,
      subject
    };
    const updatedAgents = guidesState.agentRoster.map(a => 
      a.id === selectedAgent.id 
        ? { ...a, outreachLogs: [newLog, ...(a.outreachLogs || [])] }
        : a
    );
    onUpdateGuidesState({
      ...guidesState,
      agentRoster: updatedAgents
    });
  };`;

content = content.replace(/  const handleCreateAgent = \(e: React\.FormEvent\) => \{/, logFunc + '\n\n  const handleCreateAgent = (e: React.FormEvent) => {');

// Update SMS Link
content = content.replace(/<a\s+href=\{smsLink\}\s+className=/g, `<a\n                        href={smsLink}\n                        onClick={() => logAgentOutreach('sms', '1-Click Realtor Co-Brand Invite')}\n                        className=`);

// Update Email Link
content = content.replace(/<a\s+href=\{mailtoLink\}\s+target="_top"\s+className=/g, `<a\n                        href={mailtoLink}\n                        target="_top"\n                        onClick={() => logAgentOutreach('email', 'Co-Brand Partner Invite', emailSubject)}\n                        className=`);


fs.writeFileSync('src/components/RealtorCoBrandingHub.tsx', content);
console.log("Updated RealtorCoBrandingHub to log outreach");
