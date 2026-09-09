const fs = require('fs');
const file = 'src/components/LoginScreen.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `<button
                    type="button"
                    onClick={() => onLogin("branch_manager")}
                    className="mt-6 text-xs text-red-500 font-bold hover:underline bg-red-50 px-4 py-2 rounded-lg"
                  >
                    Emergency Bypass (Direct Access)
                  </button>`;

code = code.replace(target, '');
fs.writeFileSync(file, code);
