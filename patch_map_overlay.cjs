const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyMapOverlay.tsx', 'utf8');

c = c.replace(
  'const readiness = calculateHomebuyingReadiness(property, profile);',
  `const defaultProfile = { downPaymentSavings: 0, interestRate: 6.5, loanTermYears: 30, annualHomeInsurance: 1200, targetMonthlyPayment: 2500, dtiLimit: 43 };
      const readiness = profile ? calculateHomebuyingReadiness(property, profile) : calculateHomebuyingReadiness(property, defaultProfile as any);`
);

// Fix function calls
c = c.replace(/onOpenScorecard\(property\);/g, 'if (onOpenScorecard) onOpenScorecard(property);');
c = c.replace(/onAskAiAboutProperty\(property\);/g, 'if (onAskAiAboutProperty) onAskAiAboutProperty(property);');
c = c.replace(/onToggleCompare\(property\.id\);/g, 'if (onToggleCompare) onToggleCompare(property.id);');

c = c.replace(/onClick=\{\(\) => onOpenScorecard\(activeSelectedProperty\)\}/g, 'onClick={() => onOpenScorecard && onOpenScorecard(activeSelectedProperty)}');
c = c.replace(/onClick=\{\(\) => onAskAiAboutProperty\(activeSelectedProperty\)\}/g, 'onClick={() => onAskAiAboutProperty && onAskAiAboutProperty(activeSelectedProperty)}');
c = c.replace(/onClick=\{\(\) => onToggleCompare\(activeSelectedProperty\.id\)\}/g, 'onClick={() => onToggleCompare && onToggleCompare(activeSelectedProperty.id)}');

c = c.replace(/const isCompared = compareIds\.includes\(property\.id\);/g, 'const isCompared = compareIds?.includes(property.id) || false;');
c = c.replace(/compareIds\.includes\(activeSelectedProperty\.id\)/g, '(compareIds?.includes(activeSelectedProperty.id) || false)');

fs.writeFileSync('src/components/PropertyMapOverlay.tsx', c);
