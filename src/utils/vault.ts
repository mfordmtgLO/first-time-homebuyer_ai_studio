import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export async function fetchIntegrationsVault() {
  if (!auth.currentUser) return {};
  try {
    const docRef = doc(db, "integrations_vault", auth.currentUser.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().encryptedVault) {
      // In a real production app, the backend would decrypt this on the fly.
      // For this frontend state recovery, we just return the raw cipher text
      // to the components so they know a vault exists, OR they can ask the backend
      // to decrypt it. Actually, wait. The frontend can't decrypt it.
      // So the frontend should only know IF it exists.
      return { hasVault: true, encryptedVault: docSnap.data().encryptedVault };
    }
  } catch (e) {
    console.error("Failed to fetch integrations vault", e);
  }
  return { hasVault: false };
}

export async function saveToIntegrationsVault(payload: any, existingEncryptedVault?: string) {
  if (!auth.currentUser) throw new Error("Must be logged in to save vault.");
  
  const token = await auth.currentUser.getIdToken();
  const encryptRes = await fetch("/api/integrations/vault/encrypt", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ payload })
  });
  
  if (!encryptRes.ok) throw new Error("Failed to encrypt credentials on server.");
  const encryptData = await encryptRes.json();
  const newEncryptedVault = encryptData.encryptedVault;

  // Save encrypted string to Firebase
  await setDoc(doc(db, "integrations_vault", auth.currentUser.uid), {
    encryptedVault: newEncryptedVault,
    ownerId: auth.currentUser.uid,
    updatedAt: serverTimestamp()
  });

  return newEncryptedVault;
}
