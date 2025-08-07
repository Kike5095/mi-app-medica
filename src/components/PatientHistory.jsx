import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register( CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend );

const PatientHistory = ({ patient, onBack }) => {
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

  const labels = vitals.map(v => new Date(v.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const chartOptions = (title) => ({ responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: title } } });
  const tempData = { labels, datasets: [{ label: 'Temperatura (°C)', data: vitals.map(v => v.temperature), borderColor: 'rgb(255, 99, 132)', backgroundColor: 'rgba(255, 99, 132, 0.5)' }] };
  const heartRateData = { labels, datasets: [{ label: 'Frecuencia Cardíaca (lpm)', data: vitals.map(v => v.heartRate), borderColor: 'rgb(53, 162, 235)', backgroundColor: 'rgba(53, 162, 235, 0.5)' }] };
  const bloodPressureData = { labels, datasets: [{ label: 'Sistólica', data: vitals.map(v => v.bloodPressure.split('/')[0]), borderColor: 'rgb(75, 192, 192)', backgroundColor: 'rgba(75, 192, 192, 0.5)' }, { label: 'Diastólica', data: vitals.map(v => v.bloodPressure.split('/')[1]), borderColor: 'rgb(153, 102, 255)', backgroundColor: 'rgba(153, 102, 255, 0.5)' }] };
  const respiratoryRateData = { labels, datasets: [{ label: 'Frecuencia Respiratoria (rpm)', data: vitals.map(v => v.respiratoryRate), borderColor: 'rgb(255, 159, 64)', backgroundColor: 'rgba(255, 159, 64, 0.5)' }] };
  const saturationData = { labels, datasets: [{ label: 'Saturación (%)', data: vitals.map(v => v.saturation), borderColor: 'rgb(99, 255, 132)', backgroundColor: 'rgba(99, 255, 132, 0.5)' }] };

  const styles = {
    container: { padding: '20px', fontFamily: 'sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    backButton: { padding: '8px 15px', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '30px' },
    th: { border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', textAlign: 'left' },
    td: { border: '1px solid #ddd', padding: '8px' },
    chartsContainer: { marginTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' },
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>&larr; Volver a la lista</button>
        <h1>Historial de: {patient.name}</h1>
      </header>
      <hr />
      
      {vitals.length > 1 && ( <div style={styles.chartsContainer}> <div><h3>Temperatura</h3><Line options={chartOptions('Evolución de Temperatura')} data={tempData} /></div> <div><h3>Frecuencia Cardíaca</h3><Line options={chartOptions('Evolución de Frecuencia Cardíaca')} data={heartRateData} /></div> <div><h3>Frecuencia Respiratoria</h3><Line options={chartOptions('Evolución de Frec. Respiratoria')} data={respiratoryRateData} /></div> <div><h3>Saturación</h3><Line options={chartOptions('Evolución de Saturación')} data={saturationData} /></div> <div><h3>Presión Arterial</h3><Line options={chartOptions('Evolución de Presión Arterial')} data={bloodPressureData} /></div> </div> )}
      
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Fecha y Hora</th><th style={styles.th}>Frec. Cardíaca</th><th style={styles.th}>Frec. Respiratoria</th><th style={styles.th}>Presión Arterial</th><th style={styles.th}>Saturación</th><th style={styles.th}>Temperatura</th><th style={styles.th}>Nota</th></tr></thead>
        <tbody>{vitals.map(vital => ( <tr key={vital.id}><td style={styles.td}>{new Date(vital.timestamp.seconds * 1000).toLocaleString('es-CO')}</td><td style={styles.td}>{vital.heartRate} lpm</td><td style={styles.td}>{vital.respiratoryRate} rpm</td><td style={styles.td}>{vital.bloodPressure}</td><td style={styles.td}>{vital.saturation} %</td><td style={styles.td}>{vital.temperature} °C</td><td style={styles.td}>{vital.note}</td></tr> )).reverse()}</tbody>
      </table>
    </div>
  );
};

export default PatientHistory;