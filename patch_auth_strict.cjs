const fs = require('fs');
const path = 'src/components/LoanOfficerLoginView.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /const handleGoogleSignIn = async \(\) => \{[\s\S]*?return \(\n    <div/m;
const match = content.match(regex);
if (match) {
  const replacement = `const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("LO Login: Starting Google Auth Redirect...");
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      
      const { signInWithRedirect } = await import("firebase/auth");
      await signInWithRedirect(auth, provider);
      // It will navigate away now.
    } catch (err: any) {
      console.error("Google Auth error:", err);
      setError("Google Sign-In failed to initialize. Please check your network or try a different browser.");
      setIsLoading(false);
    }
  };

  return (
    <div`;
  fs.writeFileSync(path, content.replace(match[0], replacement));
  console.log("Success replacing handleGoogleSignIn");
} else {
  console.log("Failed to find handleGoogleSignIn");
}
