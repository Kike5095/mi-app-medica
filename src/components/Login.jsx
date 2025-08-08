import React, { useState } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
  const [step, setStep] = useState(1); // 1: Pedir cédula, 2: Registrar, 3: Pedir contraseña
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Estados para el formulario de registro
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
      // SI NO SE ENCUENTRA, PASAMOS DIRECTAMENTE AL REGISTRO
      setStep(2);
    } else {
      // Si se encuentra, pedimos la contraseña
      setFoundUser(querySnapshot.docs[0].data());
      setStep(3);
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
      setError("Contraseña incorrecta. Por favor, intenta de nuevo.");
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
        nombre: nombre,
        email: email,
        cedula: cedula.trim(),
        rol: "Auxiliar",
        uid: userCredential.user.uid
      });
    } catch (err) {
      setError("Error al registrar: " + err.message);
    }
    setIsLoading(false);
  };
  
  // --- RENDERIZADO DE CADA PASO ---

  // PASO 2: FORMULARIO DE REGISTRO
  if (step === 2) {
    return (
      <main className="container" style={{ maxWidth: '450px', marginTop: '5rem' }}>
        <article>
          <hgroup>
            <h1>Registro de Nuevo Usuario</h1>
            <h2>La cédula **{cedula}** no fue encontrada. Por favor, completa tu perfil.</h2>
          </hgroup>
          <form onSubmit={handleRegisterSubmit}>
            <label>Nombre Completo<input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required /></label>
            <label>Correo Electrónico (será tu usuario)<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
            <label>Crea una Contraseña (mínimo 6 caracteres)<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
            <label>Rol (asignado por defecto)</label>
            <input type="text" value="Auxiliar" disabled />
            <button type="submit" aria-busy={isLoading}>{isLoading ? 'Registrando...' : 'Completar Registro'}</button>
            <a href="#" onClick={(e) => { e.preventDefault(); setStep(1); setError(''); }}>&larr; Usar otra cédula</a>
          </form>
          {error && <p style={{ color: 'var(--pico-color-red-500)' }}>{error}</p>}
        </article>
      </main>
    );
  }

  // PASO 3: FORMULARIO DE CONTRASEÑA
  if (step === 3) {
    return (
      <main className="container" style={{ maxWidth: '450px', marginTop: '5rem' }}>
        <article>
          <a href="#" onClick={(e) => { e.preventDefault(); setStep(1); setError(''); }}>&larr; Usar otra cédula</a>
          <hgroup><h1>Hola, {foundUser.nombre}</h1><h2>Ingresa tu contraseña para continuar.</h2></hgroup>
          <form onSubmit={handlePasswordSubmit}>
            <label>Contraseña<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus required /></label>
            <button type="submit" aria-busy={isLoading}>{isLoading ? 'Ingresando...' : 'Iniciar Sesión'}</button>
          </form>
          {error && <p style={{ color: 'var(--pico-color-red-500)' }}>{error}</p>}
        </article>
      </main>
    );
  }
  
  // PASO 1: FORMULARIO DE CÉDULA
  return (
    <main className="container" style={{ maxWidth: '450px', marginTop: '5rem' }}>
      <article>
        <h1 align="center">Programa de Hospitalización Domiciliaria</h1>
        <form onSubmit={handleCedulaSubmit}>
          <label>Ingresa tu Cédula para Continuar</label>
          <input type="text" value={cedula} onChange={(e) => setCedula(e.target.value)} placeholder="Número de Cédula" required />
          <button type="submit" aria-busy={isLoading}>{isLoading ? 'Verificando...' : 'Continuar'}</button>
        </form>
        {error && <p style={{ color: 'var(--pico-color-red-500)' }}>{error}</p>}
      </article>
    </main>
  );
};

export default Login;