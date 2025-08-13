// src/components/AuxiliarView.jsx
import { useEffect, useRef, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  limit,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import VitalCharts from "./VitalCharts";
import LogoutButton from "./LogoutButton";
import RoleSwitcher from "./RoleSwitcher";
import { parseBP } from "../utils/bp";
import { finDisplay } from "../utils/dates";
import { isAdmin as _isAdmin, assertAdmin as _assertAdmin } from "../utils/roles";
import { isSuperAdminLocal } from "../lib/users";

function showVal(v) {
  return v || v === 0 ? String(v) : "—";
}

function truncate(t, n = 40) {
  if (!t) return "—";
  return t.length > n ? t.slice(0, n) + "…" : t;
}

export default function AuxiliarView() {

  const [cedulaBuscar, setCedulaBuscar] = useState("");
  const [paciente, setPaciente] = useState(null); // {id, nombre, cedula, estado, ...}
  const [info, setInfo] = useState("");
  const [chartData, setChartData] = useState([]);
  const vitalsUnsub = useRef(null);
  const [saving, setSaving] = useState(false);

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
    else if (r.clientAt) t = new Date(r.clientAt);

    let sys = r.paSys ?? r.bpSys;
    let dia = r.paDia ?? r.bpDia;
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
      const rows = snap.docs
        .map((d) => normalizeRecord(d.data()))
        .sort((a, b) => a.t - b.t);
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

  function minuteKey(d = new Date()) {
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}`;
  }

  function parsePA(input = "") {
    const parts = String(input).replace(/[^\d]/g, " ").trim().split(/\s+/);
    if (parts.length >= 2) {
      const [s, d] = parts
        .map((x) => parseInt(x, 10))
        .filter(Number.isFinite);
      if (s > 0 && d > 0) return { paSys: s, paDia: d };
    }
    return { paSys: null, paDia: null };
  }

  const resetForm = () => {
    setFc("");
    setFr("");
    setTa("");
    setSpo2("");
    setTemp("");
    setNota("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!paciente) return;
    const now = new Date();
    setSaving(true);
    try {
      const patientRef = doc(db, "patients", paciente.id);
      const vitalsRef = collection(patientRef, "vitals");

      const q = query(vitalsRef, orderBy("createdAt", "desc"), limit(1));
      const snap = await getDocs(q);
      const last = snap.docs[0]?.data();
      const lastMs = last?.createdAt?.toMillis?.() ?? 0;

      const { paSys, paDia } = parsePA(ta);
      const payload = {
        temp: Number(temp) || null,
        fc: Number(fc) || null,
        fr: Number(fr) || null,
        spo2: Number(spo2) || null,
        paSys,
        paDia,
        note: (nota || "").trim(),
        createdAt: serverTimestamp(),
        clientAt: now.toISOString(),
      };

      const isSameAsLast =
        last &&
        Math.abs(Date.now() - lastMs) < 20000 &&
        (last.temp ?? null) === payload.temp &&
        (last.fc ?? null) === payload.fc &&
        (last.fr ?? null) === payload.fr &&
        (last.spo2 ?? null) === payload.spo2 &&
        (last.paSys ?? last.bpSys ?? null) === payload.paSys &&
        (last.paDia ?? last.bpDia ?? null) === payload.paDia &&
        (last.note ?? last.notes ?? "") === payload.note;

      if (isSameAsLast) {
        alert("Ya existe un registro muy reciente con los mismos datos.");
        return;
      }

      const docRef = doc(vitalsRef, minuteKey(now));
      await setDoc(docRef, payload, { merge: false });

      resetForm();
      alert("Signos guardados.");
    } finally {
      setSaving(false);
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
    <div className="page">
      <div className="container">
        <div className="section-header">
          <h1 className="section-title">Auxiliar – Registro de signos</h1>
          <div style={{ display: "flex", gap: 8 }}>
            <LogoutButton />
            {isSuperAdminLocal() && <RoleSwitcher />}
          </div>
        </div>

        <div className="twocol">
          {/* ========== Columna izquierda ========== */}
          <div>
            <section className="card">
              <div className="card-body">
                {/* Buscar paciente */}
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                  <label style={{ whiteSpace: "nowrap" }}>Cédula del paciente:</label>
                  <input
                    className="input"
                    placeholder="Ej: 32280664"
                    style={{ maxWidth: 220 }}
                    value={cedulaBuscar}
                    onChange={(e) => setCedulaBuscar(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && buscarPaciente()}
                  />
                  <button className="btn" onClick={buscarPaciente}>Buscar</button>
                </div>

                {info && (
                  <p style={{ color: info.includes("✅") ? "green" : "crimson" }}>{info}</p>
                )}

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
                    <p>
                      <b>Cédula:</b> {paciente.cedula}
                    </p>
                    <p>
                      <b>Estado:</b> {paciente.status || paciente.estado || "-"}
                    </p>
                    <p>
                      <b>Edad:</b> {showVal(paciente?.edad)}
                    </p>
                    <p>
                      <b>Diagnóstico:</b> {truncate(paciente?.diagnostico, 80)}
                    </p>
                    <p>
                      <b>Fin:</b> {finDisplay(paciente)}
                    </p>

                    <h2>Nuevo registro de signos</h2>
                    <form style={{ display: "grid", gap: 8, maxWidth: 600 }}>
                      <input
                        className="input"
                        placeholder="Frecuencia cardiaca (lpm)"
                        value={fc}
                        onChange={(e) => setFc(e.target.value)}
                      />
                      <input
                        className="input"
                        placeholder="Frecuencia respiratoria (rpm)"
                        value={fr}
                        onChange={(e) => setFr(e.target.value)}
                      />
                      <input
                        className="input"
                        placeholder="Tensión arterial (mmHg, ej: 120/80)"
                        value={ta}
                        onChange={(e) => setTa(e.target.value)}
                      />
                      <input
                        className="input"
                        placeholder="Saturación O₂ (%)"
                        value={spo2}
                        onChange={(e) => setSpo2(e.target.value)}
                      />
                      <input
                        className="input"
                        placeholder="Temperatura (°C)"
                        value={temp}
                        onChange={(e) => setTemp(e.target.value)}
                      />
                      <textarea
                        className="textarea"
                        placeholder="Nota de enfermería"
                        value={nota}
                        onChange={(e) => setNota(e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn primary"
                        onClick={handleSave}
                        disabled={saving || !paciente}
                      >
                        {saving ? "Guardando…" : "Registrar signos"}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </section>
          </div>

          {/* ========== Columna derecha: gráficas ========== */}
          <div>
            {paciente && (
              <section className="card">
                <div className="card-body">
                  <VitalCharts data={chartData} />
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
