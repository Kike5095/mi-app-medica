import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const Register = ({ cedula, onLoginSuccess }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const newUserProfile = {
        nombre: nombre,
        email: email,
        cedula: cedula,
        rol: "Auxiliar", // Rol por defecto
      };
      await addDoc(collection(db, "personal"), newUserProfile);
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
          <button type="submit" aria-busy={isLoading}>{isLoading ? 'Registrando...' : 'Registrar y Entrar'}</button>
        </form>
      </article>
    </main>
  );
};

export default Register;