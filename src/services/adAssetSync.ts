import { collection, query, orderBy, onSnapshot, doc, getFirestore } from "firebase/firestore";
import { db } from "../firebase";

export interface SyncedAdAsset {
  id: string;
  title: string;
  adCopy: string;
  videoUrl: string;
  platformTarget: string;
  campaignGoal: string;
  status: string;
  propertyId?: string;
  timestamp: any;
  source: string;
}

export function subscribeToIncomingAds(loId: string, callback: (ads: SyncedAdAsset[]) => void) {
  if (!loId) return () => {};
  
  const adsRef = collection(doc(db, "users", loId), "synced_ai_ads");
  const q = query(adsRef, orderBy("timestamp", "desc"));
  
  return onSnapshot(q, (snapshot) => {
    const ads = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as SyncedAdAsset[];
    
    callback(ads);
  }, (error) => {
    console.warn("Error syncing ads:", error);
  });
}
