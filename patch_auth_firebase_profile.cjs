const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetProfileState = `  const [profile, setProfile] = useState<FinancialProfile>(() => {
    try {
      const savedProfile = localStorage.getItem("homebuyer_user_profile");
      if (savedProfile) {
        return JSON.parse(savedProfile);
      }
    } catch (e) {
      console.warn("Error parsing user profile:", e);
    }
    return INITIAL_PROFILE;
  });`;

const replacementProfileState = `  const [profile, setProfile] = useState<FinancialProfile>(INITIAL_PROFILE);`;

code = code.replace(targetProfileState, replacementProfileState);

const targetPropertiesState = `  const [properties, setProperties] = useState<PropertyListing[]>(() => {
    try {
      const savedProperties = localStorage.getItem("homebuyer_user_properties");
      if (savedProperties) {
        return JSON.parse(savedProperties);
      }
    } catch (e) {
      console.warn("Error parsing user properties:", e);
    }
    return INITIAL_PROPERTIES;
  });`;

const replacementPropertiesState = `  const [properties, setProperties] = useState<PropertyListing[]>(INITIAL_PROPERTIES);`;

code = code.replace(targetPropertiesState, replacementPropertiesState);

const targetEffectLocalStorage = `  useEffect(() => {
    try {
      localStorage.setItem("homebuyer_user_properties", JSON.stringify(properties));
    } catch (e) {
      console.warn("Error saving user properties to localStorage:", e);
    }
  }, [properties]);

  useEffect(() => {
    try {
      localStorage.setItem("homebuyer_user_profile", JSON.stringify(profile));
    } catch (e) {
      console.warn("Error saving user profile to localStorage:", e);
    }
  }, [profile]);`;

const replacementEffectLocalStorage = `  // User state sync to Firebase for persistence across devices
  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const saveState = async () => {
      try {
        await setDoc(doc(db, "consumer_users", uid), {
          profile,
          properties,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.error("Error persisting consumer state:", err);
      }
    };
    saveState();
  }, [profile, properties]);`;

code = code.replace(targetEffectLocalStorage, replacementEffectLocalStorage);

const targetAuthCheck = `    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const role = await checkAndProvisionUser(user);
          setUserRole(role);
        } catch (e) {
          console.error("Auth provisioning error:", e);
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
      setIsAuthChecking(false);
    });`;

const replacementAuthCheck = `    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const role = await checkAndProvisionUser(user);
          setUserRole(role);

          // Attempt to load consumer state if they are a consumer (role null)
          if (role === null) {
            const userDoc = await getDoc(doc(db, "consumer_users", user.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              if (data.profile) setProfile(data.profile);
              if (data.properties) setProperties(data.properties);
            }
          }
        } catch (e) {
          console.error("Auth provisioning error:", e);
          setUserRole(null);
        }
      } else {
        setUserRole(null);
        // Reset to initial on logout
        setProfile(INITIAL_PROFILE);
        setProperties(INITIAL_PROPERTIES);
      }
      setIsAuthChecking(false);
    });`;
    
code = code.replace(targetAuthCheck, replacementAuthCheck);

fs.writeFileSync('src/App.tsx', code);
