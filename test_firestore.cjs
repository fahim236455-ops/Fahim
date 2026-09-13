const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function test() {
  console.log("Connecting to Firestore with databaseId:", config.firestoreDatabaseId);
  const testDoc = doc(db, 'app_state', 'test_connection');
  await setDoc(testDoc, { ping: 'pong', timestamp: new Date().toISOString() });
  const snap = await getDoc(testDoc);
  console.log("Read back from Firestore:", snap.data());
  console.log("Firestore connection test SUCCESSFUL!");
  process.exit(0);
}

test().catch(err => {
  console.error("Firestore test error:", err);
  process.exit(1);
});
