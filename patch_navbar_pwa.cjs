const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

const importTarget = `import { analyzeRateTrends, TrendHorizon } from "../utils/rateTrends";`;
const importReplacement = `import { analyzeRateTrends, TrendHorizon } from "../utils/rateTrends";
import { PWAInstallButton } from "./PWAInstallButton";`;

code = code.replace(importTarget, importReplacement);

const targetLocation = `            <span>Local Guides</span>
          </button>
        </div>`;

const replacementLocation = `            <span>Local Guides</span>
          </button>
        </div>
        
        <div className="hidden sm:block ml-2">
          <PWAInstallButton />
        </div>`;

code = code.replace(targetLocation, replacementLocation);

const targetMobileMenu = `            </div>
            
            {!isAppPublic && (
              <button`;
              
const replacementMobileMenu = `            </div>
            
            <div className="flex justify-center border-t border-[#EAE7E0] pt-4 mt-2">
              <PWAInstallButton />
            </div>
            
            {!isAppPublic && (
              <button`;

code = code.replace(targetMobileMenu, replacementMobileMenu);

fs.writeFileSync('src/components/Navbar.tsx', code);
