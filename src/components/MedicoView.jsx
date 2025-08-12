// src/components/MedicoView.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import LogoutButton from "./LogoutButton";

export default function MedicoView() {
  const nav = useNavigate();
  const { state } = useLocation() || {};
  const [user, setUser] = useState(
    state?.user || JSON.parse(localStorage.getItem("user") || "{}")
  );

  const [activos, setActivos] = useState([]);
  const [finalizados, setFinalizados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const col = collection(db, "patients");
    const unsub = onSnapshot(
      col,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const act = rows.filter(
          (p) => (p.status || "").toLowerCase() === "activo"
        );
        const fin = rows.filter(
          (p) => (p.status || "").toLowerCase() === "finalizado"
        );

        const byDate = (a, b, field) =>
          (b[field]?.seconds || b[field] || 0) - (a[field]?.seconds || a[field] || 0);

        setActivos([...act].sort((a, b) => byDate(a, b, "fechaIngreso")));
        setFinalizados([...fin].sort((a, b) => byDate(a, b, "fechaFin")));
        setCargando(false);
      },
      (e) => {
        console.error(e);
        setError("No pude cargar los pacientes.");
        setCargando(false);
      }
    );
    return () => unsub();
  }, []);

  function formatDate(ts) {
    if (!ts) return "-";
    const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    if (isNaN(d.getTime())) return "-";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  const finalizar = async (p) => {
    try {
      await updateDoc(doc(db, "patients", p.id), {
        status: "finalizado",
        fechaFin: serverTimestamp(),
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="section-header">
          <h1 className="section-title">Panel Médico</h1>
          <LogoutButton />
        </div>

        <section>
          {user?.nombre && (
            <p>
              <b>Médico:</b> {user.nombre}
            </p>
          )}
          {user?.email && (
            <p>
              <b>Email:</b> {user.email}
            </p>
          )}
        </section>

        {cargando && <p>Cargando pacientes…</p>}
        {error && <p className="error">{error}</p>}

        <section>
          <h2>Pacientes activos</h2>
          {activos.length === 0 ? (
            <p>No hay pacientes activos.</p>
          ) : (
            <ul>
              {activos.map((p) => (
                <li key={p.id} className="card">
                  <div className="card-body">
                    <div>
                      <b>
                        {
                          p.nombreCompleto ||
                          `${p.firstName || ""} ${p.lastName || ""}`.trim() ||
                          "—"
                        }
                      </b>
                      {" "}— Cédula: {p.cedula || "—"} — Ingreso: {formatDate(p.fechaIngreso)}
                    </div>
                    <div>
                      <button
                        className="btn"
                        onClick={() => nav(`/paciente/${p.id}`)}
                      >
                        Ver
                      </button>
                      <button
                        className="btn danger"
                        onClick={() => finalizar(p)}
                      >
                        Finalizar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2>Pacientes finalizados</h2>
          {finalizados.length === 0 ? (
            <p>No hay pacientes finalizados.</p>
          ) : (
            <ul>
              {finalizados.map((p) => (
                <li key={p.id} className="card">
                  <div className="card-body">
                    <div>
                      <b>
                        {
                          p.nombreCompleto ||
                          `${p.firstName || ""} ${p.lastName || ""}`.trim() ||
                          "—"
                        }
                      </b>
                      {" "}— Cédula: {p.cedula || "—"} — Fin: {formatDate(p.fechaFin)}
                    </div>
                    <div>
                      <button
                        className="btn"
                        onClick={() => nav(`/paciente/${p.id}`)}
                      >
                        Ver
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

