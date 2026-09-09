const fs = require('fs');
let code = fs.readFileSync('src/components/BranchManagement.tsx', 'utf8');

const targetTabs = `          <button
            onClick={() => setActiveSectionTab("sbom")}
            className={\`px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 border-b-2 \${
              activeSectionTab === "sbom"
                ? "border-[#4A5D4E] text-[#2D362E]"
                : "border-transparent text-[#606C5D] hover:text-[#2D362E] hover:border-[#EAE7E0]"
            }\`}
          >
            <Package className={\`w-4 h-4 \${activeSectionTab === "sbom" ? "text-[#4A5D4E]" : ""}\`} />
            SBOM & Supply Chain
          </button>`;

const replacementTabs = targetTabs + `
          <button
            onClick={() => setActiveSectionTab("ads")}
            className={\`px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2 border-b-2 \${
              activeSectionTab === "ads"
                ? "border-[#4A5D4E] text-[#2D362E]"
                : "border-transparent text-[#606C5D] hover:text-[#2D362E] hover:border-[#EAE7E0]"
            }\`}
          >
            <Globe className={\`w-4 h-4 \${activeSectionTab === "ads" ? "text-[#4A5D4E]" : ""}\`} />
            Ad Compliance Matrix
          </button>`;

code = code.replace(targetTabs, replacementTabs);

const targetContent = `      ) : activeSectionTab === "sbom" ? (
        <SupplyChainSbomSection
          onTriggerToast={showFeedback}
        />
      ) : (`;

const replacementContent = targetContent.replace(
  `      ) : (`,
  `      ) : activeSectionTab === "ads" ? (
        <AdminAdComplianceSection onTriggerToast={showFeedback} />
      ) : (`
);

code = code.replace(targetContent, replacementContent);

// Add the AdminAdComplianceSection component to the top of the file
const adminComponent = `
import { AdminAdComplianceSection } from "./AdminAdComplianceSection";
`;
code = code.replace('import { SupplyChainSbomSection } from "./SupplyChainSbomSection";', 'import { SupplyChainSbomSection } from "./SupplyChainSbomSection";\n' + adminComponent);

fs.writeFileSync('src/components/BranchManagement.tsx', code);
