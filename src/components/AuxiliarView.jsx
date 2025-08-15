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
import RoleSwitcher from "./RoleSwitcher";
import TopBar from "./TopBar";
import SuperNav from "./SuperNav";
import { parseBP as parseBPRaw } from "../utils/bp";
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
  const [loading, setLoading] = useState(false);

  // formulario signos
  const [fc, setFc] = useState("");
  const [fr, setFr] = useState("");
  const [paSys, setPaSys] = useState("");
  const [paDia, setPaDia] = useState("");
  const [spo2, setSpo2] = useState("");
  const [temp, setTemp] = useState("");
  const [nota, setNota] = useState("");
  const [errors, setErrors] = useState({});
  const fcRef = useRef(null);
  const frRef = useRef(null);
  const paRef = useRef(null);
  const spo2Ref = useRef(null);
  const tempRef = useRef(null);

  const num = (v) => Number(String(v).replace(",", ".").trim());

  const handleFcChange = (e) => {
    const v = e.target.value;
    setFc(v);
    setErrors((prev) => {
      const { fc, ...rest } = prev;
      const n = num(v);
      if (!Number.isInteger(n) || n < 30 || n > 220) {
        return { ...rest, fc: "Ingrese FC válida (30–220)." };
      }
      return rest;
    });
  };

  const handleFrChange = (e) => {
    const v = e.target.value;
    setFr(v);
    setErrors((prev) => {
      const { fr, ...rest } = prev;
      const n = num(v);
      if (!Number.isInteger(n) || n < 5 || n > 60) {
        return { ...rest, fr: "Ingrese FR válida (5–60)." };
      }
      return rest;
    });
  };

  const handlePaSysChange = (e) => {
    const v = e.target.value;
    setPaSys(v);
    setErrors((prev) => {
      const { pa, ...rest } = prev;
      const err = validatePa(v, paDia);
      return err ? { ...rest, pa: err } : rest;
    });
  };

  const handlePaDiaChange = (e) => {
    const v = e.target.value;
    setPaDia(v);
    setErrors((prev) => {
      const { pa, ...rest } = prev;
      const err = validatePa(paSys, v);
      return err ? { ...rest, pa: err } : rest;
    });
  };

  const handleSpo2Change = (e) => {
    const v = e.target.value;
    setSpo2(v);
    setErrors((prev) => {
      const { spo2, ...rest } = prev;
      const n = num(v);
      if (!Number.isInteger(n) || n < 50 || n > 100) {
        return { ...rest, spo2: "Ingrese SpO₂ válida (50–100)." };
      }
      return rest;
    });
  };

  const handleTempChange = (e) => {
    const v = e.target.value;
    setTemp(v);
    setErrors((prev) => {
      const { temp, ...rest } = prev;
      const n = num(v);
      if (!Number.isFinite(n) || n < 30 || n > 45) {
        return { ...rest, temp: "Ingrese Temp válida (30–45)." };
      }
      return rest;
    });
  };

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
      const parsed = parseBPRaw(r.bp);
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


  const resetForm = () => {
    setFc("");
    setFr("");
    setPaSys("");
    setPaDia("");
    setSpo2("");
    setTemp("");
    setNota("");
    setErrors({});
    fcRef.current?.focus();
  };

  const validatePa = (s, d) => {
    const sysVal = parseInt(s, 10);
    const diaVal = parseInt(d, 10);
    if (
      !Number.isInteger(sysVal) ||
      !Number.isInteger(diaVal) ||
      sysVal < 70 ||
      sysVal > 260 ||
      diaVal < 40 ||
      diaVal > 160 ||
      sysVal <= diaVal
    ) {
      return "Ingrese TA válida (sistólica 70–260, diastólica 40–160 y sistólica mayor que diastólica).";
    }
    return null;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!paciente || loading) return;
    setLoading(true);
    setErrors({});

    const now = new Date();
    const fcVal = num(fc);
    const frVal = num(fr);
    const tempVal = num(temp);
    const spo2Val = num(spo2);
    const sys = parseInt(paSys, 10);
    const dia = parseInt(paDia, 10);
    const taString = Number.isFinite(sys) && Number.isFinite(dia) ? `${sys}/${dia}` : "";

    const newErrors = {};
    if (!Number.isInteger(fcVal) || fcVal < 30 || fcVal > 220)
      newErrors.fc = "Ingrese FC válida (30–220).";
    if (!Number.isInteger(frVal) || frVal < 5 || frVal > 60)
      newErrors.fr = "Ingrese FR válida (5–60).";
    const paError = validatePa(paSys, paDia);
    if (paError) newErrors.pa = paError;
    if (!Number.isInteger(spo2Val) || spo2Val < 50 || spo2Val > 100)
      newErrors.spo2 = "Ingrese SpO₂ válida (50–100).";
    if (!Number.isFinite(tempVal) || tempVal < 30 || tempVal > 45)
      newErrors.temp = "Ingrese Temp válida (30–45).";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      setLoading(false);
      const first = ["fc", "fr", "pa", "spo2", "temp"].find((f) => newErrors[f]);
      if (first === "fc") fcRef.current?.focus();
      else if (first === "fr") frRef.current?.focus();
      else if (first === "pa") paRef.current?.focus();
      else if (first === "spo2") spo2Ref.current?.focus();
      else if (first === "temp") tempRef.current?.focus();
      return;
    }

    try {
      const patientRef = doc(db, "patients", paciente.id);
      const vitalsRef = collection(patientRef, "vitals");
      const q = query(vitalsRef, orderBy("createdAt", "desc"), limit(1));
      const snap = await getDocs(q);
      const last = snap.docs[0]?.data();
      const lastMs = last?.createdAt?.toMillis?.() ?? 0;

      const payload = {
        fc: fcVal,
        fr: frVal,
        paSys: Number.isFinite(sys) ? sys : null,
        paDia: Number.isFinite(dia) ? dia : null,
        ta: taString,
        spo2: spo2Val,
        temp: tempVal,
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
        setLoading(false);
        return;
      }

      const docRef = doc(vitalsRef, minuteKey(now));
      await setDoc(docRef, payload, { merge: false });
      resetForm();
      alert("Signos registrados");
    } catch (err) {
      console.error(err);
      alert("Error al guardar los signos");
    } finally {
      setLoading(false);
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
      {isSuperAdminLocal() && <SuperNav />}
      <div className="container">
        <TopBar title="Panel Auxiliar" />
        <div className="section-header">
          <h1 className="section-title">Auxiliar – Registro de signos</h1>
          <div style={{ display: "flex", gap: 8 }}>
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
                      <strong>Nombre:</strong>{" "}
                      <span className="no-detect">
                        {(
                          paciente.nombreCompleto ||
                          `${paciente.firstName || ""} ${paciente.lastName || ""}`.trim()
                        ) || "—"}
                      </span>
                    </p>
                    <p>
                      <strong>Cédula:</strong>{" "}
                      <span className="no-detect">{paciente.cedula || "—"}</span>
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
                        ref={fcRef}
                        className="input"
                        placeholder="Frecuencia cardiaca (lpm)"
                        value={fc}
                        onChange={handleFcChange}
                        required
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                      {errors.fc && (
                        <p style={{ color: "crimson", fontSize: "0.8em" }}>{errors.fc}</p>
                      )}
                      <input
                        ref={frRef}
                        className="input"
                        placeholder="Frecuencia respiratoria (rpm)"
                        value={fr}
                        onChange={handleFrChange}
                        required
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                      {errors.fr && (
                        <p style={{ color: "crimson", fontSize: "0.8em" }}>{errors.fr}</p>
                      )}
                      <div className="field">
                        <label style={{display:"block", fontWeight:600, marginBottom:6}}>
                          Tensión arterial (mmHg)
                        </label>
                        <div style={{display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:8, alignItems:"center"}}>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="Sistólica (ej: 120)"
                            value={paSys}
                            onChange={handlePaSysChange}
                            className="input"
                            ref={paRef}
                            required
                          />
                          <span style={{opacity:0.6}}>/</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="Diastólica (ej: 80)"
                            value={paDia}
                            onChange={handlePaDiaChange}
                            className="input"
                            required
                          />
                        </div>
                      </div>
                      {errors.pa && (
                        <p style={{ color: "crimson", fontSize: "0.8em" }}>{errors.pa}</p>
                      )}
                      <input
                        ref={spo2Ref}
                        className="input"
                        placeholder="Saturación O₂ (%)"
                        value={spo2}
                        onChange={handleSpo2Change}
                        required
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                      {errors.spo2 && (
                        <p style={{ color: "crimson", fontSize: "0.8em" }}>{errors.spo2}</p>
                      )}
                      <input
                        ref={tempRef}
                        className="input"
                        placeholder="Temperatura (°C)"
                        value={temp}
                        onChange={handleTempChange}
                        required
                        inputMode="numeric"
                        pattern="[0-9.,]*"
                      />
                      {errors.temp && (
                        <p style={{ color: "crimson", fontSize: "0.8em" }}>{errors.temp}</p>
                      )}
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
                        disabled={
                          loading ||
                          !paciente ||
                          Object.keys(errors).length > 0 ||
                          !fc ||
                          !fr ||
                          !paSys ||
                          !paDia ||
                          !spo2 ||
                          !temp
                        }
                      >
                        {loading ? "Guardando…" : "Registrar signos"}
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
