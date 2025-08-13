import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createUser, getUserByCedula } from "../lib/users";

const normCed = (s) => (s || "").toString().trim().replace(/[.\s-]/g, "");

export default function UserRegister() {
  const [params] = useSearchParams();
  const cedulaFromQuery = normCed(params.get("cedula"));
  const [form, setForm] = useState({
    nombreCompleto: "",
    cedula: cedulaFromQuery,
    correo: "",
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === "cedula" ? normCed(value) : value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const { nombreCompleto, cedula, correo } = form;
    const ced = normCed(cedula);
    if (!nombreCompleto.trim() || !ced || !correo.trim()) return;
    if (!correo.includes("@")) return;
    setSaving(true);
    try {
      const existing = await getUserByCedula(ced);
      if (existing) {
        alert("La cédula ya está registrada");
        return;
      }
      await createUser({
        cedula: ced,
        nombreCompleto: nombreCompleto.trim(),
        correo: correo.trim(),
        role: "auxiliar",
      });
      localStorage.setItem("role", "auxiliar");
      localStorage.setItem("userId", ced);
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
