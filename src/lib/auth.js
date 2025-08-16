// Utilidades de autenticación y búsqueda por correo en Firestore
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

// Import robusto de la config (soporta export default o named)
import * as rawConfig from "../firebaseConfig.js";
const firebaseConfig = rawConfig.default || rawConfig.firebaseConfig || rawConfig.config;

if (!firebaseConfig) {
  console.error("firebaseConfig no encontrado en src/firebaseConfig.js");
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

// Normaliza correo
export function normalizeEmail(v) {
  return (v || "").trim().toLowerCase();
}

// Destino por rol
export function destinationForRole(role) {
  switch ((role || "").toLowerCase()) {
    case "admin":
    case "administrador":
      return "/admin";
    case "medico":
    case "médico":
      return "/medico";
    case "auxiliar":
      return "/auxiliar";
    default:
      return "/admin";
  }
}

// Resuelve rol a partir del doc de usuario o por dominio
export function resolveRole(email, userDoc) {
  const e = normalizeEmail(email);
  const roleFromDoc = userDoc?.rol || userDoc?.role || "";
  if (roleFromDoc) return roleFromDoc;

  if (e.endsWith("@hospital.com") || e.endsWith("@clinic.com")) return "medico";
  return "admin";
}

// Busca en firestore por email en "usuarios" o "users"
export async function findUserByEmail(email) {
  const value = normalizeEmail(email);
  if (!value) return null;

  async function firstBy(collectionName) {
    const q = query(collection(db, collectionName), where("email", "==", value));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0];
      return { id: d.id, ...d.data() };
    }
    return null;
  }

  let user = await firstBy("usuarios");
  if (!user) user = await firstBy("users");
  return user;
}
