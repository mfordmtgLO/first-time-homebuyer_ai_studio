const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

const targetEffect = `  useEffect(() => {
    const unsub = subscribeToAllPropertyActionItems(setPropertyActionItems);
    return () => unsub();
  }, []);`;

const replacementEffect = `  useEffect(() => {
    const unsub = subscribeToAllPropertyActionItems(setPropertyActionItems);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);`;

code = code.replace(targetEffect, replacementEffect);

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code);
