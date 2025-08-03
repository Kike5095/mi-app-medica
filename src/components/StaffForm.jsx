// src/components/StaffForm.jsx
import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const StaffForm = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('Auxiliar');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre || !email || !rol) {
      alert('Por favor, llena todos los campos.');
      return;
    }
    try {
      await addDoc(collection(db, "personal"), { nombre, email, rol });
      alert('¡Personal guardado con éxito!');
      setNombre('');
      setEmail('');
    } catch (error) {
      alert("Hubo un error al guardar.");
    }
  };

  const styles = {
    form: { padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px', marginTop: '20px' },
    formGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '5px', fontWeight: 'bold' },
    input: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' },
    button: { padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
  };

  return (
    <form style={styles.form} onSubmit={handleSubmit}>
      <h3>Añadir Nuevo Personal</h3>
      <div style={styles.formGroup}>
        <label style={styles.label}>Nombre Completo</label>
        <input type="text" style={styles.input} value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Email</label>
        <input type="email" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Rol</label>
        <select style={styles.input} value={rol} onChange={(e) => setRol(e.target.value)}>
          <option value="Auxiliar">Auxiliar</option>
          <option value="Médico">Médico</option>
        </select>
      </div>
      <button type="submit" style={styles.button}>Guardar Personal</button>
    </form>
  );
};

export default StaffForm;