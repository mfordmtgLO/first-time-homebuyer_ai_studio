const fs = require('fs');
const file = 'src/components/GeoSphereSyncHub.tsx';
let content = fs.readFileSync(file, 'utf8');

const originalBlock = `                {(inspectingListing.mlsNumber || inspectingListing.listingAgent || inspectingListing.listingOffice) && (
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-[11px] space-y-2">
                    <h5 className="font-bold text-stone-800 border-b border-stone-200 pb-1.5 mb-1.5 flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3 text-stone-500" />
                      Listing & Agent Contact Info
                    </h5>
                    {inspectingListing.mlsNumber && (
                      <div className="flex justify-between gap-2">
                        <span className="text-stone-500 shrink-0">MLS ID:</span>
                        <strong className="text-stone-800 text-right">{inspectingListing.mlsNumber} ({inspectingListing.mlsName || "RMLS"})</strong>
                      </div>
                    )}
                    {inspectingListing.listingAgent?.name && (
                      <div className="flex justify-between gap-2">
                        <span className="text-stone-500 shrink-0">Agent Name:</span>
                        <span className="text-stone-800 font-bold text-right">{inspectingListing.listingAgent.name}</span>
                      </div>
                    )}
                    {inspectingListing.listingAgent?.phone && (
                      <div className="flex justify-between gap-2">
                        <span className="text-stone-500 shrink-0">Agent Phone:</span>
                        <a href={\`tel:\${inspectingListing.listingAgent.phone}\`} className="text-blue-600 hover:underline text-right font-medium">{inspectingListing.listingAgent.phone}</a>
                      </div>
                    )}
                    {inspectingListing.listingAgent?.email && (
                      <div className="flex justify-between gap-2">
                        <span className="text-stone-500 shrink-0">Agent Email:</span>
                        <a href={\`mailto:\${inspectingListing.listingAgent.email}\`} className="text-blue-600 hover:underline text-right truncate max-w-[160px]" title={inspectingListing.listingAgent.email}>{inspectingListing.listingAgent.email}</a>
                      </div>
                    )}
                    {inspectingListing.listingAgent?.website && (
                      <div className="flex justify-between gap-2">
                        <span className="text-stone-500 shrink-0">Agent Website:</span>
                        <a href={inspectingListing.listingAgent.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-right truncate max-w-[160px]">
                          {inspectingListing.listingAgent.website.replace(/^https?:\\/\\//, '')}
                        </a>
                      </div>
                    )}
                    {inspectingListing.listingOffice?.name && (
                      <div className="flex justify-between gap-2 pt-1 border-t border-stone-200/60 mt-1">
                        <span className="text-stone-500 shrink-0">Brokerage:</span>
                        <span className="text-stone-800 text-right truncate max-w-[160px]" title={inspectingListing.listingOffice.name}>{inspectingListing.listingOffice.name}</span>
                      </div>
                    )}
                  </div>
                )}`;

const newBlock = `                {inspectingListing.mlsNumber && (
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-[11px] space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-stone-500">MLS ID:</span>
                      <strong className="text-stone-800">{inspectingListing.mlsNumber} ({inspectingListing.mlsName || "RMLS"})</strong>
                    </div>
                  </div>
                )}`;

if (content.includes(originalBlock)) {
  content = content.replace(originalBlock, newBlock);
  fs.writeFileSync(file, content);
  console.log("Successfully replaced block.");
} else {
  console.log("Could not find block.");
}
