import { db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { normalizeRole, RbacRole } from "./rbac";

const ADMIN_EMAIL = "fordmj@gmail.com";

export async function checkAndProvisionUser(user: any): Promise<RbacRole | "admin"> {
  if (!user.email) throw new Error("No email found on user.");
  
  const email = user.email.toLowerCase();
  
  // 1. Is this the master admin / branch manager?
  if (email === ADMIN_EMAIL.toLowerCase()) {
    await setDoc(doc(db, "user_roles", user.uid), {
      email,
      role: "admin",
      rbacRole: "branch_manager",
      lastLogin: serverTimestamp()
    }, { merge: true });
    return "branch_manager";
  }

  // 2. Are they in the whitelist?
  const whitelistRef = doc(db, "whitelisted_emails", email);
  const whitelistSnap = await getDoc(whitelistRef);
  
  if (!whitelistSnap.exists()) {
    throw new Error("NOT_WHITELISTED");
  }

  const whitelistData = whitelistSnap.data();
  const assignedRole = normalizeRole(whitelistData.role || "team_lo");

  // 3. Provision User with Granular RBAC Role
  await setDoc(doc(db, "user_roles", user.uid), {
    email,
    role: assignedRole === "branch_manager" ? "admin" : "lo",
    rbacRole: assignedRole,
    assignedLoId: whitelistData.assignedLoId || null,
    customPermissions: whitelistData.customPermissions || null,
    lastLogin: serverTimestamp()
  }, { merge: true });
  
  return assignedRole;
}
