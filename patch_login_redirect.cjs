const fs = require('fs');
let code = fs.readFileSync('src/components/LoginScreen.tsx', 'utf8');

if (!code.includes('getRedirectResult')) {
  code = code.replace(
    'import { signInWithPopup, signInWithRedirect, GoogleAuthProvider, signOut } from "firebase/auth";',
    'import { signInWithPopup, signInWithRedirect, GoogleAuthProvider, signOut, getRedirectResult } from "firebase/auth";'
  );
}

if (!code.includes('useEffect(() => {')) {
  const useEffectCode = `
  React.useEffect(() => {
    setIsLoading(true);
    getRedirectResult(auth).then((result) => {
      if (result) {
        checkAndProvisionUser(result.user)
          .then((role) => onLogin(role))
          .catch(async (err) => {
            if (err.message === "NOT_WHITELISTED") {
              setError("Access Denied: Your email has not been whitelisted by the Branch Manager. Please request access.");
              await signOut(auth);
            } else {
              setError("Authentication error. Please contact support.");
            }
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    }).catch((err) => {
      console.error(err);
      setError(\`Redirect login failed: \${err.message}\`);
      setIsLoading(false);
    });
  }, []);
`;
  
  code = code.replace(
    '  const [isLoading, setIsLoading] = useState(false);',
    '  const [isLoading, setIsLoading] = useState(false);\n' + useEffectCode
  );
}

fs.writeFileSync('src/components/LoginScreen.tsx', code);
