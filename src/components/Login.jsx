// src/components/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSelect = (role, path) => {
    try {
      setLoading(true);
      localStorage.setItem("role", role);
      navigate(path);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>Ingresar</h1>
      <p style={{ marginBottom: 24 }}>
        Selecciona tu rol para continuar.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button
          type="button"
          onClick={() => handleSelect("medico", "/medico")}
          disabled={loading}
          className="btn primary"
          style={{ padding: "10px 14px", cursor: "pointer" }}
        >
          Médico
        </button>

        <button
          type="button"
          onClick={() => handleSelect("auxiliar", "/auxiliar")}
          disabled={loading}
          className="btn"
          style={{ padding: "10px 14px", cursor: "pointer" }}
        >
          Auxiliar
        </button>

        <button
          type="button"
          onClick={() => {
            localStorage.setItem("role", "admin");
            navigate("/admin");
          }}
          disabled={loading}
          className="btn"
          style={{ padding: "10px 14px", cursor: "pointer" }}
        >
          Admin
        </button>
      </div>
    </div>
  );
}
