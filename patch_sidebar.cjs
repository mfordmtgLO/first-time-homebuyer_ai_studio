const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerSidebar.tsx', 'utf8');

const targetMenuBlock = `{
          id: "growth",
          icon: <TrendingUp className="w-5 h-5" />,
          label: "Branch Performance & ROI",
        },`;

const newMenuBlock = `{
          id: "growth",
          icon: <TrendingUp className="w-5 h-5" />,
          label: "Branch Performance & ROI",
        },
        // Only show Ads & Posts ROI+Performance if user is not a processor
        ...(currentLo.role !== 'processor' ? [{
          id: "ads_roi_performance",
          icon: <PieChart className="w-5 h-5" />,
          label: "Ads & Posts ROI+Performance",
        }] : []),`;

if (code.includes('Branch Performance & ROI')) {
  // It has a single branch performance item
  if (!code.includes('ads_roi_performance')) {
    code = code.replace(targetMenuBlock, newMenuBlock);
    fs.writeFileSync('src/components/LoanOfficerSidebar.tsx', code);
    console.log("Patched sidebar with Ads ROI Performance tab.");
  }
} else {
  console.log("Could not find Branch Performance & ROI block.");
}
