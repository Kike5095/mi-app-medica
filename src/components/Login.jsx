// Login.jsx
import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebaseConfig"; // tu configuración

const auth = getAuth(app);
const db = getFirestore(app);

const Login = ({ onLoginSuccess }) => {
  const [cedula, setCedula] = useState("");
  const [error, setError] = useState("");

  const handleCedulaSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // 🔹 1. Hacer login como tú (super admin)
      const email = "doctorcorreap@gmail.com";
      const password = "TU_CONTRASEÑA"; // cámbialo por la real
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      const uid = userCredential.user.uid;
      console.log("✅ Sesión iniciada como:", uid);

      // 🔹 2. Verificar rol
      const docRef = doc(db, "personal", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("📄 Datos usuario:", data);

        if (data.rol === "Médico" || data.rol === "Administrador") {
          // 🔹 3. Aquí puedes verificar la cédula ingresada
          console.log("✅ Permiso otorgado, cédula ingresada:", cedula);
          onLoginSuccess();
        } else {
          setError("No tienes permisos para acceder.");
        }
      } else {
        setError("No se encontró tu usuario en la base de datos.");
      }
    } catch (err) {
      console.error(err);
      setError("Error de autenticación o permisos.");
    }
  };

  return (
    <main>
      <h1 align="center">Programa de Hospitalización Domiciliaria</h1>
      <form onSubmit={handleCedulaSubmit}>
        <label>Ingresa tu Cédula para Continuar</label>
        <input
          type="text"
          value={cedula}
          onChange={(e) => setCedula(e.target.value)}
        />
        <button type="submit">Ingresar</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </main>
  );
};

export default Login;
