import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import PatientVitals from './PatientVitals';

const AuxiliarView = ({ usuario, handleLogout }) => {
    const [myPatients, setMyPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);

    useEffect(() => {
        if (usuario) {
            // --- CONSULTA CORREGIDA ---
            // Buscamos en el campo en singular 'email_auxiliar_asignado'
            const q = query(collection(db, "patients"), 
                where("email_auxiliar_asignado", "==", usuario.email),
                where("status", "!=", "Finalizado")
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const patientsData = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
                setMyPatients(patientsData);
            }, (error) => {
                // Este console.log nos ayudará a ver cualquier error de índices
                console.error("Error en la consulta de AuxiliarView:", error);
            });
            return () => unsubscribe();
        }
    }, [usuario]);

    if (selectedPatient) {
        return <PatientVitals patient={selectedPatient} onBack={() => setSelectedPatient(null)} />;
    }

    const styles = {
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' },
        logoutButton: { padding: '8px 15px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
        table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px' },
        th: { border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', textAlign: 'left' },
        td: { border: '1px solid #ddd', padding: '8px' },
        actionButton: { padding: '5px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <header style={styles.header}>
                <h2>Panel de Auxiliar</h2>
                <div>
                    <span>{usuario.email}</span>
                    <button onClick={handleLogout} style={styles.logoutButton}>Cerrar Sesión</button>
                </div>
            </header>
            <main style={{ marginTop: '30px' }}>
                <h3>Mis Pacientes Asignados</h3>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Nombre</th>
                            <th style={styles.th}>Cédula</th>
                            <th style={styles.th}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myPatients.map(patient => (
                            <tr key={patient.docId}>
                                <td style={styles.td}>{patient.name}</td>
                                <td style={styles.td}>{patient.id}</td>
                                <td style={styles.td}>
                                    <button style={styles.actionButton} onClick={() => setSelectedPatient(patient)}>
                                        Ver/Añadir Signos
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>
        </div>
    );
};

export default AuxiliarView;