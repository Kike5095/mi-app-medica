import React, { useState } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
  const [step, setStep] = useState(1); // 1: Pedir Cédula, 2: Registrar, 3: Pedir Contraseña
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Estados para registro
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('Auxiliar');

  const handleCedulaSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const q = query(collection(db, "personal"), where("cedula", "==", cedula.trim()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      setStep(2); // No encontrado, ir a registrar
    } else {
      setFoundUser(querySnapshot.docs[0].data());
      setStep(3); // Encontrado, ir a pedir contraseña
    }
    setIsLoading(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, foundUser.email, password);
    } catch (err) {
      setError("Contraseña incorrecta.");
    }
    setIsLoading(false);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await addDoc(collection(db, "personal"), {
        nombre, email, cedula, rol,
        uid: userCredential.user.uid
      });
    } catch (err) {
      setError("Error al registrar: " + err.message);
    }
    setIsLoading(false);
  };
  
  const handleGoogleLogin = async () => {
    // ... (sin cambios)
  };

  if (step === 2) {
    // Formulario de Registro
    return (
      <main className="container"><article>
        <hgroup><h1>Registro de Nuevo Usuario</h1><h2>Cédula {cedula} no encontrada. Completa tu perfil.</h2></hgroup>
        <form onSubmit={handleRegisterSubmit}>
          <label>Nombre Completo<input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required /></label>
          <label>Correo Electrónico<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label>Crea una Contraseña<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          <label>Rol<select value={rol} onChange={(e) => setRol(e.target.value)} required><option value="Auxiliar">Auxiliar</option><option value="Médico">Médico</option></select></label>
          <button type="submit" aria-busy={isLoading}>{isLoading ? 'Registrando...' : 'Completar Registro'}</button>
          <a href="#" onClick={(e) => { e.preventDefault(); setStep(1); setError(''); }}>&larr; Volver</a>
        </form>
        {error && <p style={{ color: 'var(--pico-color-red-500)' }}>{error}</p>}
      </article></main>
    );
  }

  if (step === 3) {
    // Formulario de Contraseña
    return (
      <main className="container"><article>
        <a href="#" onClick={(e) => { e.preventDefault(); setStep(1); setError(''); }}>&larr; Volver</a>
        <hgroup><h1>Hola, {foundUser.nombre}</h1><h2>Ingresa tu contraseña para continuar.</h2></hgroup>
        <form onSubmit={handlePasswordSubmit}>
          <label>Contraseña<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus required /></label>
          <button type="submit" aria-busy={isLoading}>{isLoading ? 'Ingresando...' : 'Iniciar Sesión'}</button>
        </form>
        {error && <p style={{ color: 'var(--pico-color-red-500)' }}>{error}</p>}
      </article></main>
    );
  }
  
  // Paso 1: Pedir Cédula
  return (
    <main className="container">
      <article>
        <h1 align="center">Programa de Hospitalización Domiciliaria</h1>
        <form onSubmit={handleCedulaSubmit}>
          <label>Ingresa tu Cédula para Continuar</label>
          <input type="text" value={cedula} onChange={(e) => setCedula(e.target.value)} placeholder="Número de Cédula" required />
          <button type="submit" aria-busy={isLoading}>{isLoading ? 'Verificando...' : 'Continuar'}</button>
        </form>
        {error && <p style={{ color: 'var(--pico-color-red-500)' }}>{error}</p>}
        <hr/>
        <div style={{textAlign: 'center'}}><button className="contrast" onClick={handleGoogleLogin}>O Continuar con Google</button></div>
      </article>
    </main>
  );
};

export default Login;