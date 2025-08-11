import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

function formatDate(ts) {
  if (!ts) return "-";
  if (ts.seconds) {
    return new Date(ts.seconds * 1000).toLocaleDateString();
  }
  const d = new Date(ts);
  return isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
}

const TABS = ["pendiente", "activo", "finalizado"];

export default function AdminView() {
  const [patients, setPatients] = useState([]);
  const [activeTab, setActiveTab] = useState("pendiente");
  const [modalPatient, setModalPatient] = useState(null);

  useEffect(() => {
    const q = collection(db, "patients");
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPatients(rows);
    });
    return () => unsub();
  }, []);

  const filtered = patients.filter((p) => (p.status || "").toLowerCase() === activeTab);

  const updateLocal = (id, changes) => {
    setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, ...changes } : p)));
  };

  const activar = (p) => {
    const fecha = new Date();
    updateLocal(p.id, { status: "activo", fechaIngreso: fecha });
    updateDoc(doc(db, "patients", p.id), {
      status: "activo",
      fechaIngreso: serverTimestamp(),
    });
  };

  const finalizar = (p) => {
    const fecha = new Date();
    updateLocal(p.id, { status: "finalizado", fechaFin: fecha });
    updateDoc(doc(db, "patients", p.id), {
      status: "finalizado",
      fechaFin: serverTimestamp(),
    });
  };

  return (
    <div className="admin-view" style={{ padding: 20 }}>
      <h1>Pacientes</h1>
      <div className="tabs" style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: activeTab === t ? "#0d6efd" : "#fff",
              color: activeTab === t ? "#fff" : "#000",
              cursor: "pointer",
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 && <p>No hay pacientes</p>}
      <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((p) => (
          <li key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <strong>
                {p.firstName} {p.lastName}
              </strong>
              <span>Cédula: {p.cedula || "-"}</span>
              <span>
                {activeTab === "finalizado" ? "Fin" : "Ingreso"}: {formatDate(activeTab === "finalizado" ? p.fechaFin : p.fechaIngreso)}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc", cursor: "pointer" }}
                onClick={() => setModalPatient(p)}
              >
                Ver historial
              </button>
              {p.status === "pendiente" && (
                <button
                  style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #198754", background: "#198754", color: "#fff", cursor: "pointer" }}
                  onClick={() => activar(p)}
                >
                  Activar
                </button>
              )}
              {p.status === "activo" && (
                <button
                  style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #dc3545", background: "#dc3545", color: "#fff", cursor: "pointer" }}
                  onClick={() => finalizar(p)}
                >
                  Finalizar
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {modalPatient && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ background: "#fff", padding: 20, borderRadius: 8, minWidth: 300 }}>
            <h2>
              Historial de {modalPatient.firstName} {modalPatient.lastName}
            </h2>
            <p>Contenido pendiente...</p>
            <button
              style={{ marginTop: 12, padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc", cursor: "pointer" }}
              onClick={() => setModalPatient(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

