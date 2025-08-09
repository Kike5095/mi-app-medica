// src/lib/patients.js
import { db } from "../firebaseConfig";
import {
  doc, setDoc, getDoc, updateDoc, collection, query, where,
  getDocs, serverTimestamp, addDoc, orderBy
} from "firebase/firestore";

// Crear paciente con ID = cédula
export async function createPatient({ cedula, nombre, apellido }) {
  const ref = doc(db, "patients", String(cedula));
  await setDoc(ref, {
    cedula: String(cedula),
    nombre: nombre?.trim() || "",
    apellido: apellido?.trim() || "",
    estado: "pendiente",
    createdAt: serverTimestamp(),
  }, { merge: true });
  return (await getDoc(ref)).data();
}

export async function getPatient(cedula) {
  const snap = await getDoc(doc(db, "patients", String(cedula)));
  return snap.exists() ? snap.data() : null;
}

export async function listPatientsByEstado(estado) {
  const q = query(collection(db, "patients"), where("estado", "==", estado));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}

export async function setEstado(cedula, nuevoEstado) {
  const ref = doc(db, "patients", String(cedula));
  const payload = { estado: nuevoEstado };
  if (nuevoEstado === "finalizado") payload.fechaFin = serverTimestamp();
  await updateDoc(ref, payload);
  return (await getDoc(ref)).data();
}

// Signos
export async function addVitals(cedula, vitals, meta = {}) {
  const ref = collection(db, "patients", String(cedula), "vitals");
  await addDoc(ref, { ...vitals, ...meta, createdAt: serverTimestamp() });
}

export async function listVitals(cedula) {
  const ref = collection(db, "patients", String(cedula), "vitals");
  const q = query(ref, orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}
