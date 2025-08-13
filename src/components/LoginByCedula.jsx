import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserByCedula } from "../lib/users";

const normCed = (s) => (s || "").toString().trim().replace(/[.\s-]/g, "");

export default function LoginByCedula() {
  const [cedula, setCedula] = useState("");
  const [buscando, setBuscando] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    const ced = normCed(cedula);
    if (!ced) return;
    setBuscando(true);
    try {
      const user = await getUserByCedula(ced);
      if (user) {
        localStorage.setItem("role", user.role || "");
        localStorage.setItem("userId", user.cedula);
        localStorage.setItem("userName", user.nombreCompleto || "");
        if (user.role === "admin") nav("/admin");
        else if (user.role === "medico") nav("/medico");
        else if (user.role === "auxiliar") nav("/auxiliar");
        else nav("/");
      } else {
        nav(`/registro?cedula=${encodeURIComponent(ced)}`);
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo buscar. Revisa la consola.");
    } finally {
      setBuscando(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      style={{ maxWidth: 420, margin: "40px auto", padding: 16, textAlign: "center" }}
    >
      <h1 style={{ marginBottom: 20 }}>Ingresar</h1>
      <input
        placeholder="Cédula"
        value={cedula}
        onChange={(e) => setCedula(normCed(e.target.value))}
        style={{ display: "block", width: "100%", padding: 10, marginBottom: 12 }}
      />
      <button
        type="submit"
        disabled={buscando || !cedula.trim()}
        className="btn primary"
        style={{ width: "100%", padding: 12 }}
      >
        {buscando ? "Buscando..." : "Continuar"}
      </button>
    </form>
  );
}
