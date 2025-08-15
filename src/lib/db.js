import { getFirestore, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Devuelve array de superadmins desde env o con fallback
export function getSuperAdmins() {
  const raw = import.meta?.env?.VITE_SUPER_ADMINS || "doctorcorreap@gmail.com";
  return raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
}

// Verifica si el usuario autenticado es admin/superadmin (para controles de UI)
export function isPrivileged(user, role) {
  const email = (user?.correo || user?.email || "").toLowerCase();
  if (!email) return false;
  const supers = getSuperAdmins();
  if (supers.includes(email)) return true;
  return role === "admin"; // si ya resolviste “currentRole” en el app state
}

// Actualiza el rol de un usuario por su docId (cedula como id o id interno)
export async function updateUserRoleById(userDocId, newRole) {
  const db = getFirestore();
  const ref = doc(db, "users", userDocId);
  await updateDoc(ref, {
    role: String(newRole || "").toLowerCase(),
    updatedAt: serverTimestamp(),
  });
}

// Helper para bloquear cambios a superadmins desde UI (seguridad extra del lado cliente)
export function canChangeTargetUser(targetUserEmail) {
  const email = (targetUserEmail || "").toLowerCase();
  const supers = getSuperAdmins();
  return !supers.includes(email);
}

