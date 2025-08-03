// src/components/PatientList.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';

const PatientList = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    // Esta función se conecta a la colección "patients"
    // y se actualiza sola cada vez que hay un cambio.
    const unsubscribe = onSnapshot(collection(db, "patients"), (snapshot) => {
      const patientsData = snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
      setPatients(patientsData);
    });

    // Limpia el listener cuando el componente se desmonta
    return () => unsubscribe();
  }, []);

  // Estilos
  const styles = {
    container: { marginTop: '30px' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    th: { border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', textAlign: 'left' },
    td: { border: '1px solid #ddd', padding: '8px' }
  };

  return (
    <div style={styles.container}>
      <h3>Pacientes Registrados</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Nombre</th>
            <th style={styles.th}>Cédula</th>
          </tr>
        </thead>
        <tbody>
          {patients.map(patient => (
            <tr key={patient.docId}>
              <td style={styles.td}>{patient.name}</td>
              <td style={styles.td}>{patient.id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientList;