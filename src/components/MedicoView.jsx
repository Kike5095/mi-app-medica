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
import { asDate, ingresoDisplay, finDisplay } from "../utils/dates";

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
          (asDate(b[field])?.getTime() || 0) - (asDate(a[field])?.getTime() || 0);

        setActivos([...act].sort((a, b) => byDate(a, b, "ingresoAt")));
        setFinalizados([...fin].sort((a, b) => byDate(a, b, "finAt")));
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


  const finalizar = async (p) => {
    try {
      const ts = serverTimestamp();
      await updateDoc(doc(db, "patients", p.id), {
        status: "finalizado",
        finAt: ts,
        fechaFin: ts,
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
              {activos.map((p) => {
                const ingreso = ingresoDisplay(p);
                const fin = finDisplay(p);
                return (
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
                        {" "}— Cédula: {p.cedula || "—"} — Ingreso: {ingreso} — Fin: {fin}
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
                );
              })}
            </ul>
          )}
        </section>

        <section>
          <h2>Pacientes finalizados</h2>
          {finalizados.length === 0 ? (
            <p>No hay pacientes finalizados.</p>
          ) : (
            <ul>
              {finalizados.map((p) => {
                const ingreso = ingresoDisplay(p);
                const fin = finDisplay(p);
                return (
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
                        {" "}— Cédula: {p.cedula || "—"} — Ingreso: {ingreso} — Fin: {fin}
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
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

