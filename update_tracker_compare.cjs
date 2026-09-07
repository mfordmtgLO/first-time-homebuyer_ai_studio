const fs = require('fs');
const content = fs.readFileSync('src/components/PropertyTracker.tsx', 'utf8');

// 1. Add import
let updatedContent = content.replace(
  'import { PropertyCard } from "./PropertyCard";',
  'import { PropertyCard } from "./PropertyCard";\nimport { SmartCompareAI } from "./SmartCompareAI";'
);

// 2. Add SmartCompareAI below table
const targetStr = `                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">`;

const replacementStr = `                </tbody>
              </table>
            </div>
            
            <SmartCompareAI 
              properties={comparedProperties}
              loanOfficer={loanOfficer}
              agent={activeAgent}
            />

            <div className="flex justify-end pt-2">`;

updatedContent = updatedContent.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/PropertyTracker.tsx', updatedContent);
