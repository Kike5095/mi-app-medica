import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

export function normalizeEmail(raw) {
  return String(raw || "").trim().toLowerCase();
}

function parseAdminsEnv() {
  const raw = (import.meta?.env?.VITE_SUPER_ADMINS || "").trim();
  if (!raw) return [];
  return raw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
}

/**
 * Busca un usuario por correo en la colección "users".
 * Intenta por: correoLower, correo, email (en ese orden).
 * Si existe pero no tiene correoLower, lo rellena.
 */
export async function findUserByEmail(email) {
  const e = normalizeEmail(email);
  const col = collection(db, "users");

  // 1) correoLower
  let snap = await getDocs(query(col, where("correoLower", "==", e)));
  if (snap.empty) {
    // 2) correo exacto
    snap = await getDocs(query(col, where("correo", "==", email)));
  }
  if (snap.empty) {
    // 3) email exacto
    snap = await getDocs(query(col, where("email", "==", email)));
  }
  if (snap.empty) return null;

  const d = snap.docs[0];
  const data = d.data() || {};
  // Autorellena correoLower si falta
  if (!data.correoLower || data.correoLower !== e) {
    try {
      await updateDoc(doc(db, "users", d.id), {
        correoLower: e,
        updatedAt: serverTimestamp(),
      });
    } catch {}
  }
  return { id: d.id, ...data };
}

/**
 * Resuelve rol efectivo: superadmin si está en VITE_SUPER_ADMINS, si no el rol del doc, si no "auxiliar".
 */
export function resolveRole(email, userDoc) {
  const e = normalizeEmail(email);
  const supers = parseAdminsEnv();
  if (supers.includes(e)) return "superadmin";
  return userDoc?.role || "auxiliar";
}

export function destinationForRole(role) {
  if (role === "superadmin" || role === "admin") return "/admin";
  if (role === "medico") return "/medico";
  return "/auxiliar";
}
