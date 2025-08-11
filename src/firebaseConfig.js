// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ Config directa (sin .env)
const firebaseConfig = {
  apiKey: "AIzaSyD5qQ2fQN7fZoQ4zvjDfsdzO1wTmI5oNF4",
  authDomain: "mi-app-medica-ef3fa.firebaseapp.com",
  projectId: "mi-app-medica-ef3fa",
  storageBucket: "mi-app-medica-ef3fa.appspot.com", // ojo: appspot.com
  messagingSenderId: "713331216336",
  appId: "1:713331216336:web:db2026dfc8b98c60c133d5"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Helper para tener sesión (anónima) activa cuando lo necesites
export async function ensureAuth() {
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
}

export default app;
