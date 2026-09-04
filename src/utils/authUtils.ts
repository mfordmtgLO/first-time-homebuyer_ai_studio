import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const ADMIN_EMAIL = "fordmj@gmail.com";

export async function checkAndProvisionUser(user: any) {
  if (!user.email) throw new Error("No email found on user.");
  
  const email = user.email.toLowerCase();
  
  // 1. Is this the master admin?
  if (email === ADMIN_EMAIL.toLowerCase()) {
    await setDoc(doc(db, "user_roles", user.uid), {
      email,
      role: "admin",
      lastLogin: serverTimestamp()
    }, { merge: true });
    return "admin";
  }

  // 2. Are they in the whitelist?
  const whitelistRef = doc(db, "whitelisted_emails", email);
  const whitelistSnap = await getDoc(whitelistRef);
  
  if (!whitelistSnap.exists()) {
    throw new Error("NOT_WHITELISTED");
  }

  // 3. Authorized LO
  await setDoc(doc(db, "user_roles", user.uid), {
    email,
    role: "lo",
    lastLogin: serverTimestamp()
  }, { merge: true });
  
  return "lo";
}
