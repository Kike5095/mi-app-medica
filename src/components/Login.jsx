import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Función para validar que los campos no estén vacíos
  const validateFields = () => {
    if (!email || !password) {
      setError("El correo y la contraseña no pueden estar vacíos.");
      return false;
    }
    setError('');
    return true;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError("Error al registrar: " + err.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError("Error al iniciar sesión: " + err.message);
    }
  };

  const handleGoogleLogin = async () => { /* ... (sin cambios) ... */ };

  return (
    <main className="container">
      <article>
        <h1 align="center">Programa de Hospitalizacion Domiciliaria Colsanitas</h1>
        <form>
          <input 
            type="email" 
            placeholder="Correo electrónico" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="grid">
            <button onClick={handleLogin}>Iniciar Sesión</button>
            <button className="secondary" onClick={handleSignUp}>Registrarse</button>
          </div>
        </form>
        <p align="center">o</p>
        <button className="contrast" onClick={handleGoogleLogin}>
          Continuar con Google
        </button>
        {error && <p style={{ color: 'var(--pico-color-red-500)' }}>{error}</p>}
      </article>
    </main>
  );
};

export default Login;