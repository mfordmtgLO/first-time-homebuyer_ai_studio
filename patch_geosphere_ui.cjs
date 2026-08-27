const fs = require('fs');
const file = 'src/components/GeoSphereSyncHub.tsx';
let content = fs.readFileSync(file, 'utf8');

const uiInsert = `
      {/* Live Website Sync Status Card */}
      <div className="bg-[#FAF9F5] rounded-3xl border border-[#EAE7E0] p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#4A5D4E]/10 flex items-center justify-center">
            <Globe className="w-6 h-6 text-[#4A5D4E]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#2D362E]">Live Website Sync Status</h3>
            <p className="text-xs text-[#606C5D] mt-1">
              Local properties: <strong className="text-[#2D362E]">{syncedListings.length}</strong> | 
              Live on website: <strong className="text-[#2D362E]">{firestoreSyncCount !== null ? firestoreSyncCount : "..."}</strong>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {firestoreSyncCount !== null && firestoreSyncCount !== syncedListings.length && (
            <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Pending Updates
            </span>
          )}
          <button
            onClick={handleForceReSync}
            disabled={isForceSyncing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2D362E] hover:bg-[#4A5D4E] disabled:bg-stone-300 disabled:text-stone-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className={\`w-4 h-4 \${isForceSyncing ? "animate-spin" : ""}\`} />
            {isForceSyncing ? "Syncing..." : "Re-Sync All"}
          </button>
        </div>
      </div>
`;

content = content.replace(
  '      {/* Filter Tabs, Search Bar, and Batch Operations */}',
  uiInsert + '\n      {/* Filter Tabs, Search Bar, and Batch Operations */}'
);

fs.writeFileSync(file, content);
