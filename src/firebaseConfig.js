// src/firebaseConfig.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

const env = import.meta.env;

// Leer primero las variables "largas" y, si no existen, caer a las "cortas" de Netlify
function pick(...keys) {
  for (const k of keys) {
    const v = env?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return undefined;
}

const cfg = {
  apiKey:           pick("VITE_FIREBASE_API_KEY",         "VITE_API_KEY"),
  authDomain:       pick("VITE_FIREBASE_AUTH_DOMAIN",     "VITE_AUTH_DOMAIN"),
  projectId:        pick("VITE_FIREBASE_PROJECT_ID",      "VITE_PROJECT_ID"),
  storageBucket:    pick("VITE_FIREBASE_STORAGE_BUCKET",  "VITE_STORAGE_BUCKET"),
  messagingSenderId:pick("VITE_FIREBASE_MESSAGING_SENDER_ID", "VITE_MESSAGING_SENDER_ID"),
  appId:            pick("VITE_FIREBASE_APP_ID",          "VITE_APP_ID"),
};

// Validación y aviso útil en consola (no detiene prod, pero facilita diagnóstico)
const missing = Object.entries(cfg)
  .filter(([,v]) => !v)
  .map(([k]) => k);

if (missing.length) {
  // Mensaje claro en producción para detectar nombres mal puestos en Netlify
  // No hacemos throw para no romper silenciosamente; Firebase marcaría error igualmente.
  // Sugerencia: revisa los nombres en Netlify → Site settings → Build & deploy → Environment.
  console.error(
    "[ENV] Faltan variables para Firebase:",
    missing,
    "\nSe aceptan nombres largos (VITE_FIREBASE_*) o cortos (VITE_*)."
  );
}

const app = getApps().length ? getApps()[0] : initializeApp(cfg);
export const db = getFirestore(app);
export const auth = getAuth(app);

export async function ensureAuth() {
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
}

export default app;
