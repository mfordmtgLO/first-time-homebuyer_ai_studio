const admin = require("firebase-admin");
const serviceAccount = require("./firebase-applet-config.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

async function run() {
  const settingsRef = db.collection('app_settings').doc('global');
  const doc = await settingsRef.get();
  console.log("Current settings:", doc.data());
  await settingsRef.set({ isPublic: true }, { merge: true });
  console.log("Updated to public");
}
run().catch(console.error);
