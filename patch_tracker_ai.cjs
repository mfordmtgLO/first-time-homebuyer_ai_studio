const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyTracker.tsx', 'utf8');

const target = `      {/* Top Header & Pipeline Controls */}
      <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1EFE9] text-[#4A5D4E] text-xs font-semibold border border-[#EAE7E0]">
              <Building className="w-3.5 h-3.5" />
              <span>Property Tour & Scorecard Tracker</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D362E]">
              Your Target Homes & Tour Audits
            </h2>
            <p className="text-xs sm:text-sm text-[#606C5D]">
              Evaluate real properties, record structural tour scorecards on-site, and run side-by-side affordability comparisons.
            </p>
          </div>`;

const injection = `      {/* Ask GeoSphere Maps Search */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 sm:p-8 relative overflow-hidden mb-6 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-indigo-700 text-xs font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask GeoSphere AI</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-indigo-900">
              Conversational Property Discovery
            </h2>
            <p className="text-sm text-indigo-900/80 max-w-2xl">
              Tell the map exactly what you're looking for. We'll cross-reference live MLS data, Census Tract boundaries, and zero-down grants.
            </p>
            <form className="mt-4 flex flex-col sm:flex-row gap-2 max-w-3xl" onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="e.g., Show me 3 bed homes under $450k near St. Johns that qualify for the DevNW 0% down grant..." className="flex-1 px-4 py-3 rounded-xl border border-indigo-200 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 shadow-sm" />
              <button 
                type="button" 
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
                onClick={() => {
                  alert("GeoSphere AI Search Active.\\n\\nParsing intent: \\n- Price: <$450k\\n- Location: St. Johns (Multnomah County)\\n- Financial Trigger: DevNW 0% down grant eligibility\\n\\nCross-referencing live active listings with LMI Census Tract shapefiles...");
                  // Example simulation effect
                  setTimeout(() => {
                    alert("Found 6 matches! These properties have been pinned to your map and synced with your loan officer.");
                  }, 1500);
                }}
              >
                <Search className="w-4 h-4" /> Search Map
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Top Header & Pipeline Controls */}
      <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1EFE9] text-[#4A5D4E] text-xs font-semibold border border-[#EAE7E0]">
              <Building className="w-3.5 h-3.5" />
              <span>Property Tour & Scorecard Tracker</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D362E]">
              Your Target Homes & Tour Audits
            </h2>
            <p className="text-xs sm:text-sm text-[#606C5D]">
              Evaluate real properties, record structural tour scorecards on-site, and run side-by-side affordability comparisons.
            </p>
          </div>`;

c = c.replace(target, injection);
fs.writeFileSync('src/components/PropertyTracker.tsx', c);
