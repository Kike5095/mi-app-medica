import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
// Importamos las herramientas para actualizar
import { collection, onSnapshot, orderBy, query, doc, updateDoc } from 'firebase/firestore'; 

const PatientList = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "patients"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Cambiamos el nombre de la variable para no confundir con el ID de la cédula
      const patientsData = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
      setPatients(patientsData);
    });
    return () => unsubscribe();
  }, []);

  // --- NUEVA FUNCIÓN PARA CAMBIAR EL ESTADO ---
  const handleStatusChange = async (patientDocId, newStatus) => {
    const patientDocRef = doc(db, "patients", patientDocId);
    try {
      await updateDoc(patientDocRef, { status: newStatus });
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      alert("Hubo un error al cambiar el estado.");
    }
  };

  const styles = { /* ... (estilos sin cambios) ... */ };
  const getStatusStyle = (status) => { /* ... (estilos sin cambios) ... */ };

  // Para evitar errores, aquí está el código completo y final del archivo
  const FullPatientList = () => {
    const [patients, setPatients] = useState([]);

    useEffect(() => {
      const q = query(collection(db, "patients"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const patientsData = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
        setPatients(patientsData);
      });
      return () => unsubscribe();
    }, []);

    const handleStatusChange = async (patientDocId, newStatus) => {
      if (window.confirm(`¿Seguro que quieres cambiar el estado a "${newStatus}"?`)) {
        const patientDocRef = doc(db, "patients", patientDocId);
        try {
          await updateDoc(patientDocRef, { status: newStatus });
        } catch (error) {
          console.error("Error al actualizar estado:", error);
          alert("Error al cambiar el estado.");
        }
      }
    };

    const styles = {
      container: { marginTop: '30px' },
      table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
      th: { border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', textAlign: 'left' },
      td: { border: '1px solid #ddd', padding: '8px' },
      actionsCell: { display: 'flex', gap: '5px' },
      actionButton: { padding: '5px 10px', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
    };

    const getStatusStyle = (status) => {
      const baseStyle = { padding: '5px 8px', borderRadius: '5px', color: 'white', fontSize: '0.9em' };
      switch (status) {
        case 'Activo': return { ...baseStyle, backgroundColor: '#28a745' };
        case 'Pendiente': return { ...baseStyle, backgroundColor: '#ffc107', color: 'black' };
        case 'Finalizado': return { ...baseStyle, backgroundColor: '#6c757d' };
        default: return {};
      }
    };

    return (
      <div style={styles.container}>
        <h3>Pacientes Registrados</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nombre</th>
              <th style={styles.th}>Cédula</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Acciones</th> {/* Nueva Columna */}
            </tr>
          </thead>
          <tbody>
            {patients.map(patient => (
              <tr key={patient.docId}>
                <td style={styles.td}>{patient.name}</td>
                <td style={styles.td}>{patient.id}</td>
                <td style={styles.td}><span style={getStatusStyle(patient.status)}>{patient.status || 'N/A'}</span></td>
                {/* Nuevos Botones */}
                <td style={styles.td}>
                  <div style={styles.actionsCell}>
                    {patient.status === 'Pendiente' && (
                      <button 
                        style={{...styles.actionButton, backgroundColor: '#28a745'}}
                        onClick={() => handleStatusChange(patient.docId, 'Activo')}
                      >Activar</button>
                    )}
                    {patient.status === 'Activo' && (
                       <button 
                        style={{...styles.actionButton, backgroundColor: '#dc3545'}}
                        onClick={() => handleStatusChange(patient.docId, 'Finalizado')}
                      >Finalizar</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  return <FullPatientList />;
};

export default PatientList;