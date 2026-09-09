const fs = require('fs');
let code = fs.readFileSync('src/components/LoginScreen.tsx', 'utf8');

const targetLoginEnd = `      <div id="login-recaptcha" className="hidden"></div>
    </div>
  );`;

const replacementLoginEnd = `      <div id="login-recaptcha" className="hidden"></div>
      
      <div className="mt-8 text-center max-w-sm w-full mx-auto space-y-4">
        <p className="text-[10px] text-[#9A9488]">
          Cornerstone First Mortgage, LLC · NMLS ID #173855<br />
          Mike Ford · Loan Officer · NMLS# 288455<br />
          <a href="https://www.nmlsconsumeraccess.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#4A5D4E]">NMLS Consumer Access</a>
        </p>
        <p className="text-[10px] text-[#9A9488]">
          © {new Date().getFullYear()} Cornerstone First Mortgage, LLC.<br />
          Equal Housing Opportunity Lender.
        </p>
        <div className="flex justify-center opacity-60">
          <img src="https://www.hud.gov/sites/dfiles/FHEO/images/eho.jpg" alt="Equal Housing Opportunity" className="w-6 h-6 object-contain mix-blend-multiply" />
        </div>
      </div>
    </div>
  );`;

code = code.replace(targetLoginEnd, replacementLoginEnd);
fs.writeFileSync('src/components/LoginScreen.tsx', code);
