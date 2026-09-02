const fs = require('fs');
const file = 'src/components/AILoanOfficer2ndBrain.tsx';
let content = fs.readFileSync(file, 'utf8');

const trainButton = `
              <input
                type="file"
                ref={trainInputRef}
                onChange={handleTrainUpload}
                accept=".txt,.csv,.json,.pdf"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => trainInputRef.current?.click()}
                disabled={loading}
                title="Train AI Memory (Add to Vector DB)"
                className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50 cursor-pointer shrink-0 shadow-xs"
              >
                <Database className="w-4 h-4" />
              </button>
`;
content = content.replace("<button\n                type=\"button\"\n                onClick={() => fileInputRef.current?.click()}", trainButton + "<button\n                type=\"button\"\n                onClick={() => fileInputRef.current?.click()}");

fs.writeFileSync(file, content);
