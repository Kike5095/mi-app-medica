import React, { useState } from "react";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { app } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

const db = getFirestore(app);

export default function Login() {
  const [cedula, setCedula] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const ingresar = async () => {
    setError("");
    if (!cedula) {
      setError("Por favor ingrese su cédula");
      return;
    }

    try {
      const q = query(collection(db, "personal"), where("cedula", "==", cedula));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Si no está registrado → mandar a Register.jsx
        navigate(`/register?cedula=${cedula}`);
      } else {
        // Si existe → entrar a la app
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Error al ingresar:", err);
      setError("Error al iniciar sesión");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", textAlign: "center" }}>
      <h1>Login</h1>
      <input
        type="text"
        placeholder="Cédula"
        value={cedula}
        onChange={(e) => setCedula(e.target.value)}
        style={inputStyle}
      />
      <button onClick={ingresar} style={buttonStyle}>Ingresar</button>
      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
    </div>
  );
}

const inputStyle = { width: "100%", padding: "10px", fontSize: "16px", marginBottom: "10px" };
const buttonStyle = { width: "100%", padding: "10px", fontSize: "16px", backgroundColor: "blue", color: "white", border: "none" };
