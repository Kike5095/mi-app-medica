import { useState } from "react";
import { db } from "../firebaseConfig";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

export default function PatientForm({ onClose, onCreated }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    cedula: "",
    telefono: "",
    direccion: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const change = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.firstName.trim() || !form.lastName.trim() || !form.cedula.trim()) {
      setError("Nombre, apellido y cédula son obligatorios");
      return;
    }
    setSaving(true);
    try {
      const q = query(
        collection(db, "patients"),
        where("cedula", "==", String(form.cedula).trim())
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        setError("Ya existe un paciente con esa cédula");
        setSaving(false);
        return;
      }
      await addDoc(collection(db, "patients"), {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        cedula: String(form.cedula).trim(),
        telefono: form.telefono.trim(),
        direccion: form.direccion.trim(),
        status: "pendiente",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      onCreated && onCreated();
      onClose && onClose();
    } catch (err) {
      console.error("Error creando paciente", err);
      setError("Error creando paciente");
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
        <h2>Nuevo paciente</h2>

        <label style={{ display: "block", marginBottom: 8 }}>
          Nombre
          <input
            name="firstName"
            value={form.firstName}
            onChange={change}
            required
            style={{ display: "block", width: "100%", marginTop: 4, padding: 8 }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 8 }}>
          Apellido
          <input
            name="lastName"
            value={form.lastName}
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
          Teléfono
          <input
            name="telefono"
            value={form.telefono}
            onChange={change}
            style={{ display: "block", width: "100%", marginTop: 4, padding: 8 }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 8 }}>
          Dirección
          <input
            name="direccion"
            value={form.direccion}
            onChange={change}
            style={{ display: "block", width: "100%", marginTop: 4, padding: 8 }}
          />
        </label>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16, gap: 8 }}>
          <button type="button" onClick={onClose} style={{ padding: "8px 12px" }}>
            Cancelar
          </button>
          <button type="submit" disabled={saving} style={{ padding: "8px 12px" }}>
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}

