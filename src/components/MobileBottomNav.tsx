import React from 'react';
import { Home, Compass, Sparkles, Search, Calculator } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface MobileBottomNavProps {
  activeTab: string;
  onNavigate: (tab: string, mode?: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, onNavigate }) => {
  return (
    <div className="lg:hidden flex-none w-full bg-white dark:bg-slate-950 border-t border-[#EAE7E0] dark:border-slate-800 z-50 px-2 py-2 flex items-center justify-around shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)] transition-colors">
      <button 
        onClick={() => onNavigate('hero', 'website')}
        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-100 active:scale-90 select-none touch-manipulation cursor-pointer ${activeTab === 'hero' ? 'text-[#4A5D4E] dark:text-emerald-400' : 'text-[#9A9488] hover:text-[#606C5D] dark:text-slate-400'}`}
      >
        <Home className="w-5 h-5 mb-1" />
        <span className="text-[10px] font-bold">Home</span>
      </button>
      <button 
        onClick={() => onNavigate('calculator', 'website')}
        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-100 active:scale-90 select-none touch-manipulation cursor-pointer ${activeTab === 'calculator' ? 'text-[#4A5D4E] dark:text-emerald-400' : 'text-[#9A9488] hover:text-[#606C5D] dark:text-slate-400'}`}
      >
        <Calculator className="w-5 h-5 mb-1" />
        <span className="text-[10px] font-bold">Calculate</span>
      </button>
      <button 
        onClick={() => onNavigate('roadmap', 'website')}
        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-100 active:scale-90 select-none touch-manipulation cursor-pointer ${activeTab === 'roadmap' ? 'text-[#4A5D4E] dark:text-emerald-400' : 'text-[#9A9488] hover:text-[#606C5D] dark:text-slate-400'}`}
      >
        <Compass className="w-5 h-5 mb-1" />
        <span className="text-[10px] font-bold">Roadmap</span>
      </button>
      <button 
        onClick={() => onNavigate('properties', 'dashboard')}
        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-100 active:scale-90 select-none touch-manipulation cursor-pointer ${activeTab === 'properties' ? 'text-[#4A5D4E] dark:text-emerald-400' : 'text-[#9A9488] hover:text-[#606C5D] dark:text-slate-400'}`}
      >
        <Search className="w-5 h-5 mb-1" />
        <span className="text-[10px] font-bold">Homes</span>
      </button>
      <button 
        onClick={() => onNavigate('step4_ai_plan', 'dashboard')}
        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-100 active:scale-90 select-none touch-manipulation cursor-pointer ${activeTab === 'step4_ai_plan' ? 'text-[#4A5D4E] dark:text-emerald-400' : 'text-[#9A9488] hover:text-[#606C5D] dark:text-slate-400'}`}
      >
        <Sparkles className="w-5 h-5 mb-1 text-[#C18C5D]" />
        <span className="text-[10px] font-bold">AI Plan</span>
      </button>
      <div className="hidden"><PWAInstallButton /></div>
    </div>
  );
};
