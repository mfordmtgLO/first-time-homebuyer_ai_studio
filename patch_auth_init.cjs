const fs = require('fs');
const path = 'src/components/LoanOfficerLoginView.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `  useEffect(() => {
    // Check if user is already logged in
    const unsubscribe = auth.onAuthStateChanged((user) => {`;

const replacement = `  useEffect(() => {
    // Handle redirect result if falling back from popup
    import("firebase/auth").then(({ getRedirectResult }) => {
      getRedirectResult(auth).then((result) => {
        if (result && result.user) {
          const email = result.user.email?.toLowerCase();
          console.log("LO Login: Redirect Auth successful", email);
          
          let targetLoId = guidesState.adminLoanOfficerId || "lo-mike-ford";
          if (email) {
            const matchedLo = Object.values(guidesState.roster).find(lo => lo.email.toLowerCase() === email);
            if (matchedLo) targetLoId = matchedLo.id;
          }
          
          checkAndProvisionUser(result.user, targetLoId).then(() => {
            onLoginSuccess(targetLoId, result.user.uid);
          }).catch(err => {
            console.error("Provisioning error after redirect:", err);
            setError("Failed to initialize account data.");
          });
        }
      }).catch((error) => {
        console.error("Redirect auth error:", error);
      });
    });

    // Check if user is already logged in
    const unsubscribe = auth.onAuthStateChanged((user) => {`;

if (content.includes(target)) {
  fs.writeFileSync(path, content.replace(target, replacement));
  console.log("Success");
} else {
  console.log("Failed to find target");
}
