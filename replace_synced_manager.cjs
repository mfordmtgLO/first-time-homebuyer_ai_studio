const fs = require('fs');
let code = fs.readFileSync('src/components/ai/AICommercialAdGenerator.tsx', 'utf8');

// Replace imports
code = code.replace('import { SyncedAdsManager } from "./SyncedAdsManager";', 'import { AdAssetsLibrary } from "./AdAssetsLibrary";');

// Replace component
code = code.replace('<SyncedAdsManager />', '<AdAssetsLibrary />');

fs.writeFileSync('src/components/ai/AICommercialAdGenerator.tsx', code, 'utf8');
console.log("Replaced SyncedAdsManager with AdAssetsLibrary");
