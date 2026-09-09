const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

const targetEffect = `  useEffect(() => {
    const unsub = subscribeToAllPropertyActionItems(setPropertyActionItems);
    return () => unsub();
  }, []);`;

const replacementEffect = `  useEffect(() => {
    const unsub = subscribeToAllPropertyActionItems(setPropertyActionItems);
    return () => unsub();
  }, []);

  useEffect(() => {
    const handleDeepLink = (e: any) => {
      const payload = e.detail;
      if (payload.targetTab) {
        setActiveTab(payload.targetTab);
      }
      if (payload.targetLeadId) {
        // Find lead if it exists
        const lead = guidesState.capturedLeads?.find((l: any) => l.id === payload.targetLeadId);
        if (lead) setViewingJourneyLead(lead);
      }
    };
    
    const handleAppToast = (e: any) => {
      if (e.detail?.message) {
        setSuccessToast(e.detail.message);
        setTimeout(() => setSuccessToast(null), 5000);
      }
    };

    window.addEventListener("DEEP_LINK_NAV", handleDeepLink);
    window.addEventListener("APP_TOAST", handleAppToast);
    return () => {
      window.removeEventListener("DEEP_LINK_NAV", handleDeepLink);
      window.removeEventListener("APP_TOAST", handleAppToast);
    };
  }, [guidesState.capturedLeads]);`;

code = code.replace(targetEffect, replacementEffect);

// Add the import
code = code.replace(
  'import { processLocalImageFile } from "../utils/imageUtils";',
  'import { processLocalImageFile } from "../utils/imageUtils";\nimport { sendRealTimePushNotification } from "../utils/pushNotifications";'
);

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code);
