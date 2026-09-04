const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Insert the new imports
code = code.replace(
  'import { LeadIntakeChatbot } from "./components/LeadIntakeChatbot";',
  'import { LeadIntakeChatbot } from "./components/LeadIntakeChatbot";\nimport { LoginScreen } from "./components/LoginScreen";\nimport { BranchManagement } from "./components/BranchManagement";\nimport { auth } from "./firebase";\nimport { onAuthStateChanged, signOut } from "firebase/auth";\nimport { checkAndProvisionUser } from "./utils/authUtils";'
);

// Add auth state
const statePattern = 'const [leadBotSourceContext, setLeadBotSourceContext] = useState<{ source?: string, intent?: "chat_listings" | "blueprint_download" | "buying_power" } | undefined>(undefined);';
code = code.replace(
  statePattern,
  statePattern + '\n\n  // Authentication State\n  const [isAuthChecking, setIsAuthChecking] = useState(true);\n  const [userRole, setUserRole] = useState<"admin" | "lo" | null>(null);'
);

// Add useEffect for Auth
const effectPattern = '  const isMobile = useIsMobile();';
code = code.replace(
  effectPattern,
  `  const isMobile = useIsMobile();\n\n  // Listen for Auth State Changes\n  useEffect(() => {\n    const unsubscribe = onAuthStateChanged(auth, async (user) => {\n      if (user) {\n        try {\n          const role = await checkAndProvisionUser(user);\n          setUserRole(role as "admin" | "lo");\n        } catch (e: any) {\n          if (e.message === "NOT_WHITELISTED") {\n            alert("Access Denied: Your email has not been whitelisted by the Branch Manager.");\n            await signOut(auth);\n          }\n          setUserRole(null);\n        }\n      } else {\n        setUserRole(null);\n      }\n      setIsAuthChecking(false);\n    });\n    return () => unsubscribe();\n  }, []);\n`
);

// Handle early return for unauthenticated users
const returnPattern = '  return (\n    <div className={`min-h-screen';
code = code.replace(
  returnPattern,
  `  if (isAuthChecking) {\n    return <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center font-bold text-[#606C5D]">Verifying Secure Enterprise Access...</div>;\n  }\n\n  if (!userRole) {\n    return <LoginScreen onLogin={(role) => setUserRole(role as "admin" | "lo")} />;\n  }\n\n  return (\n    <div className={\`min-h-screen`
);

fs.writeFileSync('src/App.tsx', code);
