const fs = require('fs');
let code = fs.readFileSync('src/components/PWAInstallButton.tsx', 'utf8');

// I escaped the backticks in my bash heredoc with \\, but it looks like I put \\\` which got output as \\\`. Let me just rewrite it safely without bash escaping issues.

code = `import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share, PlusSquare } from 'lucide-react';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={"flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold shadow-sm transition-colors " + className}
      >
        <Download className="w-3.5 h-3.5" />
        Install App
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={"flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DEDAD2] text-[#4A5D4E] hover:bg-[#F1EFE9] text-xs font-bold shadow-sm transition-colors " + className}
        >
          <Download className="w-3.5 h-3.5" />
          Install App
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-[#EAE7E0] dark:border-slate-800">
              <h3 className="text-lg font-black text-[#2D362E] dark:text-slate-100 mb-2">Install on iPhone / iPad</h3>
              <p className="text-sm text-[#606C5D] dark:text-slate-400 mb-4 leading-relaxed">
                Add this app to your home screen for quick access and a full-screen native experience.
              </p>
              
              <div className="bg-[#FAF9F5] dark:bg-slate-800 p-4 rounded-xl mb-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-white dark:bg-slate-700 p-1.5 rounded-md shadow-sm shrink-0">
                    <Share className="w-5 h-5 text-[#4A5D4E] dark:text-amber-400" />
                  </div>
                  <p className="text-sm text-[#2D362E] dark:text-slate-200">
                    1. Tap the <strong>Share</strong> button in your Safari toolbar at the bottom of the screen.
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-white dark:bg-slate-700 p-1.5 rounded-md shadow-sm shrink-0">
                    <PlusSquare className="w-5 h-5 text-[#4A5D4E] dark:text-amber-400" />
                  </div>
                  <p className="text-sm text-[#2D362E] dark:text-slate-200">
                    2. Scroll down and tap <strong>Add to Home Screen</strong>.
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] py-3 text-sm font-bold text-white transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
`;

fs.writeFileSync('src/components/PWAInstallButton.tsx', code);
