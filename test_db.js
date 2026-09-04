import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from './firebase-applet-config.json' assert { type: 'json' };

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function run() {
  const settingsRef = db.collection('app_settings').doc('global');
  await settingsRef.set({ isPublic: true }, { merge: true });
  console.log("Updated to public");
}
run().catch(console.error);
