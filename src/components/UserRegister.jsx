import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createUser } from "../lib/users";

export default function UserRegister() {
  const [params] = useSearchParams();
  const cedulaFromQuery = params.get("cedula") || "";
  const [form, setForm] = useState({
    nombreCompleto: "",
    cedula: cedulaFromQuery,
    correo: "",
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const { nombreCompleto, cedula, correo } = form;
    if (!nombreCompleto.trim() || !cedula.trim() || !correo.trim()) return;
    if (!correo.includes("@")) return;
    setSaving(true);
    try {
      await createUser({
        cedula: cedula.trim(),
        nombreCompleto: nombreCompleto.trim(),
        correo: correo.trim(),
        role: "auxiliar",
      });
      localStorage.setItem("role", "auxiliar");
      localStorage.setItem("userId", cedula.trim());
      localStorage.setItem("userName", nombreCompleto.trim());
      navigate("/auxiliar");
    } catch (err) {
      console.error("Error registrando usuario:", err);
      alert("No se pudo registrar. Revisa la consola.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1 style={{ marginBottom: 20 }}>Registro de Auxiliar</h1>
      <input
        className="input"
        name="nombreCompleto"
        placeholder="Nombre y apellido"
        value={form.nombreCompleto}
        onChange={onChange}
        style={{ marginBottom: 12 }}
      />
      <input
        className="input"
        name="cedula"
        placeholder="Cédula"
        value={form.cedula}
        onChange={onChange}
        readOnly={Boolean(cedulaFromQuery)}
        style={{ marginBottom: 12 }}
      />
      <input
        className="input"
        name="correo"
        type="email"
        placeholder="Correo"
        value={form.correo}
        onChange={onChange}
        style={{ marginBottom: 12 }}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          className="btn ghost"
          onClick={() => navigate("/")}
          style={{ flex: 1 }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="btn primary"
          style={{ flex: 1 }}
        >
          {saving ? "Guardando..." : "Registrar"}
        </button>
      </div>
    </form>
  );
}
