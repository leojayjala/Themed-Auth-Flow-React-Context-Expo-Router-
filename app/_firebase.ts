import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "",
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);

let _firebaseApp: ReturnType<typeof initializeApp> | null = null;
let _auth: ReturnType<typeof getAuth> | null = null;

export function getFirebaseApp() {
  if (!isFirebaseConfigured) return null;
  if (_firebaseApp) return _firebaseApp;
  _firebaseApp = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
  return _firebaseApp;
}

export function getFirebaseAuth() {
  if (!isFirebaseConfigured) {
    throw new Error(
      "Firebase is not configured. Create a .env file and set EXPO_PUBLIC_FIREBASE_* keys (see .env.example), then restart Expo."
    );
  }
  if (_auth) return _auth;
  const app = getFirebaseApp();
  if (!app) throw new Error("Firebase is not configured.");
  _auth = getAuth(app);
  return _auth;
}
