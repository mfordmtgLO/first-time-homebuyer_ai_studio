const fs = require('fs');
const file = 'src/components/GeoSphereSyncHub.tsx';
let content = fs.readFileSync(file, 'utf8');

const badges = `        <div className="flex items-center gap-3">
          {syncError ? (
            <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Failed
            </span>
          ) : firestoreSyncCount !== null && firestoreSyncCount !== syncedListings.length ? (
            <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              Pending Mismatch
            </span>
          ) : firestoreSyncCount !== null && firestoreSyncCount === syncedListings.length ? (
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Synced
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-stone-600 bg-stone-50 px-2.5 py-1 rounded-full border border-stone-200 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Checking...
            </span>
          )}
          <button`;

content = content.replace(
  /        <div className="flex items-center gap-3">\s+\{firestoreSyncCount !== null && firestoreSyncCount !== syncedListings\.length && \(\s+<span className="text-\[11px\] font-semibold text-amber-600 bg-amber-50 px-2\.5 py-1 rounded-full border border-amber-200">\s+Pending Updates\s+<\/span>\s+\)\}\s+<button/,
  badges
);

fs.writeFileSync(file, content);
