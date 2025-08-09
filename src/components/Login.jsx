import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

const Login = ({ onLoginSuccess }) => {
  const [cedula, setCedula] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMensaje("");

    if (!cedula.trim()) {
      setMensaje("Por favor ingresa tu cédula.");
      return;
    }

    try {
      // Buscar en colección "personal" por cédula
      const q = query(collection(db, "personal"), where("cedula", "==", cedula));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Usuario encontrado
        const userData = querySnapshot.docs[0].data();
        onLoginSuccess(userData);
      } else {
        // Usuario no encontrado → ir al registro
        setMensaje("Usuario no encontrado. Redirigiendo a registro...");
        setTimeout(() => {
          window.location.href = "/register?cedula=" + cedula;
        }, 1500);
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setMensaje("Ocurrió un error al iniciar sesión.");
    }
  };

  return (
    <div className="container">
      <h2>Ingreso de Personal</h2>
      <form onSubmit={handleLogin}>
        <label>Cédula:</label>
        <input
          type="text"
          value={cedula}
          onChange={(e) => setCedula(e.target.value)}
        />
        <button type="submit">Ingresar</button>
      </form>
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
};

export default Login;
