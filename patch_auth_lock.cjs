const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add the useEffect for onAuthStateChanged
const authEffect = `
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const role = await checkAndProvisionUser(user);
          setUserRole(role as "admin" | "lo");
        } catch (e) {
          console.error(e);
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#F9F8F4] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <ShieldCheck className="w-12 h-12 text-[#4A5D4E] mb-4 opacity-50" />
          <p className="text-[#606C5D] font-mono text-xs uppercase tracking-widest">Verifying access...</p>
        </div>
      </div>
    );
  }

  // DEVELOPMENT LOCK: Require authentication for the entire application
  if (!userRole) {
    return <LoginScreen onLogin={(role) => setUserRole(role as "admin" | "lo")} />;
  }
`;

code = code.replace(
  '  const [userRole, setUserRole] = useState<"admin" | "lo" | null>(null);\n\n  // Global State',
  '  const [userRole, setUserRole] = useState<"admin" | "lo" | null>(null);\n\n' + authEffect + '\n\n  // Global State'
);

fs.writeFileSync('src/App.tsx', code);
