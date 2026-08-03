import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyC7iOGTdVqP371ipyJ8dfrKvxESQHPpc38",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "figure-collector.firebaseapp.com",
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID ||
    "figure-collector",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "figure-collector.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    "385627858193",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:385627858193:web:a3dabef13c8b3d64a358b0",
  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ||
    "G-X8GPXY5EP4"
};

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length > 0) {
  console.warn(
    `[Firebase] Missing environment variables: ${missingKeys.join(", ")}. ` +
      "Firebase will use the built-in default configuration for local development."
  );
}

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);      // База данных (текст, инфо)
export const storage = getStorage(app);   // Хранилище (фотографии)
export const auth = getAuth(app);         // Вход в аккаунт