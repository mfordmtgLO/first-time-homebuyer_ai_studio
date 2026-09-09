const fs = require('fs');
let code = fs.readFileSync('src/components/HeroWebsite.tsx', 'utf8');

const importTarget = `import { LocalProfessionalGuides } from "./LocalProfessionalGuides";`;
const importReplacement = `import { LocalProfessionalGuides } from "./LocalProfessionalGuides";
import { ContextualVideoPlayer } from "./ContextualVideoPlayer";`;

code = code.replace(importTarget, importReplacement);

const targetLocation = `            {/* CTAs */}`;
const replacementLocation = `            {/* Welcome Video (Replace videoId with your own from @mikeford1472) */}
            <div className="w-full max-w-md mt-6 mb-4">
              <ContextualVideoPlayer 
                videoId="c9FUYqJtGjg" 
                title="Welcome to your Homebuyer Portal | Mike Ford" 
                description="A quick 60-second intro on how to use this tool to find your first home."
                className="shadow-sm"
              />
            </div>
            
            {/* CTAs */}`;

code = code.replace(targetLocation, replacementLocation);

fs.writeFileSync('src/components/HeroWebsite.tsx', code);
