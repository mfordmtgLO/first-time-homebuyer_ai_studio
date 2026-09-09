import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
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
        className="flex items-center gap-2 rounded-full bg-[#183922] px-4 py-2 text-xs font-bold tracking-widest text-white shadow-sm hover:bg-[#112a19] transition-colors"
      >
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span className="hidden sm:inline">INSTALL APP</span>
        <span className="sm:hidden">INSTALL</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 rounded-full bg-[#183922] px-4 py-2 text-xs font-bold tracking-widest text-white shadow-sm hover:bg-[#112a19] transition-colors"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span className="hidden sm:inline">INSTALL APP</span>
          <span className="sm:hidden">INSTALL</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowIOSGuide(false)}>
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-[#EAE7E0]" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-center w-12 h-12 bg-[#F1EFE9] text-[#183922] rounded-full mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-center text-[#2D362E] mb-2">Install on iPhone</h3>
              <p className="text-center text-sm text-[#4A5D4E] mb-6">
                Install this app on your home screen for quick access.
              </p>
              
              <div className="bg-[#F9F8F4] rounded-xl p-4 space-y-4 mb-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm font-bold text-[#183922]">1</div>
                  <p className="text-sm text-[#2D362E] pt-1">
                    Tap the <strong>Share</strong> button at the bottom of Safari.
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm font-bold text-[#183922]">2</div>
                  <p className="text-sm text-[#2D362E] pt-1">
                    Scroll down and tap <strong>Add to Home Screen</strong>.
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-[#EAE7E0] py-3 text-sm font-bold text-[#2D362E] hover:bg-[#dcd8ce] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
