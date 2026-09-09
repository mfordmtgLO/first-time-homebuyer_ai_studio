const fs = require('fs');
let code = fs.readFileSync('src/components/CuratedHomesSection.tsx', 'utf8');

const importTarget = `import { formatUSD, calculateMonthlyPI } from "../utils/mortgageMath";`;
const importReplacement = `import { formatUSD, calculateMonthlyPI } from "../utils/mortgageMath";
import { ContextualVideoPlayer } from "./ContextualVideoPlayer";`;

code = code.replace(importTarget, importReplacement);

const targetLocation = `      {/* Header & Filter Controls */}`;
const replacementLocation = `      {/* Header & Filter Controls */}
      
      {/* Contextual Video Embed for Curated Properties */}
      <div className="w-full">
        <ContextualVideoPlayer 
          videoId="hM5xP9HXZW4" 
          title="Finding Low to NO Down Payment Homes | Mike Ford" 
          description="Learn how to read these property maps to identify specific zones that qualify for 0% down loans and heavy grant subsidies."
          className="shadow-sm mb-6 max-w-4xl"
        />
      </div>`;

code = code.replace(targetLocation, replacementLocation);
fs.writeFileSync('src/components/CuratedHomesSection.tsx', code);
