const fs = require('fs');
let code = fs.readFileSync('src/components/AdQueueManager.tsx', 'utf8');

if (!code.includes('MediaAssetLeadTrackerModal')) {
  code = code.replace(
    'import { AdQueueItem } from "./AdQueueManager";',
    '' // Wait, that's not there.
  );
  
  code = code.replace(
    'import {',
    `import { MediaAssetLeadTrackerModal } from "./MediaAssetLeadTrackerModal";\nimport {`
  );
}

// Add state for modal
if (!code.includes('const [trackingAsset, setTrackingAsset] = useState<AdQueueItem | null>(null);')) {
  code = code.replace(
    'const [previewItem, setPreviewItem] = useState<AdQueueItem | null>(null);',
    `const [previewItem, setPreviewItem] = useState<AdQueueItem | null>(null);\n  const [trackingAsset, setTrackingAsset] = useState<AdQueueItem | null>(null);`
  );
}

// Helper function to get lead count
if (!code.includes('const getLeadCount = (item: AdQueueItem) =>')) {
  code = code.replace(
    '// Bulk Selection',
    `const getLeadCount = (item: AdQueueItem) => leads.filter(l => l.sourceCampaignId === item.id || l.sourceCampaignName === item.campaignName).length;\n\n  // Bulk Selection`
  );
}

// Inject modal at the bottom
if (!code.includes('trackingAsset && (')) {
  code = code.replace(
    '{previewItem && (',
    `{trackingAsset && (
        <MediaAssetLeadTrackerModal
          assetId={trackingAsset.id}
          assetName={trackingAsset.campaignName}
          allLeads={leads}
          onClose={() => setTrackingAsset(null)}
        />
      )}

      {previewItem && (`
  );
}

// Add icon in table view (Line ~1007)
// Let's find a good spot in the table view to inject the Lead Counter.
// Maybe next to the "Geo Targets" or "Platform"? No, let's put it next to "Origin" or in its own spot.
const tableOriginCode = `{item.sourceType === 'incoming_property' && (
                            <span className="flex flex-col">`;
const tableCounterCode = `
                        {item.publishedChannels.length > 0 && (
                          <div className="mt-2">
                            <button 
                              onClick={() => setTrackingAsset(item)}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider rounded-full border border-emerald-200 transition-colors"
                              title="View full ad results tracking"
                            >
                              <Users className="w-3 h-3" />
                              {getLeadCount(item)} Leads
                            </button>
                          </div>
                        )}`;

code = code.replace(
  '{item.publishedChannels.includes(\'social_media\') && (',
  tableCounterCode + '\n                            {item.publishedChannels.includes(\'social_media\') && ('
);

// Add icon in grid view (Line ~1150)
const gridCounterCode = `
                      {item.publishedChannels.length > 0 && (
                        <button 
                          onClick={() => setTrackingAsset(item)}
                          className="flex items-center justify-center gap-1.5 w-full py-1.5 mt-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider rounded-xl border border-emerald-200 transition-colors"
                          title="View full ad results tracking"
                        >
                          <Users className="w-3.5 h-3.5" />
                          {getLeadCount(item)} Leads Produced
                        </button>
                      )}`;
code = code.replace(
  '</div>\n\n                    {/* Quick Launch Action Strip */}',
  gridCounterCode + '\n                  </div>\n\n                    {/* Quick Launch Action Strip */}'
);

fs.writeFileSync('src/components/AdQueueManager.tsx', code);
console.log('Patched AdQueueManager with MediaAssetLeadTrackerModal');
