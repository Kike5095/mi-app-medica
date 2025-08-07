import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, orderBy, query, doc, updateDoc, where } from 'firebase/firestore'; 

const PatientList = ({ onPatientSelect }) => {
  const [activePatients, setActivePatients] = useState([]);
  const [finishedPatients, setFinishedPatients] = useState([]);

  useEffect(() => {
    const qActive = query(collection(db, "patients"), where("status", "!=", "Finalizado"), orderBy("status"), orderBy("createdAt", "desc"));
    const unsubscribeActive = onSnapshot(qActive, (snapshot) => {
      setActivePatients(snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() })));
    });

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
      await updateDoc(patientDocRef, { status: newStatus });
    }
  };

  return (
    <>
      <article>
        <h4>Pacientes Activos y Pendientes</h4>
        <div style={{ overflowX: 'auto' }}>
          <table role="grid">
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Cédula</th>
                <th scope="col">Estado</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {activePatients.map(patient => (
                <tr key={patient.docId}>
                  <td>{patient.name}</td>
                  <td><a href="#" onClick={(e) => e.preventDefault()}>{patient.id}</a></td>
                  <td>{patient.status || 'N/A'}</td>
                  <td>
                    {/* --- INICIO DEL CÓDIGO CORREGIDO --- */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {patient.status === 'Pendiente' && 
                        <button style={{'--pico-background-color': '#28a745', '--pico-color': 'white'}} onClick={() => handleStatusChange(patient.docId, 'Activo')}>
                          Activar
                        </button>
                      }
                      {patient.status === 'Activo' && 
                        <button style={{'--pico-background-color': '#dc3545', '--pico-color': 'white'}} onClick={() => handleStatusChange(patient.docId, 'Finalizado')}>
                          Finalizar
                        </button>
                      }
                      <button className="secondary" onClick={() => onPatientSelect(patient)}>Ver Detalles</button>
                    </div>
                    {/* --- FIN DEL CÓDIGO CORREGIDO --- */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <article>
        <h4>Historial de Pacientes Finalizados</h4>
        <div style={{ overflowX: 'auto' }}>
          <table role="grid">
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Cédula</th>
                <th scope="col">Estado</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {finishedPatients.map(patient => (
                <tr key={patient.docId}>
                  <td>{patient.name}</td>
                  <td><a href="#" onClick={(e) => e.preventDefault()}>{patient.id}</a></td>
                  <td>{patient.status}</td>
                  <td><button className="secondary" onClick={() => onPatientSelect(patient)}>Ver Detalles</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </>
  );
};

export default PatientList;