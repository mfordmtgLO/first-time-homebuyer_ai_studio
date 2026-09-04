const fs = require('fs');
let code = fs.readFileSync('src/components/TotalExpertSettingsModal.tsx', 'utf8');

code = code.replace(
  /useEffect\(\(\) => \{\n\s*if \(isOpen\) \{\n\s*loadVaultState\(\);\n\s*\}\n\s*\}, \[isOpen\]\);\n\n\s*const loadVaultState = async \(\) => \{/,
  `const loadVaultState = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const docSnap = await getDoc(doc(db, "user_integrations", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.totalExpertVault) {
            setHasEncryptedVault(true);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load Total Expert vault state:", e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadVaultState();
    }
  }, [isOpen]);

  const _loadVaultState_removed = async () => {`
);

code = code.replace(
  /const _loadVaultState_removed = async \(\) => \{\n[\s\S]*?console\.error\("Failed to load Total Expert vault state:", e\);\n\s*\}\n\s*\};/,
  ''
);

fs.writeFileSync('src/components/TotalExpertSettingsModal.tsx', code);
