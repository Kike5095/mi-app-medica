import { db } from "../firebaseConfig";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  addDoc,
  orderBy,
} from "firebase/firestore";
import { normalizeCedula } from "../utils/format";

export async function createPatient({ cedula, nombre, apellido }) {
  const id = normalizeCedula(cedula);
  const ref = doc(db, "patients", id);
  await setDoc(
    ref,
    {
      cedula: id,
      nombre: nombre || "",
      apellido: apellido || "",
      estado: "pendiente",
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
  return (await getDoc(ref)).data();
}

export async function listPatientsByEstado(estado) {
  const q = query(collection(db, "patients"), where("estado", "==", estado));
  const s = await getDocs(q);
  return s.docs.map((d) => d.data());
}

export async function setEstado(cedula, estado) {
  const id = normalizeCedula(cedula);
  const ref = doc(db, "patients", id);
  const payload = { estado };
  if (estado === "finalizado") payload.fechaFin = serverTimestamp();
  await updateDoc(ref, payload);
  return (await getDoc(ref)).data();
}

export async function getPatient(cedula) {
  const id = normalizeCedula(cedula);
  const s = await getDoc(doc(db, "patients", id));
  return s.exists() ? s.data() : null;
}

export async function addVitals(cedula, vitals, meta = {}) {
  const id = normalizeCedula(cedula);
  await addDoc(collection(db, "patients", id, "vitals"), {
    ...vitals,
    ...meta,
    createdAt: serverTimestamp(),
  });
}

export async function listVitals(cedula) {
  const id = normalizeCedula(cedula);
  const q = query(
    collection(db, "patients", id, "vitals"),
    orderBy("createdAt", "asc")
  );
  const s = await getDocs(q);
  return s.docs.map((d) => d.data());
}
