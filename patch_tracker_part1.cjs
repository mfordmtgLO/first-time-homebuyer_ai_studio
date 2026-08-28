const fs = require('fs');
const file = 'src/components/PropertyTracker.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('FileSpreadsheet')) {
  content = content.replace(
    'FileDown\n} from "lucide-react";',
    'FileDown,\n  FileSpreadsheet,\n  TrendingUp,\n  Clock\n} from "lucide-react";'
  );
}

// Add state for export CSV
const exportLogic = `  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    
    // Create CSV content
    const headers = [
      "Address", "City", "State", "Zip", "Price", "Beds", "Baths", "SqFt", "DOM",
      "Agent Name", "Agent Email", "Agent Phone",
      "Status", "USDA Eligible", "Flex Lending Eligible", "OHCS Targeted Area"
    ].join(",");

    const rows = filtered.map(p => {
      const escape = (str) => \`"\${(str || '').toString().replace(/"/g, '""')}"\`;
      return [
        escape(p.address),
        escape(p.city),
        escape(p.state),
        escape(p.zip),
        p.price,
        p.beds,
        p.baths,
        p.sqft,
        p.daysOnMarket || '',
        escape(p.listingAgent?.name),
        escape(p.listingAgent?.email),
        escape(p.listingAgent?.phone),
        escape(p.status),
        isUsdaEligible(p) ? 'Yes' : 'No',
        isLmiEligible(p) ? 'Yes' : 'No',
        isTargetedArea(p) ? 'Yes' : 'No'
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Property-Pipeline-Export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };`;

content = content.replace(
  '  const handleExportPDF = async () => {',
  exportLogic + '\n\n  const handleExportPDF = async () => {'
);

const kpiLogic = `  // KPI Calculations
  const kpiStats = React.useMemo(() => {
    if (filtered.length === 0) return { totalVolume: 0, avgDom: 0, activeListings: 0 };
    const totalVolume = filtered.reduce((sum, p) => sum + p.price, 0);
    const totalDom = filtered.reduce((sum, p) => sum + (p.daysOnMarket || 0), 0);
    const activeListings = filtered.length;
    return {
      totalVolume,
      activeListings,
      avgDom: Math.round(totalDom / activeListings)
    };
  }, [filtered]);`;

content = content.replace(
  '  const comparedProperties = properties.filter(p => compareIds.includes(p.id));',
  '  const comparedProperties = properties.filter(p => compareIds.includes(p.id));\n\n' + kpiLogic
);

const csvButtonUI = `            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#EAE7E0] hover:bg-stone-50 text-[#606C5D] hover:text-[#2D362E] font-semibold text-xs shadow-sm transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportPDF}`;

content = content.replace(
  '            <button\n              onClick={handleExportPDF}',
  csvButtonUI
);

const kpiCardUI = `      {/* KPI Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-[#EAE7E0] p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#F1EFE9] rounded-xl text-[#4A5D4E]">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#9A9488] uppercase tracking-wider">Active Listings</p>
            <p className="text-2xl font-serif font-bold text-[#2D362E]">{kpiStats.activeListings}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#EAE7E0] p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#F1EFE9] rounded-xl text-[#4A5D4E]">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#9A9488] uppercase tracking-wider">Total Volume</p>
            <p className="text-2xl font-serif font-bold text-[#2D362E]">{formatUSD(kpiStats.totalVolume)}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#EAE7E0] p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#F1EFE9] rounded-xl text-[#4A5D4E]">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#9A9488] uppercase tracking-wider">Avg Days on Market</p>
            <p className="text-2xl font-serif font-bold text-[#2D362E]">{kpiStats.avgDom} Days</p>
          </div>
        </div>
      </div>

      <div id="property-report-content"`;

content = content.replace(
  '      <div id="property-report-content"',
  kpiCardUI
);

fs.writeFileSync(file, content);
