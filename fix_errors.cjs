const fs = require('fs');
let content = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

content = content.replace("setGuidesState(prev => ({", "onUpdateGuidesState({\\n          ...guidesState,");
content = content.replace("...prev,", "");

content = content.replace("setGuidesState(prev => ({", "onUpdateGuidesState({\\n          ...guidesState,");
content = content.replace("...prev,", "");

content = content.replace("setGuidesState(prev => ({", "onUpdateGuidesState({\\n          ...guidesState,");
content = content.replace("...prev,", "");


const target = `          bio: "",
          headshotUrl: "",
          specialties: []
        });`;
const rep = `          bio: "",
          headshotUrl: "",
          specialties: [],
          bookingUrl: "",
          licenseStates: ["OR"]
        } as LoanOfficerProfile);`;
content = content.replace(target, rep);

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', content);
