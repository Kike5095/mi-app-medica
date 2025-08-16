import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AccessByEmail() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const value = (email || "").trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      setError("Ingresa un correo válido.");
      return;
    }
    setLoading(true);
    try {
      // Lógica real de búsqueda (Firebase) puede ir aquí.
      // Por ahora, simula “usuario existe”:
      localStorage.setItem("userEmail", value);
      // Redirige a admin (solo para probar navegación):
      navigate("/admin", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app">
      <div className="card p-6 max-w-md mx-auto">
        <h1 className="text-2xl font-semibold mb-2">Acceso del personal</h1>
        <p className="text-slate-600 mb-6">
          Ingresa con correo registrado. Si no estás en la lista, podrás registrarte.
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
            className="w-full btn btn-primary disabled:opacity-60"
          >
            {loading ? "Validando..." : "Continuar"}
          </button>
        </form>
      </div>
    </div>
  );
}
