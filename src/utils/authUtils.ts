import { db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { normalizeRole, RbacRole } from "./rbac";

const ADMIN_EMAILS = ["fordmj@gmail.com", "mford@cfmtg.com"];
const COMPLIANCE_EMAIL = "auditor@yourcompany.com";

const withTimeout = <T>(ms: number, promise: Promise<T>, label: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`TIMEOUT: ${label} took longer than ${ms}ms. This is usually caused by blocked WebSockets or network issues.`));
    }, ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((reason) => {
        clearTimeout(timer);
        reject(reason);
      });
  });
};

export async function checkAndProvisionUser(user: any): Promise<RbacRole | "admin"> {
  if (!user.email) throw new Error("No email found on user.");
  
  const email = user.email.toLowerCase();
  
  // 1. Is this the master admin / branch manager?
  if (ADMIN_EMAILS.map(e => e.toLowerCase()).includes(email)) {
    // Non-blocking fire-and-forget sync to Firestore so auth is instant
    setDoc(doc(db, "user_roles", user.uid), {
      email,
      role: "admin",
      rbacRole: "branch_manager",
      lastLogin: serverTimestamp()
    }, { merge: true }).catch(err => console.warn("Admin Firestore sync note:", err));
    return "branch_manager";
  }

  // 1.b Is this a compliance auditor?
  if (email === COMPLIANCE_EMAIL.toLowerCase()) {
    setDoc(doc(db, "user_roles", user.uid), {
      email,
      role: "admin",
      rbacRole: "compliance_auditor",
      lastLogin: serverTimestamp()
    }, { merge: true }).catch(err => console.warn("Auditor Firestore sync note:", err));
    return "compliance_auditor" as RbacRole;
  }

  // 2. Are they in the whitelist?
  const whitelistRef = doc(db, "whitelisted_emails", email);
  const whitelistSnap = await withTimeout(5000, getDoc(whitelistRef), "Whitelist Check");
  
  if (!whitelistSnap.exists()) {
    throw new Error("NOT_WHITELISTED");
  }

  const whitelistData = whitelistSnap.data();
  const assignedRole = normalizeRole(whitelistData.role || "team_lo");

  // 3. Provision User with Granular RBAC Role
  await withTimeout(5000, setDoc(doc(db, "user_roles", user.uid), {
    email,
    role: assignedRole === "branch_manager" ? "admin" : "lo",
    rbacRole: assignedRole,
    assignedLoId: whitelistData.assignedLoId || null,
    customPermissions: whitelistData.customPermissions || null,
    lastLogin: serverTimestamp()
  }, { merge: true }), "User Provisioning");
  
  return assignedRole;
}
