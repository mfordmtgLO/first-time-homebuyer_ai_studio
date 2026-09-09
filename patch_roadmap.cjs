const fs = require('fs');
let code = fs.readFileSync('src/components/RoadmapView.tsx', 'utf8');

const importTarget = `import { DEFAULT_FINANCIAL_PROFILE } from "../data/initialData";`;
const importReplacement = `import { DEFAULT_FINANCIAL_PROFILE } from "../data/initialData";
import { ContextualVideoPlayer } from "./ContextualVideoPlayer";`;

code = code.replace(importTarget, importReplacement);

const targetLocation = `      {/* Header & Overall Progress Bar */}`;
const replacementLocation = `      {/* Contextual Video Embed for Roadmap */}
      <div className="w-full">
        <ContextualVideoPlayer 
          videoId="7gJ_U5D8334" 
          title="The 10-Step Homebuyer Playbook Explained | Mike Ford" 
          description="Watch Mike explain the critical milestones in the journey from Pre-Approval to Clear to Close."
          className="shadow-sm"
        />
      </div>
      
      {/* Header & Overall Progress Bar */}`;

code = code.replace(targetLocation, replacementLocation);
fs.writeFileSync('src/components/RoadmapView.tsx', code);
