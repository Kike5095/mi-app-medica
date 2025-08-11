// src/components/PatientDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
  setDoc
} from "firebase/firestore";
import VitalCharts from "./VitalCharts";

export default function PatientDetail() {
  const { id } = useParams(); // idDoc del paciente (ahora suele ser la cédula)
  const nav = useNavigate();
  const [patient, setPatient] = useState(null);
  const [vitals, setVitals] = useState([]);
  const [candidatos, setCandidatos] = useState([]); // posibles docs viejos para importar

  // carga el paciente + vitals
  useEffect(() => {
    (async () => {
      // paciente
      const ref = doc(db, "patients", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = { idDoc: snap.id, ...snap.data() };
        setPatient(data);
      } else {
        setPatient(null);
      }

      // vitals en el doc actual
      const vSnap = await getDocs(
        query(collection(db, `patients/${id}/vitals`), orderBy("timestamp", "desc"))
      );
      const v = vSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setVitals(v);

      // si no hay vitals, buscar otros docs con mismo "id" (la cédula)
      if ((v?.length ?? 0) === 0 && snap.exists()) {
        const cedula = snap.data()?.id;
        if (cedula) {
          const dupSnap = await getDocs(
            query(collection(db, "patients"), where("id", "==", cedula))
          );
          const otros = dupSnap.docs
            .map(d => ({ idDoc: d.id, ...d.data() }))
            .filter(d => d.idDoc !== id);
          setCandidatos(otros);
        }
      } else {
        setCandidatos([]);
      }
    })();
  }, [id]);

  const titulo = useMemo(() => {
    if (!patient) return "Paciente";
    return `${patient.name || "Paciente"} — ${patient.id || ""}`;
  }, [patient]);

  const importarDesde = async (legacyIdDoc) => {
    // copia subcolección vitals desde legacyIdDoc -> id (doc actual)
    try {
      const origen = await getDocs(collection(db, `patients/${legacyIdDoc}/vitals`));
      const batch = [];
      for (const d of origen.docs) {
        batch.push(
          setDoc(doc(db, `patients/${id}/vitals`, d.id), d.data(), { merge: true })
        );
      }
      await Promise.all(batch);
      alert("Signos importados. Recargando…");
      // recargar vitals
      const vSnap = await getDocs(
        query(collection(db, `patients/${id}/vitals`), orderBy("timestamp", "desc"))
      );
      const v = vSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setVitals(v);
      setCandidatos([]);
    } catch (e) {
      console.error(e);
      alert("No se pudo importar. Revisa consola.");
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
      <button onClick={() => nav(-1)} style={{ marginBottom: 12 }}>← Volver</button>
      <h1>Detalle del paciente</h1>
      {patient ? (
        <>
          <div style={{ marginBottom: 8 }}>
            <b>Nombre:</b> {patient.name || "—"}
          </div>
          <div style={{ marginBottom: 8 }}>
            <b>Cédula:</b> {patient.id || "—"}
          </div>
          <div style={{ marginBottom: 16 }}>
            <b>Estado:</b> {patient.status || "—"}
          </div>

          {/* Si no hay vitals, ofrece importar desde docs viejos con misma cédula */}
          {vitals.length === 0 && candidatos.length > 0 && (
            <div style={{ background:"#fff4e5", padding:12, borderRadius:8, marginBottom:16 }}>
              <b>No hay signos en este documento.</b> Encontré historiales en:
              <ul>
                {candidatos.map(c => (
                  <li key={c.idDoc} style={{ marginTop:6 }}>
                    Doc antiguo: <code>{c.idDoc}</code>{" "}
                    <button onClick={() => importarDesde(c.idDoc)} style={{ marginLeft:8 }}>
                      Importar signos
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Gráficas si existen */}
          {vitals.length > 0 ? (
            <VitalCharts vitals={vitals} />
          ) : (
            <p>Sin registros de signos todavía.</p>
          )}
        </>
      ) : (
        <p>No se encontró el paciente.</p>
      )}
    </div>
  );
}
