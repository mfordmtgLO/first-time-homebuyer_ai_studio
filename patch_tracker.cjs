const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyTracker.tsx', 'utf8');

if (!c.includes('Flame,')) {
    c = c.replace('import {\\n  MapPin,', 'import {\\n  MapPin,\\n  Flame,\\n  BellRing,');
}

const target = `{/* Primary View Mode Switcher: Google Maps Overlay vs Grid Cards */}`;

const injection = `
      {/* Cloud Function Price Drop Alert Simulation */}
      {properties.filter(p => p.priceDropAmount && p.priceDropAmount > 0).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 rounded-xl shrink-0">
              <BellRing className="w-5 h-5 text-red-600 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-red-900 text-sm tracking-tight flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-red-600" />
                Firebase Cloud Function: Price Drop Detected!
              </h3>
              <p className="text-xs text-red-800/80 mt-0.5 leading-relaxed max-w-2xl">
                The automated MLS/Rentcast API sync just detected a price drop of up to <strong>{formatUSD(Math.max(...properties.filter(p => p.priceDropAmount && p.priceDropAmount > 0).map(p => p.priceDropAmount || 0)))}</strong> on your saved properties. 
                An updated, synced Google Maps layer has been dispatched to your mobile device via Push Notification.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setViewMode("cards");
              alert("Simulating Consumer Flow:\\n\\nThe user taps the mobile Google Maps push notification which routes them directly back to this dashboard to review the new financial scorecard for the discounted property.");
            }}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm whitespace-nowrap cursor-pointer"
          >
            Review Disclosures
          </button>
        </div>
      )}

      {/* Primary View Mode Switcher: Google Maps Overlay vs Grid Cards */}`;

c = c.replace(target, injection);

fs.writeFileSync('src/components/PropertyTracker.tsx', c);
