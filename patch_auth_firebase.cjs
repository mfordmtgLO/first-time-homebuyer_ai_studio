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

console.log("Checking if profile state exists in App.tsx...");
