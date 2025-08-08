import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Register from './Register.jsx'; // Importamos el nuevo componente de registro

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
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Si no existe, activamos el modo de registro
      setNeedsRegistration(true);
    } else {
      // Si existe, iniciamos sesión pasando el perfil
      const userProfile = querySnapshot.docs[0].data();
      onLoginSuccess(userProfile);
    }
    setIsLoading(false);
  };

  // Si el usuario necesita registrarse, mostramos el componente de Registro
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