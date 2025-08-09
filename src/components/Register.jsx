// src/components/Register.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Recupera la cédula enviada desde Login.jsx si existe
  const cedulaDesdeLogin = location.state?.cedula || '';

  const [cedula, setCedula] = useState(cedulaDesdeLogin);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (cedulaDesdeLogin) {
      setCedula(cedulaDesdeLogin);
    }
  }, [cedulaDesdeLogin]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!cedula || !nombre || !apellido || !correo) {
      setError('Por favor, complete todos los campos.');
      return;
    }

    try {
      await addDoc(collection(db, "personal"), {
        cedula,
        nombre,
        apellido,
        email: correo,
        rol: "Auxiliar" // Rol por defecto
      });

      alert('Registro exitoso');
      navigate('/'); // Regresa al login
    } catch (err) {
      console.error("Error al registrar: ", err);
      setError('Hubo un problema al registrar, intente de nuevo.');
    }
  };

  return (
    <div className="container">
      <h2>Registro de Personal</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label>Cédula:</label>
          <input
            type="text"
            value={cedula}
            onChange={(e) => setCedula(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Nombre:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Apellido:</label>
          <input
            type="text"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Correo:</label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit">Registrar</button>
      </form>
    </div>
  );
};

export default Register;
