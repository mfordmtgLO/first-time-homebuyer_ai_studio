import React from 'react';
import { Home, Compass, Sparkles, Search, LayoutDashboard } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  onNavigate: (tab: string, mode?: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, onNavigate }) => {
  return (
    <div className="lg:hidden flex-none w-full bg-white border-t border-[#EAE7E0] z-50 px-2 py-2 flex items-center justify-around shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
      <button 
        onClick={() => onNavigate('hero', 'website')}
        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${activeTab === 'hero' ? 'text-[#4A5D4E]' : 'text-[#9A9488] hover:text-[#606C5D]'}`}
      >
        <Home className="w-5 h-5 mb-1" />
        <span className="text-[10px] font-bold">Home</span>
      </button>
      <button 
        onClick={() => onNavigate('calculator', 'website')}
        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${activeTab === 'calculator' ? 'text-[#4A5D4E]' : 'text-[#9A9488] hover:text-[#606C5D]'}`}
      >
        <Compass className="w-5 h-5 mb-1" />
        <span className="text-[10px] font-bold">Plan</span>
      </button>
      <button 
        onClick={() => onNavigate('dashboard', 'dashboard')}
        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${activeTab === 'dashboard' ? 'text-[#4A5D4E]' : 'text-[#9A9488] hover:text-[#606C5D]'}`}
      >
        <LayoutDashboard className="w-5 h-5 mb-1" />
        <span className="text-[10px] font-bold">Portal</span>
      </button>
      <button 
        onClick={() => onNavigate('properties', 'dashboard')}
        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${activeTab === 'properties' ? 'text-[#4A5D4E]' : 'text-[#9A9488] hover:text-[#606C5D]'}`}
      >
        <Search className="w-5 h-5 mb-1" />
        <span className="text-[10px] font-bold">Homes</span>
      </button>
      <button 
        onClick={() => onNavigate('step4_ai_plan', 'dashboard')}
        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${activeTab === 'step4_ai_plan' ? 'text-[#4A5D4E]' : 'text-[#9A9488] hover:text-[#606C5D]'}`}
      >
        <Sparkles className="w-5 h-5 mb-1 text-[#C18C5D]" />
        <span className="text-[10px] font-bold">AI Plan</span>
      </button>
    </div>
  );
};
