import { db, ensureAuth } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

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
