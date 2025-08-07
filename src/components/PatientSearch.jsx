import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import PatientVitals from './PatientVitals.jsx';

const PatientSearch = () => {
    const [searchId, setSearchId] = useState('');
    const [foundPatient, setFoundPatient] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchId.trim()) return;
        setIsLoading(true);
        setNotFound(false);
        setFoundPatient(null);
        const q = query(collection(db, "patients"), where("id", "==", searchId.trim()));
        try {
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                setNotFound(true);
            } else {
                const patientData = { docId: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
                setFoundPatient(patientData);
            }
        } catch (error) {
            alert("Hubo un error al buscar.");
        }
        setIsLoading(false);
    };

    if (foundPatient) {
        return <PatientVitals patient={foundPatient} onBack={() => { setFoundPatient(null); setSearchId(''); }} />;
    }
    
    return (
        <article>
            <h4>Buscar Paciente por Cédula</h4>
            <form onSubmit={handleSearch}>
                <input type="text" value={searchId} onChange={(e) => setSearchId(e.target.value)} placeholder="Ingresa el número de cédula..." required />
                <button type="submit" aria-busy={isLoading}>
                    {isLoading ? 'Buscando...' : 'Buscar Paciente'}
                </button>
            </form>
            {notFound && <p style={{ color: 'var(--pico-color-red-500)' }}>Paciente no encontrado.</p>}
        </article>
    );
};
export default PatientSearch;