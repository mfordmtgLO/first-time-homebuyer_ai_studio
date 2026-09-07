const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyMapOverlay.tsx', 'utf8');

c = c.replace('profile: FinancialProfile;', 'profile?: FinancialProfile;');
c = c.replace('onOpenScorecard: (property: PropertyListing) => void;', 'onOpenScorecard?: (property: PropertyListing) => void;');
c = c.replace('onAskAiAboutProperty: (property: PropertyListing) => void;', 'onAskAiAboutProperty?: (property: PropertyListing) => void;');
c = c.replace('compareIds: string[];', 'compareIds?: string[];');
c = c.replace('onToggleCompare: (propertyId: string) => void;', 'onToggleCompare?: (propertyId: string) => void;');

fs.writeFileSync('src/components/PropertyMapOverlay.tsx', c);
