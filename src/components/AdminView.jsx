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
import LogoutButton from "./LogoutButton";

function formatDate(ts) {
  if (!ts) return "—";
  const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  if (isNaN(d.getTime())) return "—";
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function formatName(p) {
  const name = (p.nombreCompleto || `${p.firstName || ""} ${p.lastName || ""}`).trim();
  return name || "—";
}

export default function AdminView() {
  const [patients, setPatients] = useState([]);
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

  const pendientes = patients.filter(
    (p) => (p.status || "").toLowerCase() === "pendiente"
  );
  const activos = patients.filter(
    (p) => (p.status || "").toLowerCase() === "activo"
  );
  const finalizados = patients.filter(
    (p) => (p.status || "").toLowerCase() === "finalizado"
  );

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

  const cellStyle = { border: "1px solid #dee2e6", padding: 8 };
  const btnBase = {
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer",
    border: "1px solid",
  };

  const renderRows = (list, tipo) =>
    list.map((p) => (
      <tr key={p.id}>
        <td style={cellStyle}>{formatName(p)}</td>
        <td style={cellStyle}>{p.cedula || "—"}</td>
        <td style={cellStyle}>
          {formatDate(tipo === "finalizado" ? p.fechaFin : p.fechaIngreso)}
        </td>
        <td style={cellStyle}>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              style={{ ...btnBase, borderColor: "#ccc" }}
              onClick={() => setHistoryId(p.id)}
            >
              Ver historial
            </button>
            {tipo === "pendiente" && (
              <button
                style={{
                  ...btnBase,
                  borderColor: "#198754",
                  background: "#198754",
                  color: "#fff",
                }}
                onClick={() => activar(p)}
              >
                Activar
              </button>
            )}
            {tipo === "activo" && (
              <button
                style={{
                  ...btnBase,
                  borderColor: "#dc3545",
                  background: "#dc3545",
                  color: "#fff",
                }}
                onClick={() => finalizar(p)}
              >
                Finalizar
              </button>
            )}
          </div>
        </td>
      </tr>
    ));

  const renderTable = (title, list, tipo, fechaCol) => (
    <section style={{ marginBottom: 32 }}>
      <h2>{title}</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={cellStyle}>Nombre</th>
            <th style={cellStyle}>Cédula</th>
            <th style={cellStyle}>{fechaCol}</th>
            <th style={cellStyle}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr>
              <td style={cellStyle} colSpan={4}>
                No hay pacientes
              </td>
            </tr>
          ) : (
            renderRows(list, tipo)
          )}
        </tbody>
      </table>
    </section>
  );

  return (
    <div className="admin-view" style={{ padding: 20 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h1>Pacientes</h1>
        <LogoutButton
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #dc3545",
            background: "#dc3545",
            color: "#fff",
            cursor: "pointer",
          }}
        />
      </header>

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

      {renderTable("Pendientes", pendientes, "pendiente", "Ingreso")}
      {renderTable("Activos", activos, "activo", "Ingreso")}
      {renderTable("Finalizados", finalizados, "finalizado", "Fin")}

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

