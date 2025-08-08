import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

// Este componente recibe la cédula que no se encontró y la función onLoginSuccess
const Register = ({ cedula, onLoginSuccess }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const newUserProfile = {
        nombre,
        email,
        cedula,
        rol: "Auxiliar", // Todos se registran como Auxiliar por defecto
      };
      await addDoc(collection(db, "personal"), newUserProfile);
      // Después de registrar, "iniciamos sesión" con el perfil recién creado
      onLoginSuccess(newUserProfile);
    } catch (err) {
      alert("Error al registrar: " + err.message);
    }
    setIsLoading(false);
  };

  return (
    <main className="container" style={{ maxWidth: '450px', marginTop: '5rem' }}>
      <article>
        <hgroup>
          <h1>Registro de Nuevo Usuario</h1>
          <h2>La cédula **{cedula}** no está registrada. Por favor, completa tu perfil.</h2>
        </hgroup>
        <form onSubmit={handleRegisterSubmit}>
          <label>Nombre Completo<input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required /></label>
          <label>Correo Electrónico<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label>Rol (asignado por defecto)</label>
          <input type="text" value="Auxiliar" disabled />
          <button type="submit" aria-busy={isLoading}>{isLoading ? 'Completar Registro' : 'Registrar y Entrar'}</button>
        </form>
      </article>
    </main>
  );
};

export default Register;