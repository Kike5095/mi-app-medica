import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const StaffForm = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('Auxiliar');
  const [isAdmin, setIsAdmin] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre || !email || !rol) {
      alert('Por favor, llena todos los campos.');
      return;
    }
    try {
      await addDoc(collection(db, "personal"), { nombre, email, rol, isAdmin });
      alert('¡Personal guardado con éxito!');
      setNombre('');
      setEmail('');
      setRol('Auxiliar');
      setIsAdmin(false);
    } catch (error) {
      alert("Hubo un error al guardar.");
    }
  };

  return (
    <article>
      <h4>Añadir Nuevo Personal</h4>
      <form onSubmit={handleSubmit}>
        <label>Nombre Completo</label>
        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        
        <label>Rol</label>
        <select value={rol} onChange={(e) => setRol(e.target.value)} required>
          <option value="Auxiliar">Auxiliar</option>
          <option value="Auxiliar Admin">Auxiliar Admin</option>
          <option value="Jefe de Enfermería">Jefe de Enfermería</option>
          <option value="Médico">Médico</option>
        </select>
        
        <fieldset>
          <label htmlFor="isAdmin">
            <input type="checkbox" id="isAdmin" name="isAdmin" role="switch" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
            Es Administrador
          </label>
        </fieldset>
        
        <button type="submit">Guardar Personal</button>
      </form>
    </article>
  );
};

export default StaffForm;