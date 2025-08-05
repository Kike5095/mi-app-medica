import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, onSnapshot, orderBy, where, doc, updateDoc } from 'firebase/firestore';
import PatientHistory from './PatientHistory';

const MedicoView = ({ usuario, handleLogout }) => {
    const [allPatients, setAllPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);

    useEffect(() => {
        const q = query(collection(db, "patients"), where("status", "!=", "Finalizado"), orderBy("status"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const patientsData = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
            setAllPatients(patientsData);
        });
        return () => unsubscribe();
    }, []);

    const handleFinalize = async (patientDocId) => {
        if(window.confirm("¿Seguro que quieres finalizar este tratamiento?")) {
          const patientDocRef = doc(db, "patients", patientDocId);
          try {
            await updateDoc(patientDocRef, { status: "Finalizado" });
          } catch (error) {
            console.error("Error al finalizar:", error);
          }
        }
    };

    if (selectedPatient) {
        return <PatientHistory patient={selectedPatient} onBack={() => setSelectedPatient(null)} />;
    }

    const styles = {
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' },
        logoutButton: { padding: '8px 15px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
        table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
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
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <header style={styles.header}>
                <h2>Panel de Médico</h2>
                <div>
                    <span>{usuario.email}</span>
                    <button onClick={handleLogout} style={styles.logoutButton}>Cerrar Sesión</button>
                </div>
            </header>
            <main style={{ marginTop: '30px' }}>
                <h3>Lista de Pacientes Activos y Pendientes</h3>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Nombre</th>
                            <th style={styles.th}>Cédula</th>
                            <th style={styles.th}>Estado</th>
                            <th style={styles.th}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allPatients.map(patient => (
                            <tr key={patient.docId}>
                                <td style={styles.td}>{patient.name}</td>
                                <td style={styles.td}>{patient.id}</td>
                                <td style={styles.td}><span style={getStatusStyle(patient.status)}>{patient.status}</span></td>
                                <td style={styles.td}>
                                    <div style={styles.actionsCell}>
                                      <button style={{...styles.actionButton, backgroundColor: '#17a2b8'}} onClick={() => setSelectedPatient(patient)}>Ver Historial</button>
                                      {patient.status === 'Activo' && (
                                        <button style={{...styles.actionButton, backgroundColor: '#dc3545'}} onClick={() => handleFinalize(patient.docId)}>Finalizar</button>
                                      )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>
        </div>
    );
};

export default MedicoView;