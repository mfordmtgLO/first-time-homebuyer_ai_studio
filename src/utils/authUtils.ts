import { db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getMessaging, getToken } from "firebase/messaging";
import { normalizeRole, RbacRole, isMasterAdminEmail, MASTER_ADMIN_EMAILS } from "./rbac";

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

export async function checkAndProvisionUser(user: any): Promise<RbacRole | "admin" | "pending"> {
  if (!user.email) throw new Error("No email found on user.");
  
  const email = user.email.toLowerCase();
  
  // 1. Break-glass bypass: Is this the master admin / branch manager?
  if (isMasterAdminEmail(email)) {
    // Non-blocking fire-and-forget sync to Firestore so auth is instant
    setDoc(doc(db, "user_roles", user.uid), {
      email,
      role: "admin",
      rbacRole: "branch_manager",
      assignedLoId: "lo-mike-ford",
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

  // 2. Are they in the whitelist? Whitelisted_emails is the ONLY admission authority.
  try {
    const whitelistRef = doc(db, "whitelisted_emails", email);
    const whitelistSnap = await withTimeout(4000, getDoc(whitelistRef), "Whitelist Check");
    
    if (whitelistSnap.exists()) {
      const whitelistData = whitelistSnap.data();
      if (whitelistData.isLockedOut === true) {
        throw new Error("LOCKED_OUT");
      }
      const assignedRole = normalizeRole(whitelistData.role || "team_lo");

      // 3. Provision User with Granular RBAC Role (non-blocking update)
      setDoc(doc(db, "user_roles", user.uid), {
        email,
        role: assignedRole === "branch_manager" ? "admin" : "lo",
        rbacRole: assignedRole,
        assignedLoId: whitelistData.assignedLoId || null,
        customPermissions: whitelistData.customPermissions || null,
        lastLogin: serverTimestamp()
      }, { merge: true }).catch(err => console.warn("User role sync note:", err));
      
      return assignedRole;
    }
  } catch (err: any) {
    if (err?.message === "LOCKED_OUT") {
      throw err;
    }
    console.warn("Whitelist lookup error:", err);
  }

  // 3. Whitelist MISS: Fail-closed zero-trust admission.
  // Provision NOTHING with access — no user_roles write carrying any rbacRole.
  // Return "pending" so the UI renders the pending approval screen with zero data views.
  return "pending";
}

/**
 * Retrieves the cryptographic FCM Web Push token and persists it in the lead's sharded Firestore document
 */
export async function registerFCMToken(leadId: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const messaging = getMessaging();
      const token = await getToken(messaging, {
        vapidKey: "BF_Your_Vapid_Public_Key_Here_Change_This"
      });
      if (token) {
        console.log("FCM Device Token retrieved and sharded:", token);
        await setDoc(doc(db, "leads", leadId), { fcmToken: token }, { merge: true });
        return token;
      }
    }
  } catch (err) {
    console.warn("registerFCMToken helper error:", err);
  }
  return null;
}
