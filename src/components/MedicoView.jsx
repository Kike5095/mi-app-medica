import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, onSnapshot, orderBy, where, doc, updateDoc } from 'firebase/firestore';
import PatientHistory from './PatientHistory.jsx';

const MedicoView = ({ usuario, handleLogout }) => {
    const [allPatients, setAllPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);

    useEffect(() => {
        const q = query(collection(db, "patients"), where("status", "==", "Activo"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const patientsData = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
            setAllPatients(patientsData);
        });
        return () => unsubscribe();
    }, []);

    const handleFinalize = async (patientDocId) => {
        if(window.confirm("¿Seguro que quieres finalizar este tratamiento?")) {
          const patientDocRef = doc(db, "patients", patientDocId);
          await updateDoc(patientDocRef, { status: "Finalizado" });
        }
    };

    if (selectedPatient) {
        return <PatientHistory patient={selectedPatient} onBack={() => setSelectedPatient(null)} />;
    }

    return (
        <div className="container">
            <nav>
                <ul><li><strong>Panel de Médico</strong></li></ul>
                <ul><li>{usuario.email}</li><li><button className="secondary" onClick={handleLogout}>Cerrar Sesión</button></li></ul>
            </nav>
            <main>
                <h3>Lista de Pacientes Activos</h3>
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
                            {allPatients.map(patient => (
                                <tr key={patient.docId}>
                                    <td>{patient.name}</td>
                                    <td>{patient.id}</td>
                                    <td>{patient.status}</td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                            <button onClick={() => setSelectedPatient(patient)}>Ver Historial</button>
                                            <button style={{ backgroundColor: 'var(--pico-color-red-500)'}} className="contrast" onClick={() => handleFinalize(patient.docId)}>Finalizar</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default MedicoView;