const fs = require('fs');
let code = fs.readFileSync('src/components/BranchManagement.tsx', 'utf8');

const websiteVisibilityUI = `
      <div className="bg-white rounded-2xl border border-[#EAE7E0] p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className={\`p-3 rounded-xl \${isAppPublic ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}\`}>
              {isAppPublic ? <Globe className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2D362E] mb-1">Website Visibility</h3>
              <p className="text-sm text-[#606C5D]">
                {isAppPublic 
                  ? "Your website is currently fully PUBLIC. Anyone on the internet can view your main consumer site." 
                  : "Your website is currently locked and PRIVATE. Only authorized users can see it."}
              </p>
            </div>
          </div>
          <button
            onClick={handleTogglePublic}
            disabled={isTogglingPublic}
            className={\`px-6 py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 flex items-center gap-2 \${
              isAppPublic 
                ? "bg-white border-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }\`}
          >
            {isTogglingPublic ? "Updating..." : (isAppPublic ? (
              <>
                <Lock className="w-4 h-4" /> Make Private (Lock)
              </>
            ) : (
              <>
                <Globe className="w-4 h-4" /> Make Public (Unlock)
              </>
            ))}
          </button>
        </div>
      </div>
      
      {/* Add New User */}
`;

code = code.replace(
  '{/* Add New User */}',
  websiteVisibilityUI
);

fs.writeFileSync('src/components/BranchManagement.tsx', code);
