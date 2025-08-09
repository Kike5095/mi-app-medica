import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import PatientHistory from './PatientHistory.jsx';

const MedicoView = ({ usuario, handleLogout }) => {
    const [allPatients, setAllPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);

    const finalizeTreatment = async (patient) => {
        await updateDoc(doc(db, 'patients', patient.docId), { status: 'Finalizado' });
    };

    useEffect(() => {
        // Traemos TODOS los pacientes, ordenados por estado y luego por fecha
        const q = query(collection(db, "patients"), orderBy("status"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const patientsData = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
            setAllPatients(patientsData);
        });
        return () => unsubscribe();
    }, []);

    if (selectedPatient) {
        return <PatientHistory patient={selectedPatient} onBack={() => setSelectedPatient(null)} />;
    }

    // Filtramos las listas aquí en el código
    const activePatients = allPatients.filter(p => p.status !== 'Finalizado');
    const finishedPatients = allPatients.filter(p => p.status === 'Finalizado');

    return (
        <div className="container">
            <nav>
                <ul><li><strong>Panel de Médico</strong></li></ul>
                <ul><li>{usuario.email}</li><li><button className="secondary" onClick={handleLogout}>Cerrar Sesión</button></li></ul>
            </nav>
            <main>
                {/* LISTA DE PACIENTES ACTIVOS */}
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
                                        <td>{patient.id}</td>
                                        <td>{patient.status}</td>
                                        <td>
                                            <button onClick={() => setSelectedPatient(patient)}>Ver Historial</button>
                                            <button className="secondary" onClick={() => finalizeTreatment(patient)}>
                                                Finalizar Tratamiento
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </article>

                {/* LISTA DE PACIENTES FINALIZADOS */}
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
                                    // Le aplicamos un estilo gris a las filas de pacientes finalizados
                                    <tr key={patient.docId} style={{ opacity: 0.6 }}>
                                        <td>{patient.name}</td>
                                        <td>{patient.id}</td>
                                        <td>{patient.status}</td>
                                        <td><button className="secondary" onClick={() => setSelectedPatient(patient)}>Ver Historial</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </article>
            </main>
        </div>
    );
};

export default MedicoView;