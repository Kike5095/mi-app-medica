import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';

const PatientForm = () => {
    const [patientName, setPatientName] = useState('');
    const [patientId, setPatientId] = useState('');
    const [selectedAux, setSelectedAux] = useState('');
    const [endDate, setEndDate] = useState('');
    const [assignableStaff, setAssignableStaff] = useState([]);

    useEffect(() => {
        const q = query(collection(db, "personal"), where("rol", "in", ["Auxiliar", "AuxiliarAdmin", "Jefe de Enfermería"]));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const staffData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAssignableStaff(staffData);
        });
        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!patientName || !patientId || !selectedAux || !endDate) {
            alert('Por favor, llena todos los campos');
            return;
        }
        try {
            await addDoc(collection(db, "patients"), {
                name: patientName, id: patientId, email_auxiliar_asignado: selectedAux,
                treatmentEndDate: new Date(endDate), createdAt: new Date(), status: 'Activo'
            });
            alert("¡Paciente guardado con éxito!");
            setPatientName(''); setPatientId(''); setSelectedAux(''); setEndDate('');
        } catch (error) {
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
                <label htmlFor="auxiliary">Asignar Personal</label>
                <select id="auxiliary" value={selectedAux} onChange={(e) => setSelectedAux(e.target.value)} required>
                    <option value="">Selecciona una persona...</option>
                    {assignableStaff.map(staff => (
                        <option key={staff.id} value={staff.email}>{staff.nombre} ({staff.rol})</option>
                    ))}
                </select>
                <label htmlFor="endDate">Fecha de Fin de Tratamiento</label>
                <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                <button type="submit">Guardar Paciente</button>
            </form>
        </article>
    );
};
export default PatientForm;