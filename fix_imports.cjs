const fs = require('fs');
let content = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');
if (!content.includes('Star,')) {
  content = content.replace(
    /import \{([^}]+)\} from "lucide-react";/,
    (match, p1) => {
      return `import {${p1}, Star } from "lucide-react";`;
    }
  );
  fs.writeFileSync('src/components/LoanOfficerPortal.tsx', content);
  console.log("Star added to imports");
}
