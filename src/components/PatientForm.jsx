import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, query, onSnapshot } from 'firebase/firestore';

const PatientForm = () => {
  const [patientName, setPatientName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [selectedAux, setSelectedAux] = useState('');
  const [auxiliares, setAuxiliares] = useState([]);

  useEffect(() => {
    // 1. Traemos TODO el personal, sin filtrar
    const q = query(collection(db, "personal"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const allStaff = querySnapshot.docs.map(doc => ({
        id: doc.id, 
        ...doc.data()
      }));
      
      // 2. Filtramos el personal aquí en el código para quedarnos solo con los auxiliares
      const auxsData = allStaff.filter(member => member.rol === 'Auxiliar');
      
      setAuxiliares(auxsData);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientName || !patientId || !selectedAux) {
      alert('Por favor, llena todos los campos, incluyendo la auxiliar');
      return;
    }
    try {
      await addDoc(collection(db, "patients"), {
        name: patientName,
        id: patientId,
        email_auxiliar_asignado: selectedAux,
        createdAt: new Date()
      });
      alert("¡Paciente guardado con éxito!");
      setPatientName('');
      setPatientId('');
      setSelectedAux('');
    } catch (error) {
      console.error("Error al añadir el documento: ", error);
      alert("Hubo un error al guardar el paciente.");
    }
  };
  
  const styles = {
    form: { padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', marginTop: '30px' },
    formGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '5px', fontWeight: 'bold' },
    input: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' },
    button: { padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
  };

  return (
    <form style={styles.form} onSubmit={handleSubmit}>
      <h3>Añadir Nuevo Paciente</h3>
      <div style={styles.formGroup}>
        <label htmlFor="patientName" style={styles.label}>Nombre Completo</label>
        <input 
          type="text" id="patientName" style={styles.input}
          value={patientName} onChange={(e) => setPatientName(e.target.value)}
        />
      </div>
      <div style={styles.formGroup}>
        <label htmlFor="patientId" style={styles.label}>Cédula</label>
        <input 
          type="text" id="patientId" style={styles.input}
          value={patientId} onChange={(e) => setPatientId(e.target.value)}
        />
      </div>
      <div style={styles.formGroup}>
        <label htmlFor="auxiliary" style={styles.label}>Asignar Auxiliar</label>
        <select 
          id="auxiliary" style={styles.input}
          value={selectedAux} onChange={(e) => setSelectedAux(e.target.value)}
        >
          <option value="">Selecciona una auxiliar...</option>
          {auxiliares.map(aux => (
            <option key={aux.id} value={aux.email}>
              {aux.nombre}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" style={styles.button}>Guardar Paciente</button>
    </form>
  );
};

export default PatientForm;