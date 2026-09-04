const fs = require('fs');
let code = fs.readFileSync('src/components/LoginScreen.tsx', 'utf8');

code = code.replace(
  '        {error && (\n          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">\n            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />\n            <p className="text-sm text-red-800 leading-relaxed">{error}</p>\n          </div>\n        )}',
  `        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 leading-relaxed">{error}</p>
            </div>
            {(error.includes("popup") || error.includes("cross-origin") || error.includes("Failed to sign in") || error.includes("auth/")) && (
              <div className="w-full mt-1 p-3 bg-white rounded-lg border border-red-200 text-xs text-red-700">
                <strong>Having trouble?</strong> If you are viewing this inside the AI Studio preview window, popup authentication is likely blocked by your browser. 
                <br/><br/>
                Please click the <strong>"Open in New Tab"</strong> icon at the top of your preview window (or open your Shared App URL directly) and try logging in from that full browser tab instead.
              </div>
            )}
          </div>
        )}`
);

fs.writeFileSync('src/components/LoginScreen.tsx', code);
