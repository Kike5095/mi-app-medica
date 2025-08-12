import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "../firebaseConfig";

function formatDate(ts) {
  if (!ts) return "-";
  let d;
  if (ts.toDate) {
    d = ts.toDate();
  } else {
    d = new Date(ts);
  }
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PatientHistoryModal({ patientId, onClose }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!patientId) return;
    const col = collection(db, "patients", patientId, "vitals");
    const q = query(col, orderBy("createdAt", "desc"), limit(100));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRows(data);
    });
    return () => unsub();
  }, [patientId]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 8,
          maxHeight: "80vh",
          overflowY: "auto",
          minWidth: 600,
        }}
      >
        <h2>Historial de signos</h2>
        {rows.length === 0 ? (
          <p>Sin registros</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ borderBottom: "1px solid #ccc", padding: "4px 8px", textAlign: "left" }}>Fecha</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: "4px 8px", textAlign: "left" }}>Temp</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: "4px 8px", textAlign: "left" }}>FC</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: "4px 8px", textAlign: "left" }}>FR</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: "4px 8px", textAlign: "left" }}>PA</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: "4px 8px", textAlign: "left" }}>SpO2</th>
                <th style={{ borderBottom: "1px solid #ccc", padding: "4px 8px", textAlign: "left" }}>Nota</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td style={{ borderBottom: "1px solid #eee", padding: "4px 8px" }}>{formatDate(r.createdAt)}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "4px 8px" }}>{r.temp ?? "-"}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "4px 8px" }}>{r.hr ?? r.fc ?? "-"}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "4px 8px" }}>{r.rr ?? r.fr ?? "-"}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "4px 8px" }}>{r.bp ?? r.ta ?? "-"}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "4px 8px" }}>{r.spo2 ?? "-"}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "4px 8px" }}>{r.notes || r.nota || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button
          style={{ marginTop: 12, padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc", cursor: "pointer" }}
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

