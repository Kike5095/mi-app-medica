import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const PatientForm = () => {
    const [patientName, setPatientName] = useState('');
    const [patientId, setPatientId] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!patientName || !patientId || !endDate) {
            alert('Por favor, llena todos los campos');
            return;
        }
        try {
            await addDoc(collection(db, "patients"), {
                name: patientName,
                id: patientId,
                // Ya no guardamos el email de la auxiliar aquí
                treatmentEndDate: new Date(endDate),
                createdAt: new Date(),
                status: 'Pendiente'
            });
            alert("¡Paciente guardado con éxito!");
            setPatientName('');
            setPatientId('');
            setEndDate('');
        } catch (error) {
            console.error("Error al añadir el documento: ", error);
            alert("Hubo un error al guardar el paciente.");
        }
    };

    return (
        <article>
            <h4>Añadir Nuevo Paciente</h4>
            <form onSubmit={handleSubmit}>
                <label htmlFor="patientName">Nombre Completo</label>
                <input type="text" id="patientName" value={patientName} onChange={(e) => setPatientName(e.target.value)} required />

                <label htmlFor="patientId">Cédula</label>
                <input type="text" id="patientId" value={patientId} onChange={(e) => setPatientId(e.target.value)} required />

                <label htmlFor="endDate">Fecha de Fin de Tratamiento</label>
                <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />

                <button type="submit">Guardar Paciente</button>
            </form>
        </article>
    );
};

export default PatientForm;