import React, { useState } from "react";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { app } from "../firebaseConfig";
import { useNavigate, useLocation } from "react-router-dom";

const db = getFirestore(app);

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const cedulaInicial = new URLSearchParams(location.search).get("cedula") || "";

  const [cedula, setCedula] = useState(cedulaInicial);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const registrar = async () => {
    setError("");
    if (!cedula || !nombre || !apellido || !email) {
      setError("Todos los campos son obligatorios");
      return;
    }

    try {
      await addDoc(collection(db, "personal"), {
        cedula,
        nombre: `${nombre} ${apellido}`,
        email,
        rol: "Auxiliar"
      });
      alert("Registro exitoso. Ahora puedes ingresar.");
      navigate("/");
    } catch (err) {
      console.error("Error al registrar:", err);
      setError("Error al registrar");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", textAlign: "center" }}>
      <h1>Registro de Personal</h1>
      <input type="text" placeholder="Cédula" value={cedula} onChange={(e) => setCedula(e.target.value)} style={inputStyle} />
      <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} style={inputStyle} />
      <input type="text" placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} style={inputStyle} />
      <input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
      <button onClick={registrar} style={buttonStyle}>Registrar</button>
      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
    </div>
  );
}

const inputStyle = { width: "100%", padding: "10px", fontSize: "16px", marginBottom: "10px" };
const buttonStyle = { width: "100%", padding: "10px", fontSize: "16px", backgroundColor: "green", color: "white", border: "none" };
