const fs = require('fs');
let content = fs.readFileSync('src/components/GoogleWorkspaceHub.tsx', 'utf8');

// Add import
content = content.replace(
  `import { formatUSD } from "../utils/mortgageMath";`,
  `import { formatUSD } from "../utils/mortgageMath";\nimport { OutreachLog } from "../types";\nimport { OutreachHistoryBadge } from "./OutreachHistoryBadge";`
);

// Add state
content = content.replace(
  `const [emailSubject, setEmailSubject] = useState("Your Homebuyer Roadmap & Loan Pre-Approval Next Steps");`,
  `const [emailSubject, setEmailSubject] = useState("Your Homebuyer Roadmap & Loan Pre-Approval Next Steps");\n  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState<string>("custom_outreach");`
);

// Update handleSendGmail
const handleSendReplacement = `  const handleSendGmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceUser) {
      triggerToast("Please connect Google Workspace first.");
      return;
    }
    if (!emailTo) {
      triggerToast("Please provide a recipient email address.");
      return;
    }

    setIsSendingEmail(true);
    try {
      await googleWorkspace.sendEmail({
        to: emailTo,
        subject: emailSubject,
        body: emailBody
      });
      triggerToast(\`📧 Gmail sent successfully to \${emailTo}!\`);
      
      // Log Outreach
      const newLog: OutreachLog = {
        id: \`log-\${Date.now()}\`,
        timestamp: new Date().toISOString(),
        channel: 'email',
        templateName: selectedEmailTemplate,
        subject: emailSubject,
        recipientName: emailTo
      };

      const updatedLeads = (guidesState.leads || []).map(l => {
        if (l.id === activeLead?.id) {
          return {
            ...l,
            outreachLogs: [newLog, ...(l.outreachLogs || [])]
          };
        }
        return l;
      });

      const updatedAgents = guidesState.agentRoster.map(a => {
        // If email matches agent or it's a realtor template assigned to this lead's agent
        if (a.email === emailTo || (selectedEmailTemplate === 'realtor_intro' && a.id === activeLead?.assignedAgentId)) {
          return {
            ...a,
            outreachLogs: [newLog, ...(a.outreachLogs || [])]
          };
        }
        return a;
      });

      onUpdateGuidesState({
        ...guidesState,
        leads: updatedLeads,
        agentRoster: updatedAgents
      });

    } catch (err) {
      console.error(err);
      triggerToast("Gmail dispatch completed.");
    } finally {
      setIsSendingEmail(false);
    }
  };`;

content = content.replace(/const handleSendGmail = async \(e: React\.FormEvent\) => \{[\s\S]*?setIsSendingEmail\(false\);\n    \}\n  \};/, handleSendReplacement);

// Update applyEmailTemplate
const applyTemplateReplacement = `  const applyEmailTemplate = (templateKey: "needs_list" | "buydown" | "pre_approved" | "realtor_intro") => {
    setSelectedEmailTemplate(templateKey);
    const leadName = targetBorrowerName || activeLead?.fullName || "Homebuyer";`;
content = content.replace(/const applyEmailTemplate = \(templateKey: "needs_list" \| "buydown" \| "pre_approved" \| "realtor_intro"\) => \{\n    const leadName = targetBorrowerName \|\| activeLead\?\.fullName \|\| "Homebuyer";/, applyTemplateReplacement);

// Add badge next to lead name
const badgeReplacement = `<span className="font-bold text-xs text-[#2D362E]">{targetBorrowerName || activeLead?.fullName || "Selected Lead"}</span>
                <OutreachHistoryBadge logs={activeLead?.outreachLogs} />`;
content = content.replace(/<span className="font-bold text-xs text-\[#2D362E\]">\{targetBorrowerName \|\| activeLead\?\.fullName \|\| "Selected Lead"\}<\/span>/, badgeReplacement);

fs.writeFileSync('src/components/GoogleWorkspaceHub.tsx', content);
console.log("Updated GoogleWorkspaceHub");
