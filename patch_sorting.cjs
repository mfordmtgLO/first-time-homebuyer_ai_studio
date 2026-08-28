const fs = require('fs');
const file = 'src/components/PropertyTracker.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add sort state
const stateToAdd = `  const [showCompareModal, setShowCompareModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [sortBy, setSortBy] = useState("added");
  const [sortOrder, setSortOrder] = useState("desc");`;

content = content.replace(
  '  const [showCompareModal, setShowCompareModal] = useState(false);\n  const [isExporting, setIsExporting] = useState(false);',
  stateToAdd
);

// Add sorting logic to filtered
const filteringLogic = `  const filtered = properties.filter(p => {
    // 1. Status Filter
    if (filterStatus === "favorites" && !p.isFavorite) return false;
    if (filterStatus === "consideration" && p.status !== "saved" && p.status !== "touring") return false;
    if (filterStatus === "offered" && p.status !== "offered" && p.status !== "under_contract") return false;
    if (filterStatus === "archived" && p.status !== "passed") return false;

    // 2. Overlay Filter
    if (overlayFilter === "usda" && !isUsdaEligible(p)) return false;
    if (overlayFilter === "lmi" && !isLmiEligible(p)) return false;
    if (overlayFilter === "lmi_usda" && !isLmiUsdaDual(p)) return false;
    if (overlayFilter === "targeted" && !isTargetedArea(p)) return false;
    if (overlayFilter === "non_targeted" && !isNonTargetedArea(p)) return false;
    if (overlayFilter === "price_eligible" && !isFirstHomePriceEligible(p)) return false;

    return true;
  }).sort((a, b) => {
    let comparison = 0;
    if (sortBy === "price") {
      comparison = a.price - b.price;
    } else if (sortBy === "dom") {
      comparison = (a.daysOnMarket || 0) - (b.daysOnMarket || 0);
    } else {
      // Default to added date (assuming higher ID or syncedAt means newer, for mock data we can sort by id if syncedAt missing)
      const dateA = a.syncedAt ? new Date(a.syncedAt).getTime() : a.id.localeCompare(b.id);
      const dateB = b.syncedAt ? new Date(b.syncedAt).getTime() : 0;
      comparison = (dateA > dateB) ? 1 : -1;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });`;

content = content.replace(
  /  const filtered = properties\.filter\(p => \{[\s\S]*?    return true;\n  \}\);/,
  filteringLogic
);

// Add Sort UI
const sortUI = `        {/* Sort Controls */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#EAE7E0]/60">
          <span className="text-[11px] font-bold text-[#606C5D] uppercase tracking-wider mr-1">Sort By:</span>
          {[
            { id: "added", label: "Added Date" },
            { id: "price", label: "Market Value" },
            { id: "dom", label: "Days on Market" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                if (sortBy === tab.id) {
                  setSortOrder(prev => prev === "asc" ? "desc" : "asc");
                } else {
                  setSortBy(tab.id);
                  setSortOrder("desc");
                }
              }}
              className={\`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 \${
                sortBy === tab.id
                  ? "bg-[#4A5D4E] text-white shadow-2xs font-bold ring-2 ring-[#4A5D4E]/20"
                  : "bg-[#FAF9F5] text-[#606C5D] hover:bg-[#F1EFE9] border border-[#EAE7E0]"
              }\`}
            >
              {tab.label}
              {sortBy === tab.id && (
                <ArrowRight className={\`w-3 h-3 transition-transform \${sortOrder === "desc" ? "rotate-90" : "-rotate-90"}\`} />
              )}
            </button>
          ))}
        </div>

        {/* Screening Aid Disclaimer Banner */}`;

content = content.replace(
  '        {/* Screening Aid Disclaimer Banner */}',
  sortUI
);

fs.writeFileSync(file, content);
