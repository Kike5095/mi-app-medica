// src/components/AdminView.jsx
import { useLocation, Link } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

function formatDate(value) {
  if (!value) return "—";
  // Firestore serverTimestamp llega como Timestamp (seconds/nanoseconds)
  if (value?.seconds) {
    const d = new Date(value.seconds * 1000);
    return d.toLocaleDateString();
  }
  // ISO string o "YYYY-MM-DD"
  const d = new Date(value);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

export default function AdminView() {
  const nav = useNavigate();

  // Formulario
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [cedula, setCedula] = useState("");
  const [fin, setFin] = useState(""); // YYYY-MM-DD

  // Datos
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar pacientes en vivo
  useEffect(() => {
    const q = query(collection(db, "patients"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => ({ idDoc: d.id, ...d.data() }));
        setPatients(rows);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  const pendientes = useMemo(
    () => patients.filter((p) => (p.status || "").toLowerCase() === "pendiente"),
    [patients]
  );
  const activos = useMemo(
    () => patients.filter((p) => (p.status || "").toLowerCase() === "activo"),
    [patients]
  );
  const finalizados = useMemo(
    () => patients.filter((p) => (p.status || "").toLowerCase() === "finalizado"),
    [patients]
  );

  async function crearPaciente(e) {
    e.preventDefault();
    if (!nombre.trim() || !apellido.trim() || !cedula.trim()) return;

    const fullName = `${nombre.trim()} ${apellido.trim()}`.replace(/\s+/g, " ");

    await addDoc(collection(db, "patients"), {
      name: fullName,
      id: cedula.trim(),
      status: "Pendiente",
      createdAt: serverTimestamp(), // fecha de ingreso (oculta en el form)
      treatmentEndDate: fin || "",  // fecha fin (opcional)
    });

    // Limpiar formulario
    setNombre("");
    setApellido("");
    setCedula("");
    setFin("");
  }

  async function activarPaciente(p) {
    await updateDoc(doc(db, "patients", p.idDoc), { status: "Activo" });
  }

  async function finalizarPaciente(p) {
    await updateDoc(doc(db, "patients", p.idDoc), { status: "Finalizado" });
  }

  function verPaciente(p) {
    nav(`/paciente/${p.idDoc}`);
  }

  return (
    <div className="wrap">
      <header className="topbar">
        <h1>Panel de Administración</h1>
        <button className="btn" onClick={() => nav("/")}>Salir</button>
      </header>

      {/* Alta de paciente (fecha de ingreso se guarda con serverTimestamp y NO se muestra aquí) */}
      <section className="card">
        <h2>Agregar paciente</h2>
        <form onSubmit={crearPaciente} className="formGrid">
          <div className="formRow">
            <label>Nombre</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="input"
              autoComplete="off"
            />
          </div>

          <div className="formRow">
            <label>Apellido</label>
            <input
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              className="input"
              autoComplete="off"
            />
          </div>

          <div className="formRow">
            <label>Cédula</label>
            <input
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              className="input"
              autoComplete="off"
            />
          </div>

          <div className="formRow">
            <label>Fecha de finalización de tratamiento</label>
            <input
              type="date"
              value={fin}
              onChange={(e) => setFin(e.target.value)}
              className="input"
            />
          </div>

          <div className="formActions">
            <button className="btn primary">Crear</button>
          </div>
        </form>
      </section>

      {/* Listas */}
      <section className="listBlock">
        <h3>Pendientes</h3>
        {loading && <p className="muted">Cargando…</p>}
        {!loading && pendientes.length === 0 && <p className="muted">—</p>}
        <ul className="items">
          {pendientes.map((p) => (
            <li key={p.idDoc} className="item">
              <div className="desc">
                <div className="name">
                  <strong>{p.name || "Paciente"}</strong>
                </div>
                <div className="meta">
                  <span>Cédula: {p.id || "—"}</span>
                  <span>Ingreso: {formatDate(p.createdAt)}</span>
                  <span>Fin: {p.treatmentEndDate ? formatDate(p.treatmentEndDate) : "—"}</span>
                </div>
              </div>
              <div className="actions">
                <button className="btn" onClick={() => verPaciente(p)}>Ver</button>
                <button className="btn success" onClick={() => activarPaciente(p)}>Activar</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="listBlock">
        <h3>Activos</h3>
        {loading && <p className="muted">Cargando…</p>}
        {!loading && activos.length === 0 && <p className="muted">—</p>}
        <ul className="items">
          {activos.map((p) => (
            <li key={p.idDoc} className="item">
              <div className="desc">
                <div className="name">
                  <strong>{p.name || "Paciente"}</strong>
                </div>
                <div className="meta">
                  <span>Cédula: {p.id || "—"}</span>
                  <span>Ingreso: {formatDate(p.createdAt)}</span>
                  <span>Fin: {p.treatmentEndDate ? formatDate(p.treatmentEndDate) : "—"}</span>
                </div>
              </div>
              <div className="actions">
                <button className="btn" onClick={() => verPaciente(p)}>Ver</button>
                <button className="btn danger" onClick={() => finalizarPaciente(p)}>Finalizar</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="listBlock">
        <h3>Finalizados</h3>
        {loading && <p className="muted">Cargando…</p>}
        {!loading && finalizados.length === 0 && <p className="muted">—</p>}
        <ul className="items">
          {finalizados.map((p) => (
            <li key={p.idDoc} className="item">
              <div className="desc">
                <div className="name">
                  <strong>{p.name || "Paciente"}</strong>
                </div>
                <div className="meta">
                  <span>Cédula: {p.id || "—"}</span>
                  <span>Ingreso: {formatDate(p.createdAt)}</span>
                  <span>Fin: {p.treatmentEndDate ? formatDate(p.treatmentEndDate) : "—"}</span>
                </div>
              </div>
              <div className="actions">
                <button className="btn" onClick={() => verPaciente(p)}>Ver</button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <style>{`
        .wrap {
          max-width: 980px;
          margin: 0 auto;
          padding: 24px 16px 64px;
        }
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }
        h1 { font-size: 28px; margin: 0; }
        h2 { font-size: 20px; margin: 0 0 12px 0; }
        h3 { font-size: 18px; margin: 20px 0 8px; }

        .card {
          background: #fff;
          border: 1px solid #e7e7e7;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
          margin-bottom: 16px;
        }

        .formGrid {
          display: grid;
          gap: 12px;
        }
        .formRow {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .formRow label {
          min-width: 260px;
          font-weight: 600;
        }
        .input {
          flex: 1;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 10px;
          font-size: 14px;
          background: #fff;
        }
        .formActions { margin-top: 4px; }

        .btn {
          border: 1px solid #d0d7de;
          background: #fff;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }
        .btn:hover { background: #f6f8fa; }
        .btn.primary {
          background: #0d6efd; border-color: #0d6efd; color: #fff;
        }
        .btn.primary:hover { filter: brightness(0.95); }
        .btn.success {
          background: #198754; border-color: #198754; color: #fff;
        }
        .btn.danger {
          background: #dc3545; border-color: #dc3545; color: #fff;
        }

        .listBlock { margin-top: 10px; }

        .items {
          list-style: none;
          padding: 0; margin: 6px 0 0 0;
          display: flex; flex-direction: column; gap: 8px;
        }
        .item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px;
          border: 1px solid #eee;
          border-radius: 10px;
          background: #fff;
        }
        .desc { display: flex; flex-direction: column; gap: 4px; }
        .name { font-size: 15px; }
        .meta {
          display: flex; flex-wrap: wrap; gap: 12px;
          color: #6c757d; font-size: 13px;
        }
        .actions { display: flex; gap: 8px; }
        .muted { color: #6c757d; }
      `}</style>
    </div>
  );
}
