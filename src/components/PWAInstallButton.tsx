import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, Download, Share, PlusSquare, MoreVertical, X, Check, ArrowRight } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'default' | 'banner' | 'header' | 'pill';
  label?: string;
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'default',
  label,
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already running as an installed standalone PWA, hide or show minimal confirmation
  if (isInstalled) {
    if (variant === 'banner') {
      return (
        <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-1.5 font-medium">
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>App Installed on Home Screen</span>
          </div>
        </div>
      );
    }
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (!installed) {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      {variant === 'banner' ? (
        <div className={`w-full bg-gradient-to-r from-[#2D362E] via-[#38463B] to-[#4A5D4E] text-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-[#4A5D4E]/40 flex items-center justify-between gap-3 ${className}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-xs">
              <Smartphone className="w-5 h-5 text-[#D4A373]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold tracking-tight text-white truncate">
                  {label || "Install Homebuyer App"}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#C18C5D] text-white font-extrabold uppercase tracking-wide shrink-0">
                  Fast
                </span>
              </div>
              <p className="text-[11px] text-[#DEDAD2] truncate">
                1-tap home screen access • Instant loan calculations
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClick}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C18C5D] hover:bg-[#A87448] active:scale-95 text-white text-xs font-bold shrink-0 shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
        </div>
      ) : variant === 'header' ? (
        <button
          type="button"
          onClick={handleClick}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer ${className}`}
          title="Install App on your Home Screen"
        >
          <Download className="w-3.5 h-3.5 text-[#D4A373]" />
          <span>{label || "Install App"}</span>
        </button>
      ) : variant === 'pill' ? (
        <button
          type="button"
          onClick={handleClick}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4A5D4E]/10 hover:bg-[#4A5D4E]/20 text-[#4A5D4E] dark:text-emerald-400 text-xs font-semibold transition-all cursor-pointer border border-[#4A5D4E]/20 ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 text-[#C18C5D]" />
          <span>{label || "Add to Home Screen"}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className={`flex items-center gap-2 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all active:scale-95 cursor-pointer ${className}`}
        >
          <Download className="w-4 h-4 shrink-0 text-[#D4A373]" />
          <span>{label || "Install App"}</span>
        </button>
      )}

      {/* Guide Modal for iOS Safari, Chrome iOS, Android, and other mobile browsers */}
      {showGuide && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowGuide(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-[#EAE7E0] dark:border-slate-800 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#4A5D4E] text-white flex items-center justify-center shadow-sm">
                  <Smartphone className="w-6 h-6 text-[#D4A373]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#2D362E] dark:text-slate-100">
                    Install Homebuyer Portal
                  </h3>
                  <p className="text-xs text-[#606C5D] dark:text-slate-400">
                    Add to your phone's home screen
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="w-8 h-8 rounded-full bg-[#F1EFE9] dark:bg-slate-800 flex items-center justify-center text-[#606C5D] hover:text-[#2D362E] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#606C5D] dark:text-slate-300 leading-relaxed">
              Experience the First-Time Homebuyer Portal as a native mobile app with instant offline access and quick mortgage calculations.
            </p>

            {/* Platform-specific instructions */}
            {isIOS ? (
              <div className="bg-[#FAF9F5] dark:bg-slate-800/60 rounded-2xl p-4 space-y-3.5 border border-[#EAE7E0] dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#C18C5D]">
                    iPhone Instructions
                  </div>
                  <span className="text-[10px] bg-[#C18C5D]/15 text-[#C18C5D] px-2 py-0.5 rounded-full font-bold">
                    Top-Right Share Button
                  </span>
                </div>

                {/* Visual address bar hint matching Safari top bar */}
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-[#EAE7E0] dark:border-slate-700 text-xs shadow-2xs">
                  <div className="flex items-center gap-1.5 text-[#606C5D] dark:text-slate-300 font-mono text-[11px] truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="truncate max-w-[190px]">first-time-homebuyer...</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-[#C18C5D]/15 rounded-lg border border-[#C18C5D]/40 text-[#C18C5D] font-sans font-bold text-[11px] shrink-0">
                    <Share className="w-3.5 h-3.5" />
                    <span>Top Right</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4A5D4E] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </div>
                  <div className="text-xs text-[#2D362E] dark:text-slate-200 pt-0.5 leading-relaxed">
                    Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline mx-1 text-[#4A5D4E] dark:text-[#A9BBAA]" /> in the <strong>top right</strong> of your screen (inside the address bar).
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4A5D4E] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </div>
                  <div className="text-xs text-[#2D362E] dark:text-slate-200 pt-0.5 leading-relaxed">
                    Scroll down the share sheet and tap <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-[#4A5D4E] dark:text-[#A9BBAA]" />.
                  </div>
                </div>

                <div className="text-[11px] text-[#606C5D] dark:text-slate-400 bg-white/70 dark:bg-slate-900/50 p-2.5 rounded-xl border border-[#EAE7E0] dark:border-slate-700/70 leading-relaxed">
                  💡 <strong>iPhone Note:</strong> The <em>"Add to Home Screen"</em> option is only located in the <strong>top-right Share button</strong> menu on iPhone.
                </div>
              </div>
            ) : isAndroid ? (
              <div className="bg-[#FAF9F5] dark:bg-slate-800/60 rounded-2xl p-4 space-y-3.5 border border-[#EAE7E0] dark:border-slate-700">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#C18C5D]">
                  Android Chrome Instructions
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4A5D4E] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </div>
                  <div className="text-xs text-[#2D362E] dark:text-slate-200 pt-0.5">
                    Tap the <strong>three dots (⋮)</strong> <MoreVertical className="w-3.5 h-3.5 inline mx-1 text-[#4A5D4E]" /> in the top right.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4A5D4E] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </div>
                  <div className="text-xs text-[#2D362E] dark:text-slate-200 pt-0.5">
                    Select <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#FAF9F5] dark:bg-slate-800/60 rounded-2xl p-4 space-y-3.5 border border-[#EAE7E0] dark:border-slate-700">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#C18C5D]">
                  Quick Install Steps
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4A5D4E] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </div>
                  <div className="text-xs text-[#2D362E] dark:text-slate-200 pt-0.5">
                    Open your browser's menu (Share or three dots ⋮).
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4A5D4E] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </div>
                  <div className="text-xs text-[#2D362E] dark:text-slate-200 pt-0.5">
                    Click <strong>Install App</strong> or <strong>Add to Home Screen</strong>.
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
