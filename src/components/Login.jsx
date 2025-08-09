// src/components/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ensureAuth, db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function Login() {
  const [cedula, setCedula] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const ced = String(cedula).trim();
    if (!ced) return;

    setCargando(true);
    try {
      // 1) Autenticación (anónima)
      await ensureAuth();

      // 2) Buscar en "personal" por CAMPO cedula
      const q = query(collection(db, "personal"), where("cedula", "==", ced));
      const snap = await getDocs(q);

      if (snap.empty) {
        // No registrado → ir a registro con la cédula precargada
        navigate(`/registrar?cedula=${encodeURIComponent(ced)}`);
        return;
      }

      const data = snap.docs[0].data();

      // 3) Guardar sesión y redirigir por rol
      localStorage.setItem("user", JSON.stringify(data));

      const rol = (data.rol || "").toLowerCase();
      if (rol.includes("medico") || rol.includes("médico")) {
        navigate("/medico", { state: { user: data } });
      } else if (rol.includes("admin") || rol.includes("administrador")) {
        navigate("/admin", { state: { user: data } });
      } else {
        navigate("/auxiliar", { state: { user: data } });
      }
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError("Ocurrió un error al iniciar sesión.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 420, marginTop: 16 }}>
      <h1>Ingreso de Personal</h1>

      <label style={{ display: "block", margin: "8px 0 4px" }}>Cédula:</label>
      <input
        type="text"
        value={cedula}
        onChange={(e) => setCedula(e.target.value)}
        placeholder="Ingrese su cédula"
        style={{ width: "100%", padding: 10, fontSize: 16 }}
      />

      <button
        type="submit"
        disabled={cargando || !cedula.trim()}
        style={{
          marginTop: 12,
          width: "100%",
          padding: 12,
          fontSize: 16,
          background: "#0b6aa2",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: cargando ? "not-allowed" : "pointer",
        }}
      >
        {cargando ? "Verificando..." : "Ingresar"}
      </button>

      {error && <p style={{ color: "crimson", marginTop: 12 }}>{error}</p>}
    </form>
  );
}
