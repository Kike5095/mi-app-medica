import { useState } from "react";
import { db } from "../firebaseConfig";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
  Timestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { assertAdmin } from "../utils/roles";

function showVal(v) {
  return v || v === 0 ? String(v) : "—";
}

function truncate(t, n = 40) {
  if (!t) return "—";
  return t.length > n ? t.slice(0, n) + "…" : t;
}

export default function PatientForm({
  onClose,
  onCreated,
  mode = "create",
  initialValues = {},
  onUpdated,
}) {
  const [form, setForm] = useState({
    nombreCompleto: initialValues.nombreCompleto || "",
    cedula: initialValues.cedula || "",
    finEstimado: initialValues.finEstimadoAt
      ? (() => {
          let d = initialValues.finEstimadoAt;
          if (d?.toDate) d = d.toDate();
          if (d instanceof Date && !isNaN(+d)) {
            return d.toISOString().slice(0, 10);
          }
          return "";
        })()
      : "",
  });
  const [edad, setEdad] = useState(
    initialValues.edad != null ? String(initialValues.edad) : ""
  );
  const [diagnostico, setDiagnostico] = useState(
    initialValues.diagnostico || ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const change = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (
      !form.nombreCompleto.trim() ||
      !form.cedula.trim() ||
      !form.finEstimado
    ) {
      setError(
        "Nombre completo, cédula y fecha de finalización son obligatorios"
      );
      return;
    }
    const nEdad = Number(edad);
    if (Number.isNaN(nEdad) || nEdad < 0 || nEdad > 120) {
      alert("La edad debe estar entre 0 y 120 años.");
      return;
    }
    const diag = (diagnostico || "").trim();
    if (!diag) {
      alert("El diagnóstico es obligatorio.");
      return;
    }
    setSaving(true);
    try {
      const finEstimadoDate = form.finEstimado
        ? new Date(`${form.finEstimado}T00:00:00`)
        : null;
      if (mode === "edit") {
        assertAdmin();
        const payload = {
          nombreCompleto: form.nombreCompleto.trim(),
          cedula: String(form.cedula).trim(),
          edad: nEdad,
          diagnostico: diag,
          finEstimadoAt: finEstimadoDate
            ? Timestamp.fromDate(finEstimadoDate)
            : null,
        };
        await updateDoc(doc(db, "patients", initialValues.id), payload);
        onUpdated && onUpdated();
        onClose && onClose();
      } else {
        const q = query(
          collection(db, "patients"),
          where("cedula", "==", String(form.cedula).trim())
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setError("La cédula ya está registrada");
          setSaving(false);
          return;
        }
        const nuevoPaciente = {
          nombreCompleto: form.nombreCompleto.trim(),
          cedula: String(form.cedula).trim(),
          status: "pendiente",
          fechaIngreso: serverTimestamp(),
          ingresoAt: serverTimestamp(),
          fechaFin: finEstimadoDate
            ? Timestamp.fromDate(finEstimadoDate)
            : null,
          finEstimadoAt: finEstimadoDate,
          finAt: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          edad: nEdad,
          diagnostico: diag,
        };
        await addDoc(collection(db, "patients"), nuevoPaciente);
        onCreated && onCreated();
        onClose && onClose();
      }
    } catch (err) {
      console.error("Error procesando paciente", err);
      setError(err.message || "Error procesando paciente");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <form
        onSubmit={submit}
        style={{ background: "#fff", padding: 20, borderRadius: 8, width: "100%", maxWidth: 400 }}
      >
        <h2>{mode === "edit" ? "Editar paciente" : "Nuevo paciente"}</h2>

        <label style={{ display: "block", marginBottom: 8 }}>
          Nombre completo
          <input
            name="nombreCompleto"
            value={form.nombreCompleto}
            onChange={change}
            required
            style={{ display: "block", width: "100%", marginTop: 4, padding: 8 }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 8 }}>
          Cédula
          <input
            name="cedula"
            value={form.cedula}
            onChange={change}
            required
            style={{ display: "block", width: "100%", marginTop: 4, padding: 8 }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 8 }}>
          Edad
          <input
            type="number"
            min={0}
            max={120}
            value={edad}
            onChange={(e) => setEdad(e.target.value)}
            style={{ display: "block", width: "100%", marginTop: 4, padding: 8 }}
            placeholder="Ej: 54"
          />
        </label>

        <label style={{ display: "block", marginBottom: 8 }}>
          Diagnóstico
          <textarea
            rows={2}
            value={diagnostico}
            onChange={(e) => setDiagnostico(e.target.value)}
            style={{ display: "block", width: "100%", marginTop: 4, padding: 8 }}
            placeholder="Ej: Neumonía adquirida en la comunidad"
          />
        </label>

        <label style={{ display: "block", marginBottom: 8 }}>
          Fecha de finalización
          <input
            type="date"
            name="finEstimado"
            value={form.finEstimado}
            onChange={change}
            required
            style={{ display: "block", width: "100%", marginTop: 4, padding: 8 }}
          />
        </label>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16, gap: 8 }}>
          <button type="button" onClick={onClose} style={{ padding: "8px 12px" }}>
            Cancelar
          </button>
          <button type="submit" disabled={saving} style={{ padding: "8px 12px" }}>
            {saving
              ? "Guardando..."
              : mode === "edit"
              ? "Guardar cambios"
              : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}

