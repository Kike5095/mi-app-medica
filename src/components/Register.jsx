// src/components/Register.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { db, ensureAuth } from "../firebaseConfig";
import { addDoc, collection } from "firebase/firestore";

export default function Register() {
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    cedula: params.get("cedula") || "",
  });
  const [guardando, setGuardando] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    ensureAuth().catch(console.error);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.cedula.trim() || !form.nombre.trim() || !form.apellido.trim()) return;

    setGuardando(true);
    try {
      await addDoc(collection(db, "personal"), {
        ...form,
        cedula: String(form.cedula).trim(),
        rol: "Auxiliar",
      });

      const user = { ...form, rol: "Auxiliar" };
      localStorage.setItem("user", JSON.stringify(user));
      nav("/auxiliar", { state: { user } });
    } catch (err) {
      console.error("Error registrando:", err);
      alert("No se pudo registrar. Revisa la consola.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ maxWidth: 480 }}>
      <h2>Registro de Personal (rol: Auxiliar)</h2>

      <input
        placeholder="Nombre"
        value={form.nombre}
        onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
        style={{ display: "block", margin: "8px 0", width: "100%", padding: 10 }}
      />
      <input
        placeholder="Apellido"
        value={form.apellido}
        onChange={(e) => setForm((f) => ({ ...f, apellido: e.target.value }))}
        style={{ display: "block", margin: "8px 0", width: "100%", padding: 10 }}
      />
      <input
        placeholder="Cédula"
        value={form.cedula}
        onChange={(e) => setForm((f) => ({ ...f, cedula: e.target.value }))}
        style={{ display: "block", margin: "8px 0", width: "100%", padding: 10 }}
      />
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        style={{ display: "block", margin: "8px 0", width: "100%", padding: 10 }}
      />

      <button
        disabled={guardando}
        style={{
          marginTop: 12,
          width: "100%",
          padding: 12,
          fontSize: 16,
          background: "#0b6aa2",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: guardando ? "not-allowed" : "pointer",
        }}
      >
        {guardando ? "Creando..." : "Crear"}
      </button>
    </form>
  );
}
