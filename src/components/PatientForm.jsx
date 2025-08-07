import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, query, onSnapshot } from 'firebase/firestore';

const PatientForm = () => {
    const [patientName, setPatientName] = useState('');
    const [patientId, setPatientId] = useState('');
    const [selectedStaff, setSelectedStaff] = useState('');
    const [endDate, setEndDate] = useState('');
    const [assignableStaff, setAssignableStaff] = useState([]);

    useEffect(() => {
        const q = query(collection(db, "personal"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const allStaff = querySnapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data() 
            }));
            const filteredStaff = allStaff.filter(member => 
                member.rol === 'Auxiliar' || 
                member.rol === 'AuxiliarAdmin' || 
                member.rol === 'Jefe de Enfermería'
            );
            setAssignableStaff(filteredStaff);
        });
        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!patientName || !patientId || !selectedStaff || !endDate) {
            alert('Por favor, llena todos los campos');
            return;
        }
        try {
            await addDoc(collection(db, "patients"), {
                name: patientName,
                id: patientId,
                email_auxiliar_asignado: selectedStaff,
                treatmentEndDate: new Date(endDate),
                createdAt: new Date(),
                status: 'Pendiente'
            });
            alert("¡Paciente guardado con éxito!");
            setPatientName(''); setPatientId(''); setSelectedStaff(''); setEndDate('');
        } catch (error) {
            console.error("Error al añadir el documento: ", error);
            alert("Hubo un error al guardar el paciente.");
        }
    };

    const styles = {
        form: { padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', marginTop: '30px' },
        formGroup: { marginBottom: '15px' },
        label: { display: 'block', marginBottom: '5px', fontWeight: 'bold' },
        input: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' },
        button: { padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
    };

    return (
        <form style={styles.form} onSubmit={handleSubmit}>
            <h3>Añadir Nuevo Paciente</h3>
            <div style={styles.formGroup}><label htmlFor="patientName" style={styles.label}>Nombre Completo</label><input type="text" id="patientName" style={styles.input} value={patientName} onChange={(e) => setPatientName(e.target.value)} /></div>
            <div style={styles.formGroup}><label htmlFor="patientId" style={styles.label}>Cédula</label><input type="text" id="patientId" style={styles.input} value={patientId} onChange={(e) => setPatientId(e.target.value)} /></div>
            <div style={styles.formGroup}>
                <label htmlFor="staff" style={styles.label}>Asignar Personal</label>
                <select id="staff" style={styles.input} value={selectedStaff} onChange={(e) => setSelectedStaff(e.target.value)}>
                    <option value="">Selecciona una persona...</option>
                    {assignableStaff.map(staff => (
                        <option key={staff.id} value={staff.email}>{staff.nombre} ({staff.rol})</option>
                    ))}
                </select>
            </div>
            <div style={styles.formGroup}>
                <label htmlFor="endDate" style={styles.label}>Fecha de Fin de Tratamiento</label>
                <input type="date" id="endDate" style={styles.input} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <button type="submit" style={styles.button}>Guardar Paciente</button>
        </form>
    );
};

export default PatientForm;