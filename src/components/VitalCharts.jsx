// src/components/VitalCharts.jsx
import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart, Line,
  XAxis, YAxis,
  CartesianGrid,
  Tooltip, Legend
} from "recharts";
import { parseBP } from "../utils/bp";

const formatDate = (d) => {
  const date = d instanceof Date ? d : new Date(d);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

function normalizeRows(data) {
  const toNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  return (data || []).map((r) => {
    if (r.t instanceof Date) return r; // ya normalizado

    let t = new Date();
    const c = r.createdAt;
    if (c?.toDate) t = c.toDate();
    else if (c?.seconds) t = new Date(c.seconds * 1000);
    else if (c instanceof Date) t = c;

    let sys = r.sys ?? r.bpSys;
    let dia = r.dia ?? r.bpDia;
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
  });
}

function ChartCard({ children, data }) {
  return (
    <div className="chart-card">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="t" tickFormatter={formatDate} />
          <YAxis />
          <Tooltip labelFormatter={formatDate} />
          <Legend />
          {children}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function VitalCharts({ data = [] }) {
  const rows = useMemo(() => normalizeRows(data), [data]);

  if (!rows.length) {
    return (
      <div className="charts-wrap">
        <h3 style={{ marginTop: 0 }}>Gráficas</h3>
        <p>Sin registros</p>
      </div>
    );
  }

  return (
    <div className="charts-wrap">
      <h3 style={{ marginTop: 0 }}>Gráficas</h3>

      <ChartCard data={rows}>
        <Line type="monotone" dataKey="hr" name="Frecuencia cardiaca (lpm)" stroke="#f43f5e" dot={{ r: 2 }} isAnimationActive={false} />
      </ChartCard>

      <ChartCard data={rows}>
        <Line type="monotone" dataKey="rr" name="Frecuencia respiratoria (rpm)" stroke="#f59e0b" dot={{ r: 2 }} isAnimationActive={false} />
      </ChartCard>

      <ChartCard data={rows}>
        <Line type="monotone" dataKey="sys" name="Tensión sistólica (mmHg)" stroke="#3b82f6" dot={{ r: 2 }} isAnimationActive={false} />
        <Line type="monotone" dataKey="dia" name="Tensión diastólica (mmHg)" stroke="#a855f7" dot={{ r: 2 }} isAnimationActive={false} />
      </ChartCard>

      <ChartCard data={rows}>
        <Line type="monotone" dataKey="spo2" name="Saturación O₂ (%)" stroke="#10b981" dot={{ r: 2 }} isAnimationActive={false} />
      </ChartCard>

      <ChartCard data={rows}>
        <Line type="monotone" dataKey="temp" name="Temperatura (°C)" stroke="#8b5cf6" dot={{ r: 2 }} isAnimationActive={false} />
      </ChartCard>
    </div>
  );
}

