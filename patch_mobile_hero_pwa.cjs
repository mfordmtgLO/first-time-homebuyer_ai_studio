const fs = require('fs');
let code = fs.readFileSync('src/components/mobile/MobileHeroWebsite.tsx', 'utf8');

const importTarget = `import { MobilePropertyCard } from './MobilePropertyCard';`;
const importReplacement = `import { MobilePropertyCard } from './MobilePropertyCard';
import { PWAInstallButton } from '../PWAInstallButton';`;

code = code.replace(importTarget, importReplacement);

const targetLocation = `              onClick={() => setCurrentTab("hero")}
            >
              First-Time Homebuyer Hub
            </span>
          </div>
          
          <button`;

const replacementLocation = `              onClick={() => setCurrentTab("hero")}
            >
              First-Time Homebuyer Hub
            </span>
          </div>
          
          <div className="mr-2">
            <PWAInstallButton />
          </div>
          
          <button`;

code = code.replace(targetLocation, replacementLocation);

fs.writeFileSync('src/components/mobile/MobileHeroWebsite.tsx', code);
