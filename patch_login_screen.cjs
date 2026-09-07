const fs = require('fs');
let c = fs.readFileSync('src/components/LoginScreen.tsx', 'utf8');

const loginUI = `              <div className="bg-[#4A5D4E]/10 border border-[#4A5D4E]/30 p-4 rounded-xl flex items-start gap-3 mt-4">
                <ShieldCheck className="w-5 h-5 text-[#4A5D4E] shrink-0" />
                <div className="text-sm text-[#606C5D] dark:text-[#9A9488]">
                  <strong>System Administrators:</strong> Your dashboard access will be restricted according to your RBAC assignments (e.g., Compliance Auditors are routed exclusively to the Telemetry portal).
                </div>
              </div>`;

c = c.replace(
  '{/* LOAN OFFICER LOGIN VIEW */}',
  `${loginUI}\n\n              {/* LOAN OFFICER LOGIN VIEW */}`
);

fs.writeFileSync('src/components/LoginScreen.tsx', c);
