import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

function envValue(key) {
  const value = import.meta.env[key] || '';
  return value.includes('=') ? value.split('=').slice(1).join('=').trim() : value.trim();
}

const firebaseConfig = {
  apiKey: envValue('VITE_FIREBASE_API_KEY'),
  authDomain: envValue('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: envValue('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: envValue('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: envValue('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: envValue('VITE_FIREBASE_APP_ID'),
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
