const fs = require('fs');
let code = fs.readFileSync('src/components/Buydown21ScenarioEngine.tsx', 'utf8');

const importTarget = `import { calculateMonthlyPI, formatUSD } from "../utils/mortgageMath";`;
const importReplacement = `import { calculateMonthlyPI, formatUSD } from "../utils/mortgageMath";
import { ContextualVideoPlayer } from "./ContextualVideoPlayer";`;

code = code.replace(importTarget, importReplacement);

const targetLocation = `      <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm border border-[#EAE7E0] relative overflow-hidden">`;
const replacementLocation = `      <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm border border-[#EAE7E0] relative overflow-hidden">
        {/* Contextual Video Embed for Buydown Strategy */}
        <div className="mb-10 w-full">
          <ContextualVideoPlayer 
            videoId="1CXe6w3iJb4" 
            title="How a 2-1 Buydown Saves You $500+/mo | Mike Ford" 
            description="Watch Mike explain exactly how seller-paid buydowns work and why they are the ultimate hack in today's market."
            className="w-full max-w-3xl mx-auto"
          />
        </div>`;

if (code.includes(targetLocation)) {
  code = code.replace(targetLocation, replacementLocation);
  fs.writeFileSync('src/components/Buydown21ScenarioEngine.tsx', code);
  console.log("Buydown patched.");
} else {
  console.log("Could not find target buydown location.");
}
