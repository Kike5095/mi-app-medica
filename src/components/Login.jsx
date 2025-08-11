// src/components/SuperNav.jsx
import { useNavigate, useLocation } from "react-router-dom";

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
      // 1) Autenticación (anónima o la que uses)
      await ensureAuth();

      // 2) Buscar en Firestore por CAMPO "cedula" (IDs en personal son automáticos)
      const q = query(collection(db, "personal"), where("cedula", "==", ced));
      const snap = await getDocs(q);

      if (snap.empty) {
        // No está registrado → ir a registro con la cédula pre-llenada
        navigate(`/registrar?cedula=${encodeURIComponent(ced)}`);
        return;
      }

      const data = snap.docs[0].data();

      // 3) Guardar sesión local
      localStorage.setItem("user", JSON.stringify(data));

      // 4) Redirigir por rol
      const rol = (data.rol || "").toLowerCase();
      if (rol.includes("medico") || rol.includes("médico")) {
        navigate("/medico", { state: { user: data } });
      } else if (rol.includes("admin") || rol.includes("administrador")) {
        navigate("/admin", { state: { user: data } });
      } else {
        // Por defecto, Auxiliar
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

  return (
    <div style={{
      position: "sticky",
      top: 0,
      zIndex: 10,
      background: "#fff",
      borderBottom: "1px solid #eee",
      padding: "10px 12px",
      marginBottom: 8
    }}>
      <b>Super Admin:</b>{" "}
      <Btn to="/admin">Admin</Btn>
      <Btn to="/medico">Médico</Btn>
      <Btn to="/auxiliar">Auxiliar</Btn>
    </div>
  );
}
