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
import LogoutButton from "./LogoutButton";

function showVal(v) {
  return v || v === 0 ? String(v) : "—";
}

function truncate(t, n = 40) {
  if (!t) return "—";
  return t.length > n ? t.slice(0, n) + "…" : t;
}

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
      <div className="page">
        <div className="container">
          <div className="section-header">
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button className="btn" onClick={handleBack}>← Volver</button>
              <h1 className="section-title">Detalle del paciente</h1>
            </div>
            <LogoutButton />
          </div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (patient === null) {
    return (
      <div className="page">
        <div className="container">
          <div className="section-header">
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button className="btn" onClick={handleBack}>← Volver</button>
              <h1 className="section-title">Detalle del paciente</h1>
            </div>
            <LogoutButton />
          </div>
          <p>Paciente no encontrado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="section-header">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button className="btn" onClick={handleBack}>← Volver</button>
            <h1 className="section-title">Detalle del paciente</h1>
          </div>
          <LogoutButton />
        </div>

        <style>{`
        .note-summary {
          cursor: pointer;
          color: #0b5ed7;
          text-decoration: underline;
          display: block;
          max-width: 180px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .note-full { white-space: pre-wrap; word-break: break-word; }
      `}</style>

        <section className="card">
          <div className="card-body">
            <div style={{ marginBottom: 8 }}>
              <b>Nombre:</b> {patient.nombreCompleto || `${patient.firstName || ""} ${patient.lastName || ""}`.trim() || "—"}
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>Cédula:</b> {patient.cedula || "—"}
            </div>
            <div style={{ marginBottom: 8 }}>
              <b>Edad:</b> {showVal(patient.edad)}
            </div>
            <div style={{ marginBottom: 16 }}>
              <b>Diagnóstico:</b> {patient.diagnostico || "—"}
            </div>
            <div style={{ marginBottom: 16 }}>
              <b>Estado:</b> {patient.status || "—"}
            </div>
          </div>
        </section>

        {vitals.length === 0 && candidatos.length > 0 && (
          <section className="card" style={{ background: "#fff4e5" }}>
            <div className="card-body">
              <b>No hay signos en este documento.</b> Encontré historiales en:
              <ul>
                {candidatos.map((c) => (
                  <li key={c.idDoc} style={{ marginTop: 6 }}>
                    Doc antiguo: <code>{c.idDoc}</code>{" "}
                    <button className="btn" onClick={() => importarDesde(c.idDoc)} style={{ marginLeft: 8 }}>
                      Importar signos
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {vitals.length > 0 ? (
          <>
            <section className="card">
              <div className="card-body">
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>FC</th>
                        <th>FR</th>
                        <th>TA</th>
                        <th>SpO₂</th>
                        <th>Temp</th>
                        <th>Nota</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vitals.map((v) => {
                        const bp =
                          typeof v.bpSys === "number" && typeof v.bpDia === "number"
                            ? `${v.bpSys}/${v.bpDia}`
                            : parseBP(v.bp)?.text || "";
                        const fecha = v.createdAt?.toDate?.()?.toLocaleString?.() || "";
                        const note = v.note ?? v.notes ?? "";
                        const preview = note.length > 80 ? note.slice(0, 80).trimEnd() + "…" : note;
                        return (
                          <tr key={v.id}>
                            <td>{fecha}</td>
                            <td>{v.hr ?? v.fc ?? ""}</td>
                            <td>{v.rr ?? v.fr ?? ""}</td>
                            <td>{bp}</td>
                            <td>{v.spo2 ?? ""}</td>
                            <td>{v.temp ?? ""}</td>
                            <td>
                              {note ? (
                                <details>
                                  <summary className="note-summary">{preview}</summary>
                                  <div className="note-full">{note}</div>
                                </details>
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="card">
              <div className="card-body">
                <VitalCharts data={vitals} />
              </div>
            </section>
          </>
        ) : (
          <p>Sin registros de signos todavía.</p>
        )}
      </div>
    </div>
  );
}
