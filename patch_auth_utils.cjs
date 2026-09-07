const fs = require('fs');
let c = fs.readFileSync('src/utils/authUtils.ts', 'utf8');

c = c.replace(
  'const ADMIN_EMAIL = "fordmj@gmail.com";',
  'const ADMIN_EMAIL = "fordmj@gmail.com";\nconst COMPLIANCE_EMAIL = "auditor@yourcompany.com";'
);

const checkLogic = `  if (email === ADMIN_EMAIL.toLowerCase()) {
    await setDoc(doc(db, "user_roles", user.uid), {
      email,
      role: "admin",
      rbacRole: "branch_manager",
      lastLogin: serverTimestamp()
    }, { merge: true });
    return "branch_manager";
  }

  // 1.b Is this a compliance auditor?
  if (email === COMPLIANCE_EMAIL.toLowerCase()) {
    await setDoc(doc(db, "user_roles", user.uid), {
      email,
      role: "admin",
      rbacRole: "compliance_auditor",
      lastLogin: serverTimestamp()
    }, { merge: true });
    return "compliance_auditor" as RbacRole;
  }`;

c = c.replace(
  `  if (email === ADMIN_EMAIL.toLowerCase()) {
    await setDoc(doc(db, "user_roles", user.uid), {
      email,
      role: "admin",
      rbacRole: "branch_manager",
      lastLogin: serverTimestamp()
    }, { merge: true });
    return "branch_manager";
  }`,
  checkLogic
);

fs.writeFileSync('src/utils/authUtils.ts', c);
