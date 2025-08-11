// src/components/AuxiliarView.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addDoc, collection, doc, getDocs, getDoc,
  orderBy, query, serverTimestamp, where
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import VitalCharts from "./VitalCharts";

export default function AuxiliarView() {
  const nav = useNavigate();

  const [cedulaBuscar, setCedulaBuscar] = useState("");
  const [paciente, setPaciente] = useState(null); // {id, nombre, cedula, estado, ...}
  const [info, setInfo] = useState("");

  // formulario signos
  const [fc, setFc] = useState("");
  const [fr, setFr] = useState("");
  const [ta, setTa] = useState("");    // "120/80"
  const [spo2, setSpo2] = useState("");
  const [temp, setTemp] = useState("");
  const [nota, setNota] = useState("");

  // Si llegas desde el médico copiando una cédula al clipboard, intenta pegarla auto (opcional)
  useEffect(() => {
    // noop
  }, []);

  const buscarPaciente = async () => {
    setInfo("");
    setPaciente(null);

    const ced = cedulaBuscar.trim();
    if (!ced) {
      setInfo("Escribe una cédula para buscar.");
      return;
    }
    try {
      const col = collection(db, "patients");
      let q;
      try { q = query(col, where("cedula", "==", ced)); }
      catch { q = col; } // fallback si reglas o índices faltan

      const snap = await getDocs(q);
      const match = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .find(p => String(p.cedula) === ced);

      if (!match) {
        setInfo("No se encontró paciente con esa cédula.");
        return;
      }
      setPaciente(match);
    } catch (e) {
      console.error(e);
      setInfo("Error al buscar paciente.");
    }
  };

  const registrarSignos = async (e) => {
    e.preventDefault();
    if (!paciente) return;

    // Validaciones mínimas (opcionales)
    const numOrNull = (v) => v === "" ? null : Number(v);

    try {
      const vitalsCol = collection(db, "patients", paciente.id, "vitals");
      await addDoc(vitalsCol, {
        fc: numOrNull(fc),
        fr: numOrNull(fr),
        ta: ta || null,         // "120/80"
        spo2: numOrNull(spo2),
        temp: numOrNull(temp),
        nota: nota || null,
        createdAt: serverTimestamp(),
      });

      // limpiar formulario
      setFc(""); setFr(""); setTa(""); setSpo2(""); setTemp(""); setNota("");
      setInfo("Signos registrados ✅");
    } catch (e) {
      console.error(e);
      setInfo("No se pudo registrar. Revisa la conexión / permisos.");
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "20px auto", padding: "0 12px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h1>Auxiliar – Registro de signos</h1>
        <button onClick={() => nav("/")} >Salir</button>
      </header>

      <div className="twocol">
        {/* ========== Columna izquierda ========== */}
        <div>
          {/* Buscar paciente */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
            <label style={{ whiteSpace: "nowrap" }}>Cédula del paciente:</label>
            <input
              placeholder="Ej: 32280664"
              style={{ maxWidth: 220 }}
              value={cedulaBuscar}
              onChange={e => setCedulaBuscar(e.target.value)}
            />
            <button onClick={buscarPaciente}>Buscar</button>
          </div>

          {info && <p style={{ color: info.includes("✅") ? "green" : "crimson" }}>{info}</p>}

          {/* Ficha de paciente */}
          {paciente && (
            <>
              <h2>Paciente</h2>
              <p><b>Nombre:</b> {paciente.nombre || "—"}</p>
              <p><b>Cédula:</b> {paciente.cedula}</p>
              <p><b>Estado:</b> {paciente.estado || "—"}</p>

              <h2>Nuevo registro de signos</h2>
              <form onSubmit={registrarSignos} style={{ display: "grid", gap: 8, maxWidth: 600 }}>
                <input
                  placeholder="Frecuencia cardiaca (lpm)"
                  value={fc} onChange={e => setFc(e.target.value)}
                />
                <input
                  placeholder="Frecuencia respiratoria (rpm)"
                  value={fr} onChange={e => setFr(e.target.value)}
                />
                <input
                  placeholder="Tensión arterial (mmHg, ej: 120/80)"
                  value={ta} onChange={e => setTa(e.target.value)}
                />
                <input
                  placeholder="Saturación O₂ (%)"
                  value={spo2} onChange={e => setSpo2(e.target.value)}
                />
                <input
                  placeholder="Temperatura (°C)"
                  value={temp} onChange={e => setTemp(e.target.value)}
                />
                <textarea
                  placeholder="Nota de enfermería"
                  value={nota} onChange={e => setNota(e.target.value)}
                />
                <button className="primary">Registrar signos</button>
              </form>
            </>
          )}
        </div>

        {/* ========== Columna derecha: gráficas ========== */}
        <div>
          {paciente && <VitalCharts patientId={paciente.id} />}
        </div>
      </div>
    </div>
  );
}
