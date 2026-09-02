const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `      {/* 24/7 AI Lead Intake & Prequal Chatbot */}`;
const replacementStr = `      {/* Return to LO Dashboard Floating Button */}
      {!showLoPortal && typeof window !== "undefined" && localStorage.getItem("lo_portal_auth_id") && (
        <button
          onClick={() => {
            setShowLoPortal(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="fixed bottom-24 right-6 md:bottom-6 md:left-6 z-50 bg-[#2D362E] hover:bg-[#1E241F] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 font-bold text-sm transition-all animate-in slide-in-from-bottom-5 border border-white/20 hover:scale-105 active:scale-95"
        >
          <span className="bg-[#4A5D4E] w-6 h-6 rounded-full flex items-center justify-center text-[10px]">👑</span>
          <span>Return to LO Dashboard</span>
        </button>
      )}

      {/* 24/7 AI Lead Intake & Prequal Chatbot */}`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Added Return to Dashboard button");
} else {
  console.log("Could not find insertion point.");
}
