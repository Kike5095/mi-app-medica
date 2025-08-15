import React, { useMemo, useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigate, useLocation } from "react-router-dom";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function CreateAccount() {
  const q = useQuery();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [cedula, setCedula] = useState("");
  const [correo, setCorreo] = useState((q.get("email") || "").toLowerCase());
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      nombreCompleto: `${(nombre || "").trim()} ${(apellido || "").trim()}`.trim(),
      cedula: (cedula || "").trim(),
      correo: (correo || "").trim().toLowerCase(),
      role: "auxiliar",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (!payload.nombreCompleto || !payload.cedula || !payload.correo) {
      setMsg("Completa todos los campos.");
      return;
    }

    setSaving(true);
    setMsg("");
    try {
      await addDoc(collection(db, "users"), payload);
      // Persist session data similar to login
      localStorage.setItem("role", "auxiliar");
      localStorage.setItem("userEmail", payload.correo);
      localStorage.setItem("userName", payload.nombreCompleto);
      localStorage.setItem("userCedula", payload.cedula);
      setMsg("Usuario creado correctamente. Redirigiendo…");
      navigate("/auxiliar");
    } catch (err) {
      console.error(err);
      setMsg("No se pudo crear el usuario.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Registro de personal</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-sm font-medium">Nombre</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <label className="block text-sm font-medium">Apellido</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
          required
        />

        <label className="block text-sm font-medium">Cédula</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={cedula}
          onChange={(e) => setCedula(e.target.value)}
          required
        />

        <label className="block text-sm font-medium">Correo</label>
        <input
          type="email"
          className="w-full border rounded px-3 py-2"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 disabled:opacity-60 text-white rounded px-3 py-2"
        >
          {saving ? "Guardando…" : "Registrarme"}
        </button>
      </form>
      {msg && <p className="mt-2 text-gray-700">{msg}</p>}
    </div>
  );
}

