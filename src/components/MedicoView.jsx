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
          <h1 className="section-title">Pacientes</h1>
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

        <section className="card">
          <div className="card-body">
            <h2>Activos</h2>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Cédula</th>
                    <th>Edad</th>
                    <th>Diagnóstico</th>
                    <th>Ingreso</th>
                    <th>Fin</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {activos.length === 0 ? (
                    <tr>
                      <td colSpan={7}>No hay pacientes</td>
                    </tr>
                  ) : (
                    activos.map((p) => {
                      const nombre =
                        p.nombreCompleto ||
                        `${p.firstName || ""} ${p.lastName || ""}` ||
                        "—";
                      const ced = p.cedula || "—";
                      const edadTxt =
                        p.edad || p.edad === 0 ? String(p.edad) : "—";
                      const dxTxt = p.diagnostico
                        ? p.diagnostico.length > 30
                          ? p.diagnostico.slice(0, 30) + "…"
                          : p.diagnostico
                        : "—";
                      return (
                        <tr key={p.id}>
                          <td>{nombre}</td>
                          <td>{ced}</td>
                          <td>{edadTxt}</td>
                          <td title={p.diagnostico || ""}>{dxTxt}</td>
                          <td>{ingresoDisplay(p)}</td>
                          <td>{finDisplay(p)}</td>
                          <td>
                            <div style={{ display: "flex", gap: 8 }}>
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
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-body">
            <h2>Finalizados</h2>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Cédula</th>
                    <th>Edad</th>
                    <th>Diagnóstico</th>
                    <th>Ingreso</th>
                    <th>Fin</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {finalizados.length === 0 ? (
                    <tr>
                      <td colSpan={7}>No hay pacientes</td>
                    </tr>
                  ) : (
                    finalizados.map((p) => {
                      const nombre =
                        p.nombreCompleto ||
                        `${p.firstName || ""} ${p.lastName || ""}` ||
                        "—";
                      const ced = p.cedula || "—";
                      const edadTxt =
                        p.edad || p.edad === 0 ? String(p.edad) : "—";
                      const dxTxt = p.diagnostico
                        ? p.diagnostico.length > 30
                          ? p.diagnostico.slice(0, 30) + "…"
                          : p.diagnostico
                        : "—";
                      return (
                        <tr key={p.id}>
                          <td>{nombre}</td>
                          <td>{ced}</td>
                          <td>{edadTxt}</td>
                          <td title={p.diagnostico || ""}>{dxTxt}</td>
                          <td>{ingresoDisplay(p)}</td>
                          <td>{finDisplay(p)}</td>
                          <td>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button
                                className="btn"
                                onClick={() => nav(`/paciente/${p.id}`)}
                              >
                                Ver
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

