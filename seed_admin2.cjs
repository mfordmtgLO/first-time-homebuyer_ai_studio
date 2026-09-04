const admin = require('firebase-admin');
const serviceAccount = require('./firebase-applet-config.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

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
