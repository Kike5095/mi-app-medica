import { db, ensureAuth } from "../firebaseConfig";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export async function getUserByCedula(cedula) {
  await ensureAuth();
  const ref = doc(db, "users", String(cedula));
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
  const id = String(cedula).trim();
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
