// src/components/PatientVitals.jsx
// ... (código existente sin la función handleFinalizeTreatment y sin el botón)

// Para que sea más fácil, simplemente copia y pega este código completo
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, addDoc, query, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import Notes from './Notes';

ChartJS.register( CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend );

const PatientVitals = ({ patient, onBack }) => {
  const [temperature, setTemperature] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [respiratoryRate, setRespiratoryRate] = useState('');
  const [saturation, setSaturation] = useState('');
  const [note, setNote] = useState('');
  const [vitals, setVitals] = useState([]);

  useEffect(() => {
    const vitalsColRef = collection(db, "patients", patient.docId, "vitals");
    const q = query(vitalsColRef, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const vitalsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVitals(vitalsData);
    });
    return () => unsubscribe();
  }, [patient.docId]);

  const handleAddVital = async (e) => { e.preventDefault(); if (!temperature || !bloodPressure || !heartRate || !respiratoryRate || !saturation) { alert("Por favor, llena todos los campos."); return; } const numbers = bloodPressure.replace(/\D/g, ''); let formattedBP = bloodPressure; if (numbers.length >= 3 && numbers.length <= 6) { const splitPoint = numbers.length > 4 ? 3 : 2; const systolic = numbers.slice(0, splitPoint); const diastolic = numbers.slice(splitPoint); if (systolic && diastolic) { formattedBP = `${systolic}/${diastolic}`; } } else if (!bloodPressure.includes('/')) { alert("Por favor, ingresa la presión arterial en un formato reconocible (ej: 120/80, 12080)."); return; } try { await addDoc(collection(db, "patients", patient.docId, "vitals"), { temperature, bloodPressure: formattedBP, heartRate, respiratoryRate, saturation, note, author: auth.currentUser.displayName || auth.currentUser.email, timestamp: new Date() }); alert("¡Signos y nota guardados con éxito!"); setTemperature(''); setBloodPressure(''); setHeartRate(''); setRespiratoryRate(''); setSaturation(''); setNote(''); } catch (error) { console.error("Error al guardar: ", error); alert("Hubo un error al guardar."); } };

  const labels = vitals.map(v => new Date(v.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const chartOptions = (title) => ({ responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: title } } });
  const tempData = { labels, datasets: [{ label: 'Temperatura (°C)', data: vitals.map(v => v.temperature), borderColor: 'rgb(255, 99, 132)', backgroundColor: 'rgba(255, 99, 132, 0.5)' }] };
  const heartRateData = { labels, datasets: [{ label: 'Frecuencia Cardíaca (lpm)', data: vitals.map(v => v.heartRate), borderColor: 'rgb(53, 162, 235)', backgroundColor: 'rgba(53, 162, 235, 0.5)' }] };
  const bloodPressureData = { labels, datasets: [{ label: 'Sistólica', data: vitals.map(v => v.bloodPressure.split('/')[0]), borderColor: 'rgb(75, 192, 192)', backgroundColor: 'rgba(75, 192, 192, 0.5)' }, { label: 'Diastólica', data: vitals.map(v => v.bloodPressure.split('/')[1]), borderColor: 'rgb(153, 102, 255)', backgroundColor: 'rgba(153, 102, 255, 0.5)' }] };
  const respiratoryRateData = { labels, datasets: [{ label: 'Frecuencia Respiratoria (rpm)', data: vitals.map(v => v.respiratoryRate), borderColor: 'rgb(255, 159, 64)', backgroundColor: 'rgba(255, 159, 64, 0.5)' }] };
  const saturationData = { labels, datasets: [{ label: 'Saturación (%)', data: vitals.map(v => v.saturation), borderColor: 'rgb(99, 255, 132)', backgroundColor: 'rgba(99, 255, 132, 0.5)' }] };

  const styles = {
    container: { padding: '20px', fontFamily: 'sans-serif' }, header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, headerActions: { display: 'flex', alignItems: 'center', gap: '15px' }, backButton: { padding: '8px 15px', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer' }, form: { padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', marginTop: '20px' }, formGroup: { marginBottom: '15px' }, label: { display: 'block', marginBottom: '5px', fontWeight: 'bold' }, input: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }, textarea: { width: '100%', minHeight: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'sans-serif', fontSize: '1rem' }, button: { padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }, table: { width: '100%', borderCollapse: 'collapse', marginTop: '30px' }, th: { border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', textAlign: 'left' }, td: { border: '1px solid #ddd', padding: '8px' }, chartsContainer: { marginTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' },
    section: { marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #ccc' }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerActions}>
          <button onClick={onBack} style={styles.backButton}>&larr; Volver a la lista</button>
        </div>
        <h1>Historial de: {patient.name}</h1>
      </header>
      <hr />
      <div style={styles.section}>
        <form style={styles.form} onSubmit={handleAddVital}>
          <h3>Añadir Signos Vitales y Nota</h3>
          <div style={styles.formGroup}><label style={styles.label}>Frecuencia Cardíaca (lpm)</label><input type="number" style={styles.input} value={heartRate} onChange={(e) => setHeartRate(e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Frecuencia Respiratoria (rpm)</label><input type="number" style={styles.input} value={respiratoryRate} onChange={(e) => setRespiratoryRate(e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Presión Arterial (Sistólica/Diastólica)</label><input type="text" style={styles.input} value={bloodPressure} onChange={(e) => setBloodPressure(e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Saturación (%)</label><input type="number" style={styles.input} value={saturation} onChange={(e) => setSaturation(e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Temperatura (°C)</label><input type="number" step="0.1" style={styles.input} value={temperature} onChange={(e) => setTemperature(e.target.value)} /></div>
          <div style={styles.formGroup}><label style={styles.label}>Nota de Enfermería</label><textarea style={styles.textarea} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Añade una nota sobre la toma..."></textarea></div>
          <button type="submit" style={styles.button}>Guardar Signos y Nota</button>
        </form>
        {vitals.length > 1 && ( <div style={styles.chartsContainer}> <div><h3>Temperatura</h3><Line options={chartOptions('Evolución de Temperatura')} data={tempData} /></div> <div><h3>Frecuencia Cardíaca</h3><Line options={chartOptions('Evolución de Frecuencia Cardíaca')} data={heartRateData} /></div> <div><h3>Frecuencia Respiratoria</h3><Line options={chartOptions('Evolución de Frec. Respiratoria')} data={respiratoryRateData} /></div> <div><h3>Saturación</h3><Line options={chartOptions('Evolución de Saturación')} data={saturationData} /></div> <div><h3>Presión Arterial</h3><Line options={chartOptions('Evolución de Presión Arterial')} data={bloodPressureData} /></div> </div> )}
        <table style={styles.table}>
          <thead><tr><th style={styles.th}>Fecha y Hora</th><th style={styles.th}>Frec. Cardíaca</th><th style={styles.th}>Frec. Respiratoria</th><th style={styles.th}>Presión Arterial</th><th style={styles.th}>Saturación</th><th style={styles.th}>Temperatura</th><th style={styles.th}>Nota</th></tr></thead>
          <tbody>{vitals.map(vital => ( <tr key={vital.id}><td style={styles.td}>{new Date(vital.timestamp.seconds * 1000).toLocaleString('es-CO')}</td><td style={styles.td}>{vital.heartRate} lpm</td><td style={styles.td}>{vital.respiratoryRate} rpm</td><td style={styles.td}>{vital.bloodPressure}</td><td style={styles.td}>{vital.saturation} %</td><td style={styles.td}>{vital.temperature} °C</td><td style={styles.td}>{vital.note}</td></tr> )).reverse()}</tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientVitals;