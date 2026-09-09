const fs = require('fs');
let code = fs.readFileSync('src/components/AdminAdComplianceSection.tsx', 'utf8');

const target1 = `  const handleToggleAdminPause = (id: string, currentlyPaused: boolean) => {
    const updated = enterpriseCampaigns.map(c => 
      c.id === id ? { ...c, isCompliancePaused: !currentlyPaused } : c
    );`;

const replacement1 = `  const handleToggleAdminPause = (id: string, currentlyPaused: boolean) => {
    const updated = enterpriseCampaigns.map(c => {
      if (c.id === id) {
        const newLog = {
          id: "log-" + Date.now() + Math.random(),
          timestamp: new Date().toISOString(),
          actor: "Branch Admin (Mike Ford)",
          action: "Compliance Override",
          details: !currentlyPaused ? "Admin Suspended Campaign" : "Admin Lifted Suspension"
        };
        return { 
          ...c, 
          isCompliancePaused: !currentlyPaused,
          auditLog: [...(c.auditLog || []), newLog]
        };
      }
      return c;
    });`;

code = code.replace(target1, replacement1);

const target2 = `  const handleBulkToggle = (pause: boolean) => {
    const updated = enterpriseCampaigns.map(c => 
      selectedIds.has(c.id) ? { ...c, isCompliancePaused: pause } : c
    );`;

const replacement2 = `  const handleBulkToggle = (pause: boolean) => {
    const updated = enterpriseCampaigns.map(c => {
      if (selectedIds.has(c.id)) {
        const newLog = {
          id: "log-" + Date.now() + Math.random(),
          timestamp: new Date().toISOString(),
          actor: "Branch Admin (Mike Ford)",
          action: "Compliance Override (Bulk)",
          details: pause ? "Admin Suspended Campaign" : "Admin Lifted Suspension"
        };
        return { 
          ...c, 
          isCompliancePaused: pause,
          auditLog: [...(c.auditLog || []), newLog]
        };
      }
      return c;
    });`;

code = code.replace(target2, replacement2);

fs.writeFileSync('src/components/AdminAdComplianceSection.tsx', code);
