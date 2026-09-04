const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import { doc,')) {
  code = code.replace(
    'import { onAuthStateChanged, signOut } from "firebase/auth";',
    'import { onAuthStateChanged, signOut } from "firebase/auth";\nimport { doc, onSnapshot } from "firebase/firestore";\nimport { db } from "./firebase";'
  );
}

// Add state for isAppPublic
code = code.replace(
  '  const [userRole, setUserRole] = useState<"admin" | "lo" | null>(null);',
  '  const [userRole, setUserRole] = useState<"admin" | "lo" | null>(null);\n  const [isAppPublic, setIsAppPublic] = useState(false);'
);

// Add the onSnapshot for app settings
const newAuthEffect = `
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
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

    const unsubscribeSettings = onSnapshot(doc(db, "app_settings", "global"), (docSnap) => {
      if (docSnap.exists()) {
        setIsAppPublic(docSnap.data().isPublic === true);
      } else {
        setIsAppPublic(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeSettings();
    };
  }, []);

  const pathname = typeof window !== "undefined" ? window.location.pathname.toLowerCase() : "";
  const hash = typeof window !== "undefined" ? window.location.hash.toLowerCase() : "";
  const search = typeof window !== "undefined" ? window.location.search.toLowerCase() : "";
  
  const isPortalAccess = 
    pathname.includes("/portal") || 
    pathname.includes("/admin") || 
    pathname.includes("/login") ||
    pathname.includes("first-time_homebuyer_portal") ||
    pathname.includes("first-time-homebuyer-portal") ||
    hash.includes("portal") || 
    hash.includes("admin") ||
    search.includes("portal=lo") ||
    search.includes("admin=lo");
`;

code = code.replace(
  /  useEffect\(\(\) => \{\n    const unsubscribe = onAuthStateChanged\(auth, async \(user\) => \{[\s\S]*?\}, \[\]\);/g,
  newAuthEffect
);

code = code.replace(
  '  // DEVELOPMENT LOCK: Require authentication for the entire application\n  if (!userRole) {\n    return <LoginScreen onLogin={(role) => setUserRole(role as "admin" | "lo")} />;\n  }',
  '  // DEVELOPMENT LOCK / PORTAL AUTH: Require authentication for the portal, or the entire application if not public\n  if (!userRole && (!isAppPublic || isPortalAccess)) {\n    return <LoginScreen onLogin={(role) => setUserRole(role as "admin" | "lo")} />;\n  }'
);

fs.writeFileSync('src/App.tsx', code);
