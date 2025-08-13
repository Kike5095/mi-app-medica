import { db, ensureAuth } from "../firebaseConfig";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  collection,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";

const normCed = (s) => (s || "").toString().trim().replace(/[.\s-]/g, "");

export async function getUserByCedula(cedula) {
  await ensureAuth();
  const id = normCed(cedula);
  const ref = doc(db, "users", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    cedula: snap.id,
    nombreCompleto: data.nombreCompleto || "",
    correo: data.correo || "",
    role: data.role || data.rol || "",
  };
}

export async function createUser({ cedula, nombreCompleto, correo, role }) {
  await ensureAuth();
  const id = normCed(cedula);
  const ref = doc(db, "users", id);
  await setDoc(ref, {
    cedula: id,
    nombreCompleto,
    correo,
    role,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserRole(cedula, role) {
  await ensureAuth();
  const id = normCed(cedula);
  const ref = doc(db, "users", id);
  await updateDoc(ref, {
    role,
    updatedAt: serverTimestamp(),
  });
}

export async function getUsersPage(limitN = 50) {
  await ensureAuth();
  const q = query(
    collection(db, "users"),
    orderBy("createdAt", "desc"),
    limit(limitN)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function findUserByCedula(cedula) {
  await ensureAuth();
  const id = normCed(cedula);
  const ref = doc(db, "users", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export function getRole() {
  try {
    return localStorage.getItem("role") || "";
  } catch {
    return "";
  }
}

export function isSuperAdminLocal() {
  return getRole() === "superadmin";
}

export function isCedulaInSuperAdmins(cedula) {
  try {
    const raw = import.meta.env?.VITE_SUPER_ADMINS || "";
    const list = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return list.includes(String(cedula));
  } catch {
    return false;
  }
}
