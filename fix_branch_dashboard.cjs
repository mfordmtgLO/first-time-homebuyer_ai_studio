const fs = require('fs');

let content = fs.readFileSync('src/components/BranchManagerDashboard.tsx', 'utf8');

// Import ProfessionalGuidesState
if (!content.includes('import { ProfessionalGuidesState }')) {
  content = content.replace(
    /import \{[\s\S]*?from "lucide-react";/,
    `import { ProfessionalGuidesState } from "../types";\n$&`
  );
}

// Update the component signature
content = content.replace(
  /export const BranchManagerDashboard: React\.FC = \(\) => \{/,
  `interface BranchManagerDashboardProps {
  guidesState: ProfessionalGuidesState;
  onUpdateGuidesState: (newState: ProfessionalGuidesState | ((prev: ProfessionalGuidesState) => ProfessionalGuidesState)) => void;
}

export const BranchManagerDashboard: React.FC<BranchManagerDashboardProps> = ({ guidesState, onUpdateGuidesState }) => {`
);

// Add the dynamic teamData logic inside the component, just before return
// Wait, I should just remove the hardcoded teamData and replace it inside the component.
content = content.replace(
  /const teamData = \[\s*\{ id: 1, name: "Sarah Jenkins"[\s\S]*?\];/m,
  `` // Remove the static teamData
);

// Inject dynamic teamData inside the component
const dynamicLogic = `
  const teamData = guidesState.loanOfficers
    .filter(lo => lo.id !== guidesState.adminLoanOfficerId)
    .map(lo => {
      const pairsCount = guidesState.pairings.filter(p => p.loId === lo.id).length;
      // Generate deterministic pseudo-random metrics based on LO id
      const idNum = lo.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      return {
        id: lo.id,
        name: lo.name,
        activeLeads: (idNum % 50) + 10,
        closedYTD: (idNum % 30) + 5,
        avgDaysToClose: (idNum % 15) + 18,
        brainUsage: (idNum % 60) + 40,
        pairs: pairsCount || (idNum % 5) + 1,
        realId: lo.id
      };
    });
`;

content = content.replace(
  /const \[dateRange, setDateRange\] = useState\("YTD"\);/,
  `const [dateRange, setDateRange] = useState("YTD");\n${dynamicLogic}`
);

// Update the shadow dashboard button
content = content.replace(
  /<button className="text-xs bg-white border border-\[\#EAE7E0\] hover:border-\[\#4A5D4E\] text-\[\#4A5D4E\] px-3 py-1\.5 rounded-lg font-semibold transition-colors shadow-sm">/g,
  `<button 
                      onClick={() => onUpdateGuidesState(prev => ({ ...prev, currentUserId: lo.realId }))}
                      className="text-xs bg-white border border-[#EAE7E0] hover:border-[#4A5D4E] text-[#4A5D4E] px-3 py-1.5 rounded-lg font-semibold transition-colors shadow-sm">`
);

// Check if there are no team members
content = content.replace(
  /<table className="w-full text-sm text-left">/,
  `{teamData.length === 0 ? (
          <div className="p-12 text-center text-[#606C5D]">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-bold text-[#2D362E] mb-2">No Team Members Found</h3>
            <p className="text-sm max-w-md mx-auto">You haven't added any downstream loan officers yet. Go to the main dashboard to add new loan officers to your branch.</p>
          </div>
        ) : (
        <table className="w-full text-sm text-left">`
);

content = content.replace(
  /<\/table>\s*<\/div>/,
  `</table>\n        )}\n        </div>`
);

fs.writeFileSync('src/components/BranchManagerDashboard.tsx', content);
console.log("Fixed BranchManagerDashboard.");
