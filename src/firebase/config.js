import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC7iOGTdVqP371ipyJ8dfrKvxESQHPpc38",
  authDomain: "figure-collector.firebaseapp.com",
  projectId: "figure-collector",
  storageBucket: "figure-collector.firebasestorage.app",
  messagingSenderId: "385627858193",
  appId: "1:385627858193:web:a3dabef13c8b3d64a358b0",
  measurementId: "G-X8GPXY5EP4"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);      // База данных (текст, инфо)
export const storage = getStorage(app);   // Хранилище (фотографии)
export const auth = getAuth(app);         // Вход в аккаунт