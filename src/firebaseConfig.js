// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Logs claros (deben mostrar tus valores reales, no 'tu_api_key' ni undefined)
console.log("[ENV api]", import.meta.env.VITE_API_KEY);
console.log("[ENV project]", import.meta.env.VITE_PROJECT_ID);
console.log("[ENV bucket]", import.meta.env.VITE_STORAGE_BUCKET);

// Guardas: avisa si falta algo
["VITE_API_KEY","VITE_AUTH_DOMAIN","VITE_PROJECT_ID","VITE_STORAGE_BUCKET","VITE_MESSAGING_SENDER_ID","VITE_APP_ID"]
  .forEach(k => { if (!import.meta.env[k]) console.error(`⚠️ Falta ${k} en .env`); });

// Config con .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET, // .appspot.com
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
};

// Falla rápido si quedó alguna cadena de ejemplo
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "tu_api_key") {
  throw new Error("ENV no cargado: apiKey inválida. Revisa tu .env y reinicia Vite.");
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Opcional: helper
export async function ensureAuth() {
  if (!auth.currentUser) await signInAnonymously(auth);
}

export default app;
