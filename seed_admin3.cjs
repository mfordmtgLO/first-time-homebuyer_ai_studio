const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const serviceAccount = require('./firebase-applet-config.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const auth = getAuth();

async function run() {
  const users = await auth.listUsers();
  const user = users.users.find(u => u.email === 'fordmj@gmail.com');
  if (user) {
    await db.collection('user_roles').doc(user.uid).set({
      email: user.email,
      role: 'admin',
      updatedAt: new Date()
    }, { merge: true });
    console.log('Set user_roles admin for:', user.uid);
  } else {
    console.log('User not found!');
  }
}
run().catch(console.error);
