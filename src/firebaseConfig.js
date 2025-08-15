// src/firebaseConfig.js
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

const cfg = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
};

// Validación en tiempo de ejecución para detectar variables faltantes
const missing = Object.entries(cfg)
  .filter(([, v]) => !v || typeof v !== "string" || v.trim() === "")
  .map(([k]) => k);

if (missing.length) {
  // Mensaje claro en consola para depurar en Netlify/producción
  console.error("[ENV] Faltan variables para Firebase:", missing);
  console.error(
    "Asegúrate de definir en Netlify (Site settings → Environment variables) las claves exactas:",
    [
      "VITE_API_KEY",
      "VITE_AUTH_DOMAIN",
      "VITE_PROJECT_ID",
      "VITE_STORAGE_BUCKET",
      "VITE_MESSAGING_SENDER_ID",
      "VITE_APP_ID",
    ]
  );
  // Opcional: lanza un error explícito para evitar inicializar mal Firebase
  throw new Error("Firebase config incompleto. Revisa variables de entorno.");
}

const app = getApps().length ? getApp() : initializeApp(cfg);
export { app };

export const db = getFirestore(app);
export const auth = getAuth(app);

export async function ensureAuth() {
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
}

export default app;

