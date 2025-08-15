import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { findUserByEmail, resolveRole, destinationForRole, normalizeEmail } from "../lib/auth";

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
        setError("No se encontró tu correo. Solicita registro al administrador.");
        return;
      }

      const role = resolveRole(value, user);

      // Persistimos sesión ligera en localStorage (la app ya la usa para ruteo)
      localStorage.setItem("role", role);
      localStorage.setItem("userEmail", value);
      localStorage.setItem("userName", user.nombreCompleto || user.nombre || "");
      localStorage.setItem("userCedula", user.cedula || "");

      // Redirige según rol
      navigate(destinationForRole(role), { replace: true });
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al validar tu acceso. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">Acceso del personal</h1>
      <p className="text-gray-600 mb-6">
        Ingresa con correo registrado. Si no estás en la lista, solicita tu registro al administrador.
      </p>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="email"
          className="w-full border rounded px-3 py-2"
          placeholder="tucorreo@hospital.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button
          disabled={loading}
          className="w-full bg-blue-600 disabled:opacity-60 text-white rounded px-3 py-2"
        >
          {loading ? "Validando..." : "Continuar"}
        </button>
      </form>
    </div>
  );
}
