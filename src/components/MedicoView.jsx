// src/components/MedicoView.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db, auth } from "../firebaseConfig";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

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

  const logout = async () => {
    try {
      localStorage.removeItem("user");
      if (auth?.signOut) await auth.signOut();
    } catch {}
    nav("/");
  };

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
    <div style={{ maxWidth: 900, margin: "20px auto", padding: "0 12px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Panel Médico</h1>
        <div>
          <button onClick={logout} style={{ padding: "6px 12px" }}>Salir</button>
        </div>
      </header>

      <section style={{ margin: "12px 0 24px" }}>
        {user?.nombre && <p style={{ margin: 0 }}><b>Médico:</b> {user.nombre}</p>}
        {user?.email && <p style={{ margin: 0 }}><b>Email:</b> {user.email}</p>}
      </section>

      {cargando && <p>Cargando pacientes…</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <section style={{ marginTop: 16 }}>
        <h2>Pacientes activos</h2>
        {activos.length === 0 ? (
          <p style={{ color: "#666" }}>No hay pacientes activos.</p>
        ) : (
          <ul>
            {activos.map((p) => (
              <li key={p.id} style={{ marginBottom: 6 }}>
                <b>
                  {(
                    p.nombreCompleto ||
                    `${p.firstName || ""} ${p.lastName || ""}`.trim() ||
                    "—"
                  )}
                </b>
                {" "}— Cédula: {p.cedula || "—"} — Ingreso: {formatDate(p.fechaIngreso)}
                <button
                  onClick={() => nav(`/paciente/${p.id}`)}
                  style={{ marginLeft: 8 }}
                >
                  Ver
                </button>
                <button
                  onClick={() => finalizar(p)}
                  style={{ marginLeft: 8 }}
                >
                  Finalizar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: 16 }}>
        <h2>Pacientes finalizados</h2>
        {finalizados.length === 0 ? (
          <p style={{ color: "#666" }}>No hay pacientes finalizados.</p>
        ) : (
          <ul>
            {finalizados.map((p) => (
              <li key={p.id} style={{ marginBottom: 6 }}>
                <b>
                  {(
                    p.nombreCompleto ||
                    `${p.firstName || ""} ${p.lastName || ""}`.trim() ||
                    "—"
                  )}
                </b>
                {" "}— Cédula: {p.cedula || "—"} — Fin: {formatDate(p.fechaFin)}
                <button
                  onClick={() => nav(`/paciente/${p.id}`)}
                  style={{ marginLeft: 8 }}
                >
                  Ver
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
