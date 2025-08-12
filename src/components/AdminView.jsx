import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import PatientForm from "./PatientForm";
import LogoutButton from "./LogoutButton";

function asDate(v) {
  if (!v) return null;
  if (v.seconds) return new Date(v.seconds * 1000);
  if (v instanceof Date) return v;
  const d = new Date(v);
  return isNaN(d) ? null : d;
}
function fmt(v) {
  const d = asDate(v);
  if (!d) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function finDisplay(p) {
  return fmt(p.finAt ?? p.finEstimadoAt ?? p.fin);
}
function ingresoDisplay(p) {
  return fmt(p.ingresoAt ?? p.ingreso ?? p.createdAt);
}

function formatName(p) {
  const name = (p.nombreCompleto || `${p.firstName || ""} ${p.lastName || ""}`).trim();
  return name || "—";
}

export default function AdminView() {
  const [patients, setPatients] = useState([]);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

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
    updateLocal(p.id, { status: "finalizado", finAt: fecha, fechaFin: fecha });
    const ts = serverTimestamp();
    updateDoc(doc(db, "patients", p.id), {
      status: "finalizado",
      finAt: ts,
      fechaFin: ts,
    });
  };
  const renderRows = (list, tipo) =>
    list.map((p) => {
      const ingreso = ingresoDisplay(p);
      const fin = finDisplay(p);
      const isEstimado = !!p.finEstimadoAt && !p.finAt;
      return (
        <tr key={p.id}>
          <td>{formatName(p)}</td>
          <td>{p.cedula || "—"}</td>
          <td>{ingreso}</td>
          <td>
            {fin}
            {isEstimado ? " (planificado)" : ""}
          </td>
          <td>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn"
                onClick={() =>
                  navigate(`/paciente/${p.id}`, { state: { from: "admin" } })
                }
              >
                Ver historial
              </button>
              {tipo === "pendiente" && (
                <button className="btn primary" onClick={() => activar(p)}>
                  Activar
                </button>
              )}
              {tipo === "activo" && (
                <button className="btn danger" onClick={() => finalizar(p)}>
                  Finalizar
                </button>
              )}
            </div>
          </td>
        </tr>
      );
    });

  const renderTable = (title, list, tipo) => (
    <section className="card">
      <div className="card-body">
        <h2>{title}</h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cédula</th>
                <th>Ingreso</th>
                <th>Fin</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={5}>No hay pacientes</td>
                </tr>
              ) : (
                renderRows(list, tipo)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );

  return (
    <div className="page">
      <div className="container">
        <div className="section-header">
          <h1 className="section-title">Pacientes</h1>
          <LogoutButton />
        </div>

        <button className="btn primary" onClick={() => setCreating(true)}>
          Crear paciente
        </button>

        {renderTable("Pendientes", pendientes, "pendiente")}
        {renderTable("Activos", activos, "activo")}
        {renderTable("Finalizados", finalizados, "finalizado")}

        {creating && (
          <PatientForm
            onCreated={refrescar}
            onClose={() => setCreating(false)}
          />
        )}
      </div>
    </div>
  );
}

