import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const SUPER_ADMINS = (import.meta.env.VITE_SUPERADMINS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

function normalizeEmail(e) {
  return (e || "").trim().toLowerCase();
}

function isValidEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || "");
}

export default function AccessByEmail() {
  const navigate = useNavigate();
  const [step, setStep] = useState("ask"); // 'ask' | 'register' | 'loading'
  const [email, setEmail] = useState("");
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    email: "",
  });
  const [error, setError] = useState("");

  const usersRef = collection(db, "users");

  async function handleAskContinue(e) {
    e.preventDefault();
    setError("");
    const em = normalizeEmail(email);
    if (!isValidEmail(em)) {
      setError("Ingresa un correo válido.");
      return;
    }
    setStep("loading");
    try {
      // Buscar usuario por email
      const q = query(usersRef, where("email", "==", em));
      const snap = await getDocs(q);

      // Si existe => login
      if (!snap.empty) {
        const doc = snap.docs[0];
        const user = { id: doc.id, ...doc.data() };
        doLogin(user);
        return;
      }

      // No existe => ir a registro
      setForm((prev) => ({ ...prev, email: em }));
      setStep("register");
    } catch (err) {
      console.error(err);
      setError("Error al verificar el correo. Intenta nuevamente.");
      setStep("ask");
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    const em = normalizeEmail(form.email);
    if (!isValidEmail(em)) return setError("Correo inválido.");
    if (!form.nombre.trim()) return setError("Nombre requerido.");
    if (!form.apellido.trim()) return setError("Apellido requerido.");
    if (!/^\d+$/.test(form.cedula.trim()))
      return setError("Cédula debe ser numérica.");

    setStep("loading");
    try {
      // Verificar si por concurrencia se creó el usuario entre pasos
      const q = query(usersRef, where("email", "==", em));
      const existSnap = await getDocs(q);
      if (!existSnap.empty) {
        const user = { id: existSnap.docs[0].id, ...existSnap.docs[0].data() };
        doLogin(user);
        return;
      }

      // Crear usuario nuevo (rol por defecto auxiliar)
      const payload = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        nombreCompleto: `${form.nombre.trim()} ${form.apellido.trim()}`.trim(),
        cedula: form.cedula.trim(),
        email: em,
        role: "auxiliar",
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(usersRef, payload);
      const user = { id: docRef.id, ...payload };

      doLogin(user);
    } catch (err) {
      console.error(err);
      setError("Error al registrar. Intenta nuevamente.");
      setStep("register");
    }
  }

  function doLogin(user) {
    // Si está en superadmins por email, elevar rol virtual a superadmin
    const emailLower = normalizeEmail(user.email);
    const isSuper = SUPER_ADMINS.includes(emailLower);

    const role = isSuper ? "superadmin" : user.role || "auxiliar";

    // Persistir sesión sencilla (igual a lo que usan actualmente)
    localStorage.setItem("role", role);
    localStorage.setItem("user", JSON.stringify(user));

    // Redirigir por rol
    if (role === "admin" || role === "superadmin") navigate("/admin", { replace: true });
    else if (role === "medico") navigate("/medico", { replace: true });
    else navigate("/auxiliar", { replace: true });
  }

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>Acceso del personal</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Ingresa con correo registrado. Si no estás en la lista, solicita tu registro al administrador.
      </p>

      {error && (
        <div
          style={{
            background: "#ffecec",
            border: "1px solid #f5a3a3",
            padding: "8px 12px",
            borderRadius: 8,
            marginBottom: 12,
            color: "#b30000",
          }}
        >
          {error}
        </div>
      )}

      {step === "ask" && (
        <form onSubmit={handleAskContinue}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
            Correo
          </label>
          <input
            type="email"
            placeholder="tucorreo@hospital.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #ddd",
              marginBottom: 12,
            }}
          />
          <button
            className="btn"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 8,
              background: "#2563eb",
              color: "#fff",
              border: "none",
            }}
          >
            Continuar
          </button>
          <div style={{ marginTop: 12 }}>
            <Link to="/" style={{ color: "#2563eb" }}>
              Volver a inicio
            </Link>
          </div>
        </form>
      )}

      {step === "register" && (
        <form onSubmit={handleRegister}>
          <div className="field">
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
              Nombre
            </label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="input"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #ddd",
                marginBottom: 12,
              }}
            />
          </div>
          <div className="field">
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
              Apellido
            </label>
            <input
              type="text"
              value={form.apellido}
              onChange={(e) => setForm({ ...form, apellido: e.target.value })}
              className="input"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #ddd",
                marginBottom: 12,
              }}
            />
          </div>
          <div className="field">
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
              Cédula
            </label>
            <input
              inputMode="numeric"
              pattern="\d*"
              value={form.cedula}
              onChange={(e) => setForm({ ...form, cedula: e.target.value })}
              className="input"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #ddd",
                marginBottom: 12,
              }}
            />
          </div>
          <div className="field">
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
              Correo
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #ddd",
                marginBottom: 12,
              }}
            />
          </div>

          <button
            className="btn"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 8,
              background: "#2563eb",
              color: "#fff",
              border: "none",
            }}
          >
            Registrarme
          </button>

          <div style={{ marginTop: 12 }}>
            <button
              type="button"
              onClick={() => {
                setStep("ask");
                setError("");
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "#2563eb",
                cursor: "pointer",
              }}
            >
              Usar otro correo
            </button>
          </div>
        </form>
      )}

      {step === "loading" && <p>Validando…</p>}
    </div>
  );
}

