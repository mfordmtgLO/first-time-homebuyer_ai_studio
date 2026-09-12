const fs = require('fs');
const path = 'src/components/LoanOfficerLoginView.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);`;

const replacement = `      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      
      // Add fallback for cross-origin isolation environments
      let result;
      try {
        result = await signInWithPopup(auth, provider);
      } catch (err: any) {
        if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cross-origin-cookies-disabled') {
           console.warn("Popup blocked or closed, falling back to redirect...");
           const { signInWithRedirect } = await import("firebase/auth");
           await signInWithRedirect(auth, provider);
           return; // Redirect will navigate away
        }
        throw err;
      }`;

if (content.includes(target)) {
  fs.writeFileSync(path, content.replace(target, replacement));
  console.log("Success");
} else {
  console.log("Failed to find target");
}
