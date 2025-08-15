import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  findUserByEmail,
  resolveRole,
  destinationForRole,
  normalizeEmail,
} from "../lib/auth";

export default function AccessByEmail() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const value = normalizeEmail(email);
    if (!value) {
      setError("Ingresa un correo válido.");
      return;
    }
    setLoading(true);
    try {
      const user = await findUserByEmail(value);
      if (!user) {
        navigate(`/create-account?email=${encodeURIComponent(value)}`);
        return;
      }
      const role = resolveRole(value, user);
      localStorage.setItem("role", role);
      localStorage.setItem("userEmail", value);
      localStorage.setItem("userName", user.nombreCompleto || user.nombre || "");
      localStorage.setItem("userCedula", user.cedula || "");
      navigate(destinationForRole(role), { replace: true });
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al validar tu acceso. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app">
      <div className="card" style={{ maxWidth: 520, margin: "48px auto", padding: 24 }}>
        <h1 className="section-title" style={{ marginBottom: 8 }}>
          Acceso del personal
        </h1>
        <p style={{ marginBottom: 16, color: "var(--color-muted, #6b7280)" }}>
          Ingresa con correo registrado. Si no estás en la lista, podrás registrarte.
        </p>

        <form onSubmit={onSubmit}>
          <input
            type="email"
            placeholder="tucorreo@hospital.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            style={{
              width: "100%",
              border: "1px solid var(--color-border)",
              borderRadius: "10px",
              padding: "10px 12px",
              background: "#fff",
              marginBottom: 12,
              outline: "none",
            }}
          />

          {error && (
            <div style={{ color: "#b91c1c", fontSize: 14, marginBottom: 12 }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Validando..." : "Continuar"}
          </button>
        </form>
      </div>
    </div>
  );
}