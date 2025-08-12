// src/components/PatientDetail.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { db } from "../firebaseConfig";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
  setDoc
} from "firebase/firestore";
import { parseBP } from "../utils/bp";
import VitalCharts from "./VitalCharts";

export default function PatientDetail() {
  const { id } = useParams(); // idDoc del paciente (ahora suele ser la cédula)
  const nav = useNavigate();
  const location = useLocation();
  const [patient, setPatient] = useState(undefined);
  const [vitals, setVitals] = useState([]);
  const [candidatos, setCandidatos] = useState([]); // posibles docs viejos para importar

  const handleBack = () => {
    if (location.state?.from === "admin") {
      nav("/admin");
    } else {
      nav(-1);
    }
  };

  // escucha al paciente y carga vitals
  useEffect(() => {
    const ref = doc(db, "patients", id);
    const unsubscribe = onSnapshot(ref, snap => {
      if (snap.exists()) {
        const data = { idDoc: snap.id, ...snap.data() };
        setPatient(data);
      } else {
        setPatient(null);
        setVitals([]);
        setCandidatos([]);
      }
    });
    return () => unsubscribe();
  }, [id]);

  // escucha vitals y busca candidatos cuando cambian
  useEffect(() => {
    if (!id || patient === null) return;
    const col = collection(db, `patients/${id}/vitals`);
    const q = query(col, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, async (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setVitals(list);

      if (list.length === 0 && patient) {
        const cedula = patient.cedula;
        if (cedula) {
          const dupSnap = await getDocs(
            query(collection(db, "patients"), where("cedula", "==", cedula))
          );
          const otros = dupSnap.docs
            .map(d => ({ idDoc: d.id, ...d.data() }))
            .filter(d => d.idDoc !== id);
          setCandidatos(otros);
        } else {
          setCandidatos([]);
        }
      } else {
        setCandidatos([]);
      }
    });
    return () => unsub();
  }, [id, patient]);

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
      const vSnap = await getDocs(
        query(collection(db, `patients/${id}/vitals`), orderBy("createdAt", "asc"))
      );
      const v = vSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setVitals(v);
      setCandidatos([]);
    } catch (e) {
      console.error(e);
      alert("No se pudo importar. Revisa consola.");
    }
  };

  if (patient === undefined) {
    return (
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16, width: "100%" }}>
        <button onClick={handleBack} style={{ marginBottom: 12 }}>← Volver</button>
        <h1>Detalle del paciente</h1>
        <p>Cargando...</p>
      </div>
    );
  }

  if (patient === null) {
    return (
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16, width: "100%" }}>
        <button onClick={handleBack} style={{ marginBottom: 12 }}>← Volver</button>
        <h1>Detalle del paciente</h1>
        <p>Paciente no encontrado.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16, width: "100%" }}>
      <button onClick={handleBack} style={{ marginBottom: 12 }}>← Volver</button>
      <h1>Detalle del paciente</h1>
      <>
        <div style={{ marginBottom: 8 }}>
          <b>Nombre:</b> {patient.nombreCompleto || `${patient.firstName || ""} ${patient.lastName || ""}`.trim() || "—"}
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>Cédula:</b> {patient.cedula || "—"}
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

        {vitals.length > 0 ? (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Fecha</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>FC</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>FR</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>TA</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>SpO₂</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Temp</th>
                </tr>
              </thead>
              <tbody>
                {vitals.map(v => {
                  const bp =
                    typeof v.bpSys === "number" && typeof v.bpDia === "number"
                      ? `${v.bpSys}/${v.bpDia}`
                      : parseBP(v.bp)?.text || "";
                  const fecha = v.createdAt?.toDate?.()?.toLocaleString?.() || "";
                  return (
                    <tr key={v.id}>
                      <td style={{ padding: "4px 8px" }}>{fecha}</td>
                      <td style={{ padding: "4px 8px" }}>{v.hr ?? v.fc ?? ""}</td>
                      <td style={{ padding: "4px 8px" }}>{v.rr ?? v.fr ?? ""}</td>
                      <td style={{ padding: "4px 8px" }}>{bp}</td>
                      <td style={{ padding: "4px 8px" }}>{v.spo2 ?? ""}</td>
                      <td style={{ padding: "4px 8px" }}>{v.temp ?? ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <VitalCharts data={vitals} />
          </>
        ) : (
          <p>Sin registros de signos todavía.</p>
        )}
      </>
    </div>
  );
}
