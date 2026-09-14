const fs = require('fs');
let code = fs.readFileSync('src/components/BranchManagement.tsx', 'utf8');

const lockFunction = `
  const handleToggleLock = async (email: string, currentLockState: boolean) => {
    try {
      await updateDoc(doc(db, "whitelisted_emails", email), {
        isLockedOut: !currentLockState
      });
      setUsers(prev => prev.map(u => u.email === email ? { ...u, isLockedOut: !currentLockState } : u));
      showFeedback(!currentLockState ? \`Locked out \${email}\` : \`Restored access for \${email}\`);
    } catch (err) {
      console.warn("Error toggling lock state:", err);
    }
  };
`;

code = code.replace(
  'const handleRemoveUser = async (email: string) => {',
  lockFunction + '\\n  const handleRemoveUser = async (email: string) => {'
);

const buttonHTML = `
                    <button
                      onClick={() => handleToggleLock(user.email, !!user.isLockedOut)}
                      className={\`p-1.5 rounded-lg transition-colors \${user.isLockedOut ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-[#606C5D] hover:text-red-600 hover:bg-red-50'}\`}
                      title={user.isLockedOut ? "Restore Access" : "Trigger Kill Switch (Lock Out)"}
                    >
                      <Lock className="w-4 h-4" />
                    </button>
`;

code = code.replace(
  '                      title="Revoke Branch Access"',
  '                      title="Revoke Branch Access"'
);

code = code.replace(
  '<button\\n                      onClick={() => handleRemoveUser(user.email)}\\n                      className="p-1.5 text-[#9A9488] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"\\n                      title="Revoke Branch Access"\\n                    >\\n                      <Trash2 className="w-4 h-4" />\\n                    </button>',
  buttonHTML + '\\n                    <button\\n                      onClick={() => handleRemoveUser(user.email)}\\n                      className="p-1.5 text-[#9A9488] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"\\n                      title="Revoke Branch Access"\\n                    >\\n                      <Trash2 className="w-4 h-4" />\\n                    </button>'
);

fs.writeFileSync('src/components/BranchManagement.tsx', code, 'utf8');
console.log("Updated BranchManagement with Lock button");
