const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

const targetStr = '                        {editingLo.passwordResetAuthorized ? "Revoke Reset Authorization" : "Authorize LO Password Reset"}\n                      </button>\n                    </div>\n                  )}';

const replacementStr = `                        {editingLo.passwordResetAuthorized ? "Revoke Reset Authorization" : "Authorize LO Password Reset"}
                      </button>
                    </div>
                  )}
                  {editingLo && !editingLo.isAdmin && (
                    <div className="pt-2 border-t border-[#EAE7E0] flex items-center justify-between gap-3 flex-wrap mt-3">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-[#2D362E] block">
                          Temporary Account Restriction
                        </span>
                        <p className="text-[10px] text-[#606C5D]">
                          {editingLo.accountRestricted
                            ? \`⛔ Account currently restricted (since \${editingLo.accountRestrictedAt ? new Date(editingLo.accountRestrictedAt).toLocaleDateString() : 'recently'}). LO cannot log in.\`
                            : "✅ Account is active. LO can log in normally."
                          }
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (editingLo.accountRestricted) {
                            setEditingLo({
                              ...editingLo,
                              accountRestricted: false,
                              accountRestrictedAt: undefined
                            });
                          } else {
                            setEditingLo({
                              ...editingLo,
                              accountRestricted: true,
                              accountRestrictedAt: new Date().toISOString()
                            });
                          }
                        }}
                        className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors \${
                          editingLo.accountRestricted
                            ? "bg-[#4A5D4E] hover:bg-[#38463B] text-white shadow-2xs"
                            : "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                        }\`}
                      >
                        {editingLo.accountRestricted ? "Remove Restriction" : "Restrict Access"}
                      </button>
                    </div>
                  )}`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code);
