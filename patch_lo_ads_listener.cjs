const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

const importStatement = `import { subscribeToIncomingAds, SyncedAdAsset } from "../services/adAssetSync";\n`;

if (!code.includes("subscribeToIncomingAds")) {
  code = code.replace('import { subscribeToAllPropertyActionItems', importStatement + 'import { subscribeToAllPropertyActionItems');
}

const useEffectHook = `
  useEffect(() => {
    if (!authenticatedLoId) return;
    const unsub = subscribeToIncomingAds(authenticatedLoId, (ads) => {
      // Map the SyncedAdAsset to AdCampaignDraft schema used by guidesState
      const mappedDrafts = ads.map(ad => ({
        id: ad.id,
        targetAudience: ad.platformTarget,
        coreMessage: ad.adCopy,
        assets: [ad.videoUrl].filter(Boolean),
        status: ad.status === "Approved" ? "approved" : "draft",
        metrics: undefined,
        complianceStatus: "pending",
        dateCreated: ad.timestamp?.toDate ? ad.timestamp.toDate().toISOString() : new Date().toISOString()
      }));
      
      setGuidesState(prev => {
        // If we have more mapped drafts than what's currently in state, it means a new one arrived!
        const currentCount = prev.adCampaignDrafts?.length || 0;
        if (mappedDrafts.length > currentCount && currentCount > 0) {
          // Play a sound or show a generic alert since we can't easily trigger the toast context from here without adding more complexity
          console.log("New Ad Campaign received from Vantage AI Ads Engine!");
          if (typeof window !== "undefined") {
            // we'll just let the state update
          }
        }
        return {
          ...prev,
          adCampaignDrafts: mappedDrafts
        };
      });
    });
    return () => unsub();
  }, [authenticatedLoId]);
`;

if (!code.includes("subscribeToIncomingAds(authenticatedLoId")) {
  code = code.replace(
    'const unsub = subscribeToAllPropertyActionItems(setPropertyActionItems);\n    return () => unsub();\n  }, []);',
    'const unsub = subscribeToAllPropertyActionItems(setPropertyActionItems);\n    return () => unsub();\n  }, []);\n' + useEffectHook
  );
  
  fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code, 'utf8');
  console.log("Updated LoanOfficerPortal with incoming Ads listener");
} else {
  console.log("Already updated");
}
