const fs = require('fs');
let code = fs.readFileSync('src/components/Buydown21ScenarioEngine.tsx', 'utf8');

const targetHeader = `      {/* Header Banner */}`;
const replacementHeader = `      {/* Contextual Video Embed for Buydown Strategy */}
      <div className="w-full">
        <ContextualVideoPlayer 
          videoId="sXQxhojSdZM" 
          title="How a 2-1 Buydown Saves You $500+/mo | Mike Ford" 
          description="Watch Mike explain exactly how seller-paid buydowns work and why they are the ultimate hack in today's market."
          className="shadow-sm"
        />
      </div>
      
      {/* Header Banner */}`;

code = code.replace(targetHeader, replacementHeader);
fs.writeFileSync('src/components/Buydown21ScenarioEngine.tsx', code);
