// src/components/MedicoView.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db, auth } from "../firebaseConfig";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";

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

  const cargarPacientes = async () => {
    setCargando(true);
    setError("");
    try {
      const col = collection(db, "patients");

      // activos
      let qActivos;
      try { qActivos = query(col, where("estado", "==", "activo")); }
      catch { qActivos = col; }
      const snapA = await getDocs(qActivos);
      const A = snapA.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(p => (p.estado || "").toLowerCase() === "activo");

      // finalizados
      let qFin;
      try { qFin = query(col, where("estado", "==", "finalizado")); }
      catch { qFin = col; }
      const snapF = await getDocs(qFin);
      const F = snapF.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(p => (p.estado || "").toLowerCase() === "finalizado");

      const byDate = (a, b) =>
        (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);

      setActivos([...A].sort(byDate));
      setFinalizados([...F].sort(byDate));
    } catch (e) {
      console.error(e);
      setError("No pude cargar los pacientes.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarPacientes(); }, []);

  const logout = async () => {
    try {
      localStorage.removeItem("user");
      if (auth?.signOut) await auth.signOut();
    } catch {}
    nav("/");
  };

  const crearPacienteDemo = async () => {
    try {
      await addDoc(collection(db, "patients"), {
        nombre: "Paciente",
        apellido: "Demo",
        cedula: String(Math.floor(Math.random() * 100000000)).padStart(8, "0"),
        estado: "activo",
        createdAt: { seconds: Math.floor(Date.now() / 1000) },
      });
      await cargarPacientes();
      alert("Paciente demo creado ✅");
    } catch (e) {
      console.error(e);
      alert("No pude crear el demo :(");
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

      <div style={{ marginBottom: 12 }}>
        <button onClick={crearPacienteDemo}>Crear paciente demo</button>
        <button onClick={cargarPacientes} style={{ marginLeft: 8 }}>
          Recargar lista
        </button>
      </div>

      {cargando && <p>Cargando pacientes…</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <section style={{ marginTop: 16 }}>
        <h2>Pacientes activos</h2>
        {activos.length === 0 ? (
          <p style={{ color: "#666" }}>No hay pacientes activos.</p>
        ) : (
          <ul>
            {activos.map(p => (
              <li key={p.id} style={{ marginBottom: 6 }}>
                <b>{p.nombre} {p.apellido}</b> — Cédula: {p.cedula}
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

      <section style={{ marginTop: 16 }}>
        <h2>Pacientes finalizados</h2>
        {finalizados.length === 0 ? (
          <p style={{ color: "#666" }}>No hay pacientes finalizados.</p>
        ) : (
          <ul>
            {finalizados.map(p => (
              <li key={p.id} style={{ marginBottom: 6 }}>
                <b>{p.nombre} {p.apellido}</b> — Cédula: {p.cedula}
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
