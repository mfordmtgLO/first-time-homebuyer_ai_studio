const fs = require('fs');
let code = fs.readFileSync('src/components/BranchManagement.tsx', 'utf8');

if (!code.includes('MfaSetupModal')) {
  // Add import
  code = code.replace(
    'import { Building, UserPlus, Mail, ShieldCheck, Trash2, ShieldAlert, Globe, Lock } from "lucide-react";',
    'import { Building, UserPlus, Mail, ShieldCheck, Trash2, ShieldAlert, Globe, Lock, Fingerprint } from "lucide-react";\nimport { MfaSetupModal } from "./MfaSetupModal";'
  );

  // Add state
  code = code.replace(
    'const [isTogglingPublic, setIsTogglingPublic] = useState(false);',
    'const [isTogglingPublic, setIsTogglingPublic] = useState(false);\n  const [showMfaModal, setShowMfaModal] = useState(false);'
  );

  // Add MFA UI under website visibility
  const mfaUI = `
      <div className="bg-white rounded-2xl border border-[#EAE7E0] p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Fingerprint className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2D362E] mb-1">2-Factor Authentication (2FA)</h3>
              <p className="text-sm text-[#606C5D]">
                Require a second factor (Text Message or Authenticator App) when logging into your admin account.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowMfaModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" /> Setup 2FA
          </button>
        </div>
      </div>
      
      {showMfaModal && <MfaSetupModal onClose={() => setShowMfaModal(false)} />}
`;

  code = code.replace(
    '{/* Add New User */}',
    mfaUI + '\n      {/* Add New User */}'
  );
  
  fs.writeFileSync('src/components/BranchManagement.tsx', code);
}
