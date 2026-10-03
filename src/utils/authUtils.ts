import { db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getMessaging, getToken } from "firebase/messaging";
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
    console.warn("Whitelist lookup error:", err);
  }

  // 2.b Fallback: Check if user is in configured LO roster or has @cfmtg.com email
  try {
    if (email.endsWith("@cfmtg.com")) {
      return "team_lo";
    }

    const savedGuides =
      typeof window !== "undefined"
        ? localStorage.getItem("homebuyer_roadmap_state_v2") ||
          localStorage.getItem("homebuyer_guides_state")
        : null;
    if (savedGuides) {
      const parsed = JSON.parse(savedGuides);
      const matchedLo = parsed.loanOfficers?.find((lo: any) => lo.email?.toLowerCase() === email);
      if (matchedLo) {
        return (matchedLo.isAdmin || matchedLo.role?.toLowerCase().includes("manager"))
          ? "branch_manager"
          : "team_lo";
      }
    }
  } catch (rosterErr) {
    console.warn("Roster fallback check note:", rosterErr);
  }

  // 2.c Verified Google Sign-In Originator Fallback:
  // Any user who authenticated successfully with verified Google OAuth is granted Originator access
  try {
    setDoc(
      doc(db, "user_roles", user.uid),
      {
        email,
        role: "lo",
        rbacRole: "team_lo",
        lastLogin: serverTimestamp(),
      },
      { merge: true }
    ).catch((err) => console.warn("Auto-provision sync note:", err));
  } catch (syncErr) {
    console.warn("User role sync error:", syncErr);
  }

  return "team_lo";
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
