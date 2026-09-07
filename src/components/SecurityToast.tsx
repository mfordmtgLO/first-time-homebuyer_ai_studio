import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, CheckCircle2, Lock, X } from 'lucide-react';

interface SecurityToastProps {
  isVisible: boolean;
  onClose: () => void;
  fileName: string;
}

export function SecurityToast({ isVisible, onClose, fileName }: SecurityToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 8000); // Show for 8 seconds
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden w-80 pointer-events-auto flex flex-col relative group">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="bg-emerald-600 px-4 py-3 flex items-center gap-3">
              <div className="bg-white/20 p-1.5 rounded-lg shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">PII Shredding Complete</h4>
                <p className="text-emerald-100 text-[10px] font-medium tracking-wide uppercase">Zero-Trust Protocol Active</p>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-xs text-[#2D362E] leading-relaxed">
                Source document <strong className="font-semibold text-emerald-700">{fileName}</strong> has been fully scrubbed of PII.
              </p>
              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100/50 space-y-2">
                <div className="flex items-center gap-2 text-xs text-emerald-800">
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>Metadata vault securely shredded</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Sanitized knowledge ingested to memory</span>
                </div>
              </div>
            </div>
            {/* Progress bar representing the 8 second timeout */}
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 8, ease: "linear" }}
              className="h-1 bg-emerald-500 absolute bottom-0 left-0"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
