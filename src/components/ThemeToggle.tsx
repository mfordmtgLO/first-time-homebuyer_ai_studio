import React from "react";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "./ThemeProvider";

interface ThemeToggleProps {
  id?: string;
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({
  id = "navbar-theme-toggle-btn",
  className = "",
  showLabel = false,
}: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      id={id}
      type="button"
      onClick={toggleTheme}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
      className={`group relative flex items-center justify-center p-2 rounded-xl border border-[#EAE7E0] dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 hover:bg-[#FAF6EE] dark:hover:bg-slate-800 shadow-2xs hover:shadow-xs transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C18C5D] dark:focus-visible:ring-amber-400 select-none ${className}`}
      aria-label={isDark ? "Switch to natural light mode" : "Switch to high-contrast dark mode"}
      title={isDark ? "Switch to natural light mode (Day)" : "Switch to late-night planning mode (Dark)"}
    >
      {/* Subtle ambient glow on hover */}
      <span
        className={`absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none opacity-0 group-hover:opacity-100 ${
          isDark
            ? "bg-indigo-500/10"
            : "bg-amber-500/10"
        }`}
      />

      {/* Animated Icon Container with Smooth Rotation & Fade */}
      <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="dark-moon"
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{
                duration: 0.28,
                ease: [0.23, 1, 0.32, 1],
              }}
              className="flex items-center justify-center text-amber-300 dark:text-amber-300"
            >
              <Moon className="w-4.5 h-4.5 stroke-[2.2] drop-shadow-[0_0_6px_rgba(252,211,77,0.35)]" />
            </motion.div>
          ) : (
            <motion.div
              key="light-sun"
              initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
              transition={{
                duration: 0.28,
                ease: [0.23, 1, 0.32, 1],
              }}
              className="flex items-center justify-center text-[#C18C5D] group-hover:text-amber-600"
            >
              <Sun className="w-4.5 h-4.5 stroke-[2.2] drop-shadow-[0_0_6px_rgba(193,140,93,0.3)]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showLabel && (
        <span className="ml-2 text-xs font-semibold text-[#606C5D] dark:text-slate-300">
          {isDark ? "Dark Mode" : "Light Mode"}
        </span>
      )}

      <span className="sr-only">
        {isDark ? "Switch to natural light mode" : "Switch to late-night planning mode"}
      </span>
    </motion.button>
  );
}
