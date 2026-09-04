const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

const oldButton = \`            {userRole === "admin" && (
              <button
                data-tab-id="branch_management"
                onClick={() => setActiveTab("branch_management")}
                className={\\\`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 \${
                  activeTab === "branch_management"
                    ? "bg-[#606C5D] text-white shadow-md shadow-[#4A5D4E]/20"
                    : "text-[#9A9488] hover:bg-[#F8F7F4] hover:text-[#2D362E]"
                }\\\`}
              >
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4" />
                  <span className="font-semibold text-sm tracking-wide">Branch Whitelist Mgmt</span>
                </div>
              </button>
            )}\`;

const newButton = \`            {userRole === "admin" && (
              <button
                data-tab-id="branch_management"
                onClick={() => setActiveTab("branch_management")}
                className={\\\`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer \${
                  activeTab === "branch_management"
                    ? "bg-[#4A5D4E] text-white shadow-xs"
                    : "bg-[#F9F8F4] text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
                }\\\`}
              >
                <Building className="w-4 h-4 text-[#C18C5D]" />
                <span>Branch Whitelist Mgmt</span>
              </button>
            )}\`;

code = code.replace(oldButton, newButton);
fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code);
