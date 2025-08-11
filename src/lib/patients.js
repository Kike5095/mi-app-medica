import { db } from "../firebaseConfig";
import {
  doc,setDoc,getDoc,updateDoc,collection,query,where,
  getDocs,serverTimestamp,addDoc,orderBy
} from "firebase/firestore";

export async function createPatient({ cedula, nombre, apellido }) {
  const ref = doc(db, "patients", String(cedula));
  await setDoc(ref, { cedula:String(cedula), nombre:nombre||"", apellido:apellido||"", estado:"pendiente", createdAt: serverTimestamp() }, { merge:true });
  return (await getDoc(ref)).data();
}
export async function listPatientsByEstado(estado) {
  const q = query(collection(db,"patients"), where("estado","==",estado));
  const s = await getDocs(q); return s.docs.map(d=>d.data());
}
export async function setEstado(cedula, estado) {
  const ref = doc(db,"patients", String(cedula));
  const payload = { estado }; if (estado==="finalizado") payload.fechaFin = serverTimestamp();
  await updateDoc(ref, payload); return (await getDoc(ref)).data();
}
export async function getPatient(cedula){ const s=await getDoc(doc(db,"patients",String(cedula))); return s.exists()?s.data():null; }
export async function addVitals(cedula, vitals, meta={}) {
  await addDoc(collection(db,"patients",String(cedula),"vitals"), { ...vitals, ...meta, createdAt: serverTimestamp() });
}
export async function listVitals(cedula) {
  const q = query(collection(db,"patients",String(cedula),"vitals"), orderBy("createdAt","asc"));
  const s = await getDocs(q); return s.docs.map(d=>d.data());
}
