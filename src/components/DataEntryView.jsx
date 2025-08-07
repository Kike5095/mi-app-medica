import React, { useState } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

const DataEntryView = () => {
    const [searchId, setSearchId] = useState('');
    const [patient, setPatient] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Estados para los signos vitales
    const [temperature, setTemperature] = useState('');
    const [bloodPressure, setBloodPressure] = useState('');
    const [heartRate, setHeartRate] = useState('');
    const [note, setNote] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchId.trim()) return;
        setIsLoading(true);
        setNotFound(false);
        setPatient(null);
        const q = query(collection(db, "patients"), where("id", "==", searchId.trim()));
        try {
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                setNotFound(true);
            } else {
                setPatient({ docId: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
            }
        } catch (error) {
            alert("Hubo un error al buscar.");
        }
        setIsLoading(false);
    };

    const handleAddVital = async (e) => {
        e.preventDefault();
        if (!temperature || !bloodPressure || !heartRate) {
            alert("Por favor, llena todos los campos de signos vitales.");
            return;
        }
        try {
            await addDoc(collection(db, "patients", patient.docId, "vitals"), {
                temperature, bloodPressure, heartRate, note,
                author: auth.currentUser.displayName || auth.currentUser.email,
                timestamp: new Date()
            });
            alert("¡Signos vitales guardados con éxito!");
            setTemperature(''); setBloodPressure(''); setHeartRate(''); setNote('');
            // Opcional: volver a la búsqueda después de guardar
            // setPatient(null);
            // setSearchId('');
        } catch (error) {
            alert("Hubo un error al guardar.");
        }
    };

    return (
        <article>
            {!patient ? (
                <>
                    <h4>Buscar Paciente para Registrar Visita</h4>
                    <form onSubmit={handleSearch}>
                        <input type="text" value={searchId} onChange={(e) => setSearchId(e.target.value)} placeholder="Ingresa la cédula del paciente..." required />
                        <button type="submit" aria-busy={isLoading}>{isLoading ? 'Buscando...' : 'Buscar'}</button>
                    </form>
                    {notFound && <p style={{ color: 'var(--pico-color-red-500)' }}>Paciente no encontrado.</p>}
                </>
            ) : (
                <form onSubmit={handleAddVital}>
                    <h4>Registrando Signos para: {patient.name}</h4>
                    <div className="grid">
                        <label>Temperatura (°C)<input type="number" step="0.1" value={temperature} onChange={(e) => setTemperature(e.target.value)} /></label>
                        <label>Presión Arterial (Sist/Dias)<input type="text" value={bloodPressure} onChange={(e) => setBloodPressure(e.target.value)} /></label>
                        <label>Frec. Cardíaca (lpm)<input type="number" value={heartRate} onChange={(e) => setHeartRate(e.target.value)} /></label>
                    </div>
                    <label>Nota de Enfermería</label>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Añade una nota..."></textarea>
                    <button type="submit">Guardar Visita</button>
                    <button type="button" className="secondary outline" onClick={() => setPatient(null)}>Buscar otro paciente</button>
                </form>
            )}
        </article>
    );
};

export default DataEntryView;