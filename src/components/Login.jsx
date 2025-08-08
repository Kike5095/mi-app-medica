import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import Register from './Register.jsx';

const Login = ({ onLoginSuccess }) => {
  const [cedula, setCedula] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [needsRegistration, setNeedsRegistration] = useState(false);

  const handleCedulaSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const q = query(collection(db, "personal"), where("cedula", "==", cedula.trim()));
    try {
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setNeedsRegistration(true);
      } else {
        const userProfile = querySnapshot.docs[0].data();
        onLoginSuccess(userProfile);
      }
    } catch (err) {
      console.error("Error en la consulta:", err);
      setError("Error al verificar la cédula. Revisa la consola.");
    }
    setIsLoading(false);
  };

  if (needsRegistration) {
    return <Register cedula={cedula} onLoginSuccess={onLoginSuccess} />;
  }
  
  return (
    <main className="container" style={{ maxWidth: '450px', marginTop: '5rem' }}>
      <article>
        <h1 align="center">Programa de Hospitalización Domiciliaria</h1>
        <form onSubmit={handleCedulaSubmit}>
          <label>Ingresa tu Cédula para Continuar</label>
          <input type="text" value={cedula} onChange={(e) => setCedula(e.target.value)} placeholder="Número de Cédula" required />
          <button type="submit" aria-busy={isLoading}>{isLoading ? 'Verificando...' : 'Ingresar'}</button>
        </form>
        {error && <p style={{ color: 'var(--pico-color-red-500)' }}>{error}</p>}
      </article>
    </main>
  );
};

export default Login;