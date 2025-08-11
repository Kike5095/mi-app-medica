// src/components/VitalCharts.jsx
import { useEffect, useMemo, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

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

// helper TA "120/80"
function parseTA(s) {
  if (!s) return { sys: null, dia: null };
  const m = String(s).match(/(\d+)\s*\/\s*(\d+)/);
  if (!m) return { sys: null, dia: null };
  return { sys: Number(m[1]), dia: Number(m[2]) };
}

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
    const fc   = rows.map(r => r.fc ?? null);
    const fr   = rows.map(r => r.fr ?? null);
    const spo2 = rows.map(r => r.spo2 ?? null);
    const temp = rows.map(r => r.temp ?? null);
    const { sys: _, dia: __ } = parseTA(rows?.[0]?.ta); // evita TS warnings
    const taSys = rows.map(r => parseTA(r.ta).sys);
    const taDia = rows.map(r => parseTA(r.ta).dia);

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
