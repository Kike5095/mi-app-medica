// src/components/VitalCharts.jsx
import { useEffect, useMemo, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { parseBP } from "../utils/bp";

import {
  Chart as ChartJS,
  LineElement, PointElement, LineController,
  CategoryScale, LinearScale, TimeScale, Tooltip, Legend
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement, PointElement, LineController,
  CategoryScale, LinearScale, TimeScale, Tooltip, Legend
);

const getBP = (r) => {
  if (typeof r.bpSys === "number" && typeof r.bpDia === "number") {
    return { sys: r.bpSys, dia: r.bpDia };
  }
  const parsed = parseBP(r.bp || r.ta);
  return { sys: parsed?.sys ?? null, dia: parsed?.dia ?? null };
};

export default function VitalCharts({ patientId }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!patientId) return;
    const col = collection(db, "patients", patientId, "vitals");
    const q = query(col, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRows(list);
    });
    return () => unsub();
  }, [patientId]);

  const data = useMemo(() => {
    const labels = rows.map(r => r.createdAt?.toDate?.()?.toLocaleString?.() || "");
    const fc   = rows.map(r => r.hr ?? r.fc ?? null);
    const fr   = rows.map(r => r.rr ?? r.fr ?? null);
    const spo2 = rows.map(r => r.spo2 ?? null);
    const temp = rows.map(r => r.temp ?? null);
    const taSys = rows.map(r => getBP(r).sys);
    const taDia = rows.map(r => getBP(r).dia);

    // Colores (Tailwind-ish)
    const cBlue   = "rgba(59,130,246,1)";   // azul
    const cEmerald= "rgba(16,185,129,1)";   // verde
    const cRose   = "rgba(244,63,94,1)";    // rojo/rose
    const cAmber  = "rgba(245,158,11,1)";   // ámbar
    const cPurple = "rgba(168,85,247,1)";   // morado

    const make = (label, arr, color) => ({
      labels,
      datasets: [{
        label,
        data: arr,
        borderColor: color,
        backgroundColor: color.replace(",1)", ",0.15)"),
        pointRadius: 2,
        borderWidth: 2,
        tension: 0.3,
      }]
    });

    return {
      fc:   make("Frecuencia cardiaca (lpm)",      fc,   cRose),
      fr:   make("Frecuencia respiratoria (rpm)",  fr,   cAmber),
      spo2: make("Saturación O₂ (%)",              spo2, cEmerald),
      temp: make("Temperatura (°C)",               temp, cPurple),
      ta: {
        labels,
        datasets: [
          {
            label: "Tensión sistólica (mmHg)",
            data: taSys,
            borderColor: cBlue,
            backgroundColor: cBlue.replace(",1)", ",0.15)"),
            pointRadius: 2,
            borderWidth: 2,
            tension: 0.3,
          },
          {
            label: "Tensión diastólica (mmHg)",
            data: taDia,
            borderColor: cPurple,
            backgroundColor: cPurple.replace(",1)", ",0.15)"),
            pointRadius: 2,
            borderWidth: 2,
            tension: 0.3,
          }
        ]
      }
    };
  }, [rows]);

  const opts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } },
    scales: {
      x: { ticks: { maxRotation: 0, autoSkip: true } },
      y: { beginAtZero: false }
    }
  };

  return (
    <div className="charts-wrap">
      <h3 style={{ marginTop: 0 }}>Gráficas</h3>

      <div className="chart-card">
        <Line data={data.fc} options={opts} />
      </div>

      <div className="chart-card">
        <Line data={data.fr} options={opts} />
      </div>

      <div className="chart-card">
        <Line data={data.ta} options={opts} />
      </div>

      <div className="chart-card">
        <Line data={data.spo2} options={opts} />
      </div>

      <div className="chart-card">
        <Line data={data.temp} options={opts} />
      </div>
    </div>
  );
}
