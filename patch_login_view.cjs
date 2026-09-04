const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerLoginView.tsx', 'utf8');

code = code.replace(
  '    if (password !== expectedPassword) {\n      setErrorMessage("Incorrect password. If you forgot your password, ask Branch Manager (Mike Ford) to authorize a password reset.");\n      return;\n    }\n\n    // Success: authenticate\n    onAuthenticate(matchedLo.id);\n  };',
  `    if (password !== expectedPassword) {
      setErrorMessage("Incorrect password. If you forgot your password, ask Branch Manager (Mike Ford) to authorize a password reset.");
      return;
    }
    
    if (matchedLo.accountRestricted) {
      setErrorMessage("Account temporarily restricted. Please contact your Branch Manager (Mike Ford) to unlock.");
      return;
    }

    // Success: authenticate
    onAuthenticate(matchedLo.id);
  };`
);

code = code.replace(
  '  const handleOneClickLogin = (lo: LoanOfficerProfile) => {\n    onAuthenticate(lo.id);\n  };',
  `  const handleOneClickLogin = (lo: LoanOfficerProfile) => {
    if (lo.accountRestricted) {
      setErrorMessage("Account temporarily restricted. Please contact your Branch Manager (Mike Ford) to unlock.");
      setActiveTab("signin");
      return;
    }
    onAuthenticate(lo.id);
  };`
);

fs.writeFileSync('src/components/LoanOfficerLoginView.tsx', code);
