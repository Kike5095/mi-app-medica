// src/components/AuxiliarView.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  limit,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import VitalCharts from "./VitalCharts";
import { parseBP } from "../utils/bp";

export default function AuxiliarView() {
  const nav = useNavigate();

  const [cedulaBuscar, setCedulaBuscar] = useState("");
  const [paciente, setPaciente] = useState(null); // {id, nombre, cedula, estado, ...}
  const [info, setInfo] = useState("");
  const [chartData, setChartData] = useState([]);
  const vitalsUnsub = useRef(null);

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

  const normalizeRecord = (r) => {
    const toNumber = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    let t = new Date();
    const c = r.createdAt;
    if (c?.toDate) t = c.toDate();
    else if (c?.seconds) t = new Date(c.seconds * 1000);
    else if (c instanceof Date) t = c;

    let sys = r.bpSys;
    let dia = r.bpDia;
    if ((sys == null || dia == null) && r.bp) {
      const parsed = parseBP(r.bp);
      if (parsed) {
        sys = parsed.sys;
        dia = parsed.dia;
      }
    }

    return {
      t,
      hr: toNumber(r.hr ?? r.fc),
      rr: toNumber(r.rr ?? r.fr),
      temp: toNumber(r.temp),
      spo2: toNumber(r.spo2),
      sys: toNumber(sys),
      dia: toNumber(dia),
    };
  };

  const subscribeVitals = (patientId) => {
    if (vitalsUnsub.current) {
      vitalsUnsub.current();
      vitalsUnsub.current = null;
    }
    const col = collection(db, "patients", patientId, "vitals");
    const q = query(col, orderBy("createdAt", "asc"));
    vitalsUnsub.current = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => normalizeRecord(d.data()));
      setChartData(rows);
    });
  };

  const buscarPaciente = async () => {
    setInfo("");
    setPaciente(null);
    setChartData([]);
    if (vitalsUnsub.current) {
      vitalsUnsub.current();
      vitalsUnsub.current = null;
    }

    const ced = cedulaBuscar.trim();
    if (!ced) {
      setInfo("Escribe una cédula para buscar.");
      return;
    }
    try {
      const col = collection(db, "patients");
      let q;
      try {
        q = query(col, where("cedula", "==", ced), limit(1));
      } catch {
        q = query(col, limit(1));
      }

      const snap = await getDocs(q);
      const match = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .find((p) => String(p.cedula) === ced);

      if (!match) {
        setPaciente(null);
        setInfo("Paciente no encontrado");
        return;
      }
      setPaciente(match);
      subscribeVitals(match.id);
    } catch (e) {
      console.error(e);
      setInfo("Error al buscar paciente.");
    }
  };

  const registrarSignos = async (e) => {
    e.preventDefault();
    if (!paciente) return;

    const toNumber = (v) => {
      if (v === "") return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    };

    let parsedBP = null;
    if (ta.trim()) {
      parsedBP = parseBP(ta);
      if (!parsedBP) {
        setInfo("Formato de PA inválido. Ej: 120/80");
        return;
      }
    }

    try {
      const vitalsCol = collection(db, "patients", paciente.id, "vitals");
      const data = { createdAt: serverTimestamp() };
      const hrN = toNumber(fc);
      const rrN = toNumber(fr);
      const tempN = toNumber(temp);
      const spo2N = toNumber(spo2);
      if (hrN !== undefined) data.hr = hrN;
      if (rrN !== undefined) data.rr = rrN;
      if (tempN !== undefined) data.temp = tempN;
      if (spo2N !== undefined) data.spo2 = spo2N;
      if (nota.trim()) data.notes = nota.trim();
      if (parsedBP) {
        data.bp = parsedBP.text;
        data.bpSys = parsedBP.sys;
        data.bpDia = parsedBP.dia;
      }
      await addDoc(vitalsCol, data);

      // limpiar formulario
      setFc("");
      setFr("");
      setTa("");
      setSpo2("");
      setTemp("");
      setNota("");
      setInfo("Signos registrados ✅");
    } catch (e) {
      console.error(e);
      setInfo("No se pudo registrar. Revisa la conexión / permisos.");
    }
  };

  useEffect(() => {
    return () => {
      if (vitalsUnsub.current) {
        vitalsUnsub.current();
        vitalsUnsub.current = null;
      }
    };
  }, []);

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
              onKeyDown={e => e.key === "Enter" && buscarPaciente()}
            />
            <button onClick={buscarPaciente}>Buscar</button>
          </div>

          {info && <p style={{ color: info.includes("✅") ? "green" : "crimson" }}>{info}</p>}

          {/* Ficha de paciente */}
          {paciente && (
            <>
              <h2>Paciente</h2>
              <p>
                <b>Nombre:</b>{" "}
                {(
                  paciente.nombreCompleto ||
                  `${paciente.firstName || ""} ${paciente.lastName || ""}`.trim()
                ) || ""}
              </p>
              <p><b>Cédula:</b> {paciente.cedula}</p>
              <p><b>Estado:</b> {paciente.status || paciente.estado || "-"}</p>

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
          {paciente && <VitalCharts data={chartData} />}
        </div>
      </div>
    </div>
  );
}
