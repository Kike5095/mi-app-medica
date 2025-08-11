import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import PatientHistoryModal from "./PatientHistoryModal";
import PatientForm from "./PatientForm";

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
  const [historyId, setHistoryId] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const q = collection(db, "patients");
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPatients(rows);
    });
    return () => unsub();
  }, []);

  const filtered = patients.filter((p) => (p.status || "").toLowerCase() === activeTab);

  const refrescar = async () => {
    const snap = await getDocs(collection(db, "patients"));
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setPatients(rows);
  };

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
      <button
        onClick={() => setCreating(true)}
        style={{
          padding: "8px 12px",
          borderRadius: 6,
          border: "1px solid #0d6efd",
          background: "#0d6efd",
          color: "#fff",
          cursor: "pointer",
          marginBottom: 16,
        }}
      >
        Crear paciente
      </button>
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
                {(p.nombreCompleto || `${p.firstName || ""} ${p.lastName || ""}`).trim()}
              </strong>
              <span>Cédula: {p.cedula || "-"}</span>
              <span>
                {activeTab === "finalizado" ? "Fin" : "Ingreso"}: {formatDate(activeTab === "finalizado" ? p.fechaFin : p.fechaIngreso)}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc", cursor: "pointer" }}
                onClick={() => setHistoryId(p.id)}
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

      {historyId && (
        <PatientHistoryModal
          patientId={historyId}
          onClose={() => setHistoryId(null)}
        />
      )}
      {creating && (
        <PatientForm
          onCreated={refrescar}
          onClose={() => setCreating(false)}
        />
      )}
    </div>
  );
}

