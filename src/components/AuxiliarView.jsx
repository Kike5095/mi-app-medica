import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import PatientVitals from './PatientVitals.jsx';

const AuxiliarView = ({ usuario, handleLogout }) => {
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

        // Buscamos en la colección de pacientes un documento donde el campo 'id' coincida con la cédula
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
            console.error("Error buscando al paciente:", error);
            alert("Hubo un error al buscar.");
        }
        setIsLoading(false);
    };

    // Si encontramos un paciente, mostramos la vista de detalles para añadir signos
    if (foundPatient) {
        return <PatientVitals patient={foundPatient} onBack={() => { setFoundPatient(null); setSearchId(''); }} />;
    }

    const styles = {
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' },
        logoutButton: { padding: '8px 15px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
        searchContainer: { maxWidth: '500px', margin: '40px auto', textAlign: 'center' },
        input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1.1rem' },
        button: { width: '100%', padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1.1rem' }
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
            <main>
                <div style={styles.searchContainer}>
                    <h3>Buscar Paciente por Cédula</h3>
                    <form onSubmit={handleSearch}>
                        <input type="text" style={styles.input} value={searchId} onChange={(e) => setSearchId(e.target.value)} placeholder="Ingresa el número de cédula..." />
                        <button type="submit" style={styles.button} disabled={isLoading}>
                            {isLoading ? 'Buscando...' : 'Buscar Paciente'}
                        </button>
                    </form>
                    {notFound && <p style={{ color: 'red', marginTop: '15px' }}>Paciente no encontrado. Verifica la cédula e intenta de nuevo.</p>}
                </div>
            </main>
        </div>
    );
};

export default AuxiliarView;