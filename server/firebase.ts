import fs from 'fs';
import path from 'path';
import { initializeApp, getApps } from 'firebase/app';
import { initializeFirestore, Firestore, doc, getDoc, setDoc } from 'firebase/firestore';

let firestoreDb: Firestore | null = null;
let isInitialized = false;

export function getFirestoreDb(): Firestore | null {
  if (firestoreDb) return firestoreDb;

  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) {
      console.warn('[Firebase] firebase-applet-config.json not found. Using local database only.');
      return null;
    }

    const rawConfig = fs.readFileSync(configPath, 'utf-8');
    const firebaseConfig = JSON.parse(rawConfig);

    if (!firebaseConfig.projectId) {
      console.warn('[Firebase] Invalid configuration. Missing projectId.');
      return null;
    }

    const apps = getApps();
    const app = apps.length === 0 ? initializeApp(firebaseConfig) : apps[0];

    firestoreDb = initializeFirestore(
      app,
      {
        experimentalForceLongPolling: true,
      },
      firebaseConfig.firestoreDatabaseId
    );

    isInitialized = true;
    console.log(`[Firebase] Connected to Cloud Firestore successfully (DB: ${firebaseConfig.firestoreDatabaseId || 'default'})`);
    return firestoreDb;
  } catch (err) {
    console.error('[Firebase] Failed to initialize Firestore:', err);
    return null;
  }
}

export async function fetchCloudState(): Promise<{ data: any; syncedAt: string; version?: number } | null> {
  const db = getFirestoreDb();
  if (!db) return null;

  try {
    const stateDocRef = doc(db, 'app_state', 'earnora_primary');
    const snapshot = await getDoc(stateDocRef);
    if (snapshot.exists()) {
      return snapshot.data() as { data: any; syncedAt: string; version?: number };
    }
    return null;
  } catch (err) {
    console.error('[Firebase] Error fetching state from Firestore:', err);
    return null;
  }
}

export async function saveCloudState(data: any): Promise<boolean> {
  const db = getFirestoreDb();
  if (!db) return false;

  try {
    const stateDocRef = doc(db, 'app_state', 'earnora_primary');
    await setDoc(stateDocRef, {
      data,
      syncedAt: new Date().toISOString(),
      version: Date.now(),
    });
    return true;
  } catch (err) {
    console.error('[Firebase] Error saving state to Firestore:', err);
    return false;
  }
}
