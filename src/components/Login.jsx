import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError("Por favor, ingresa el correo y la contraseña.");
      return;
    }

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado. Intenta iniciar sesión.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Correo o contraseña incorrectos.');
      } else {
        setError('Ocurrió un error. Por favor, intenta de nuevo.');
      }
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
    }
  };

  return (
    <main className="container" style={{ maxWidth: '400px', marginTop: '5rem' }}>
      <article>
        <hgroup>
          <h1>Bienvenido de Nuevo</h1>
          <h2>{isRegistering ? 'Crea tu cuenta para empezar' : 'Ingresa a tu panel de control'}</h2>
        </hgroup>

        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit">{isRegistering ? 'Registrarse' : 'Iniciar Sesión'}</button>
        </form>

        <a href="#" onClick={(e) => { e.preventDefault(); setIsRegistering(!isRegistering); setError(''); }}>
          {isRegistering ? '¿Ya tienes una cuenta? Inicia sesión' : '¿No tienes una cuenta? Regístrate'}
        </a>

        <hr />

        <button className="contrast" onClick={handleGoogleLogin}>Continuar con Google</button>

        {error && <p style={{ color: 'var(--pico-color-red-500)' }}>{error}</p>}
      </article>
    </main>
  );
};

export default Login;