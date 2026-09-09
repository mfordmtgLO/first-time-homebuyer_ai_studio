const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

const OREGON_COUNTIES = [
  "Multnomah County", 
  "Washington County", 
  "Clackamas County", 
  "Marion County", 
  "Lane County", 
  "Deschutes County", 
  "Jackson County", 
  "Clark County, WA"
];

const countiesHtml = `
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#606C5D] flex items-center gap-2">
                  Ad Coverage Area (MLS Counties)
                  <span className="text-[10px] text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">Used for Dynamic Ad Targeting</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {[
                    "Multnomah County", 
                    "Washington County", 
                    "Clackamas County", 
                    "Marion County", 
                    "Lane County", 
                    "Deschutes County", 
                    "Jackson County", 
                    "Clark County, WA"
                  ].map(county => {
                    const currentCounties = editingAgent ? (editingAgent.activeAdCounties || editingAgent.marketAreas || []) : (newAgentForm.activeAdCounties || newAgentForm.marketAreas || []);
                    const isActive = currentCounties.includes(county);
                    return (
                      <label key={county} className={\`flex items-center gap-2 p-2 border rounded-xl cursor-pointer transition-colors \${isActive ? 'bg-[#4A5D4E]/10 border-[#4A5D4E]' : 'bg-[#F9F8F4] border-[#EAE7E0] hover:border-[#C18C5D]'}\`}>
                        <input 
                          type="checkbox"
                          className="hidden"
                          checked={isActive}
                          onChange={(e) => {
                            const updated = e.target.checked 
                              ? [...currentCounties, county] 
                              : currentCounties.filter(c => c !== county);
                            if (editingAgent) {
                              setEditingAgent({ ...editingAgent, activeAdCounties: updated, marketAreas: updated });
                            } else {
                              setNewAgentForm((p) => ({ ...p, activeAdCounties: updated, marketAreas: updated }));
                            }
                          }}
                        />
                        <div className={\`w-4 h-4 rounded flex items-center justify-center border \${isActive ? 'bg-[#4A5D4E] border-[#4A5D4E]' : 'bg-white border-gray-300'}\`}>
                          {isActive && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        <span className="text-[10px] font-medium text-[#2D362E]">{county}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
`;

code = code.replace(
  '              <div className="flex justify-end gap-2 pt-2">',
  countiesHtml + '\n              <div className="flex justify-end gap-2 pt-2">'
);

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code);
