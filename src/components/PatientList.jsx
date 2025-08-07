import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, orderBy, query, doc, updateDoc, where } from 'firebase/firestore'; 

const PatientList = ({ onPatientSelect }) => {
  const [activePatients, setActivePatients] = useState([]);
  const [finishedPatients, setFinishedPatients] = useState([]);

  useEffect(() => {
    // Consulta para pacientes activos y pendientes
    const qActive = query(collection(db, "patients"), where("status", "!=", "Finalizado"), orderBy("status"), orderBy("createdAt", "desc"));
    const unsubscribeActive = onSnapshot(qActive, (snapshot) => {
      setActivePatients(snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() })));
    });

    // Consulta para pacientes finalizados
    const qFinished = query(collection(db, "patients"), where("status", "==", "Finalizado"), orderBy("createdAt", "desc"));
    const unsubscribeFinished = onSnapshot(qFinished, (snapshot) => {
      setFinishedPatients(snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeActive();
      unsubscribeFinished();
    };
  }, []);

  const handleStatusChange = async (patientDocId, newStatus) => {
    if (window.confirm(`¿Seguro que quieres cambiar el estado a "${newStatus}"?`)) {
      const patientDocRef = doc(db, "patients", patientDocId);
      try {
        await updateDoc(patientDocRef, { status: newStatus });
      } catch (error) {
        console.error("Error al actualizar estado:", error);
      }
    }
  };
  
  const styles = {
    container: { marginTop: '30px' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    th: { border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', textAlign: 'left' },
    td: { border: '1px solid #ddd', padding: '8px' },
    actionsCell: { display: 'flex', gap: '5px' },
    actionButton: { padding: '5px 10px', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    detailsButton: { padding: '5px 10px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
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
      {/* Tabla de Pacientes Activos y Pendientes */}
      <h3>Pacientes Activos y Pendientes</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Nombre</th>
            <th style={styles.th}>Cédula</th>
            <th style={styles.th}>Estado</th>
            <th style={styles.th}>Acciones</th>
            <th style={styles.th}>Historial</th>
          </tr>
        </thead>
        <tbody>
          {activePatients.map(patient => (
            <tr key={patient.docId}>
              <td style={styles.td}>{patient.name}</td>
              <td style={styles.td}>{patient.id}</td>
              <td style={styles.td}><span style={getStatusStyle(patient.status)}>{patient.status}</span></td>
              <td style={styles.td}>
                <div style={styles.actionsCell}>
                  {patient.status === 'Pendiente' && <button style={{...styles.actionButton, backgroundColor: '#28a745'}} onClick={() => handleStatusChange(patient.docId, 'Activo')}>Activar</button>}
                  {patient.status === 'Activo' && <button style={{...styles.actionButton, backgroundColor: '#dc3545'}} onClick={() => handleStatusChange(patient.docId, 'Finalizado')}>Finalizar</button>}
                </div>
              </td>
              <td style={styles.td}><button style={styles.detailsButton} onClick={() => onPatientSelect(patient)}>Ver Detalles</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tabla de Historial de Pacientes Finalizados */}
      <div style={{marginTop: '40px'}}>
        <h3>Historial de Pacientes Finalizados</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nombre</th>
              <th style={styles.th}>Cédula</th>
              <th style={styles.th}>Estado</th>
              <th style={styles.th}>Historial</th>
            </tr>
          </thead>
          <tbody>
            {finishedPatients.map(patient => (
              <tr key={patient.docId}>
                <td style={styles.td}>{patient.name}</td>
                <td style={styles.td}>{patient.id}</td>
                <td style={styles.td}><span style={getStatusStyle(patient.status)}>{patient.status}</span></td>
                <td style={styles.td}><button style={styles.detailsButton} onClick={() => onPatientSelect(patient)}>Ver Detalles</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientList;