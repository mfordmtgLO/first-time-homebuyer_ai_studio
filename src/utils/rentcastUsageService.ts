import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebase";

const USAGE_DOC_ID = "rentcast_api_usage";
export const RENTCAST_FREE_TIER_LIMIT = 50;

export interface RentCastUsage {
  pulls: number;
  lastResetDate: string; // ISO string
}

export const getRentCastUsage = async (): Promise<RentCastUsage> => {
  try {
    const usageRef = doc(db, "system_metrics", USAGE_DOC_ID);
    const docSnap = await getDoc(usageRef);
    if (docSnap.exists()) {
      return docSnap.data() as RentCastUsage;
    } else {
      const initialUsage: RentCastUsage = { pulls: 3, lastResetDate: new Date().toISOString() };
      await setDoc(usageRef, initialUsage);
      return initialUsage;
    }
  } catch (error) {
    console.error("Error fetching RentCast usage:", error);
    // Fallback if firestore fails
    return { pulls: 3, lastResetDate: new Date().toISOString() };
  }
};

export const incrementRentCastUsage = async (amount: number = 1): Promise<void> => {
  try {
    const usageRef = doc(db, "system_metrics", USAGE_DOC_ID);
    const docSnap = await getDoc(usageRef);
    if (!docSnap.exists()) {
       await setDoc(usageRef, { pulls: Math.max(3, amount), lastResetDate: new Date().toISOString() });
    } else {
       await updateDoc(usageRef, { pulls: increment(amount) });
    }
  } catch (error) {
    console.error("Error incrementing RentCast usage:", error);
  }
};

export const resetRentCastUsage = async (): Promise<void> => {
  try {
    const usageRef = doc(db, "system_metrics", USAGE_DOC_ID);
    await setDoc(usageRef, { pulls: 0, lastResetDate: new Date().toISOString() });
  } catch (error) {
    console.error("Error resetting RentCast usage:", error);
  }
};
