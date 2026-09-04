const admin = require('firebase-admin');
const serviceAccount = require('./firebase-applet-config.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

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
