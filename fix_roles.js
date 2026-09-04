import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import serviceAccount from './firebase-applet-config.json' assert { type: 'json' };

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const auth = getAuth();

async function run() {
  const users = await auth.listUsers();
  for (const user of users.users) {
    if (user.email === 'fordmj@gmail.com') {
      await db.collection('user_roles').doc(user.uid).set({
        email: user.email,
        role: 'admin',
        updatedAt: new Date()
      }, { merge: true });
      console.log(`Set admin role for ${user.email} (${user.uid})`);
    }
  }
}
run().catch(console.error);
