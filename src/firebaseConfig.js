// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// Usa tus variables VITE_* (Netlify/Gitpod)
const firebaseConfig = {
  apiKey: "AIzaSyD5qQ2fQN7fZoQ4zvjDfsdzO1wTmI5oNF4",
  authDomain: "mi-app-medica-ef3fa.firebaseapp.com",
  projectId: "mi-app-medica-ef3fa",
  storageBucket: "mi-app-medica-ef3fa.firebasestorage.app",
  messagingSenderId: "713331216336",
  appId: "1:713331216336:web:db2026dfc8b98c60c133d5"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

// 👇 Esta función es la que te faltaba
export async function ensureAuth() {
  try {
    if (!auth.currentUser) {
      console.log("[AUTH] Signing in anonymously…");
      await signInAnonymously(auth);
      console.log("[AUTH] Signed in:", auth.currentUser?.uid);
    }
  } catch (e) {
    console.error("[AUTH] Anonymous sign-in failed:", e);
    throw e;
  }
}
