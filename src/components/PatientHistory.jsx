import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register( CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend );

const PatientHistory = ({ patient, onBack }) => {
  const [vitals, setVitals] = useState([]);

  const finalizeTreatment = async () => {
    await updateDoc(doc(db, 'patients', patient.docId), { status: 'Finalizado' });
    onBack();
  };

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
  
  return (
    <main className="container">
      <nav>
        <ul><li><button className="secondary outline" onClick={onBack}>&larr; Volver a la lista</button></li></ul>
        <ul>
          <li><h2>Historial de: {patient.name}</h2></li>
          {patient.status !== 'Finalizado' && (
            <li><button onClick={finalizeTreatment}>Finalizar Tratamiento</button></li>
          )}
        </ul>
      </nav>
      
      {vitals.length > 1 && (
        <div className="grid">
          <article><h4>Temperatura</h4><Line options={chartOptions('')} data={tempData} /></article>
          <article><h4>Frecuencia Cardíaca</h4><Line options={chartOptions('')} data={heartRateData} /></article>
          <article><h4>Frecuencia Respiratoria</h4><Line options={chartOptions('')} data={respiratoryRateData} /></article>
          <article><h4>Saturación</h4><Line options={chartOptions('')} data={saturationData} /></article>
        </div>
      )}
      {vitals.length > 1 && <article><h4>Presión Arterial</h4><Line options={chartOptions('')} data={bloodPressureData} /></article>}

      <figure>
        <table>
          <thead>
            <tr>
              <th scope="col">Fecha y Hora</th>
              <th scope="col">Frec. Cardíaca</th>
              <th scope="col">Frec. Respiratoria</th>
              <th scope="col">Presión Arterial</th>
              <th scope="col">Saturación</th>
              <th scope="col">Temperatura</th>
              <th scope="col">Nota</th>
            </tr>
          </thead>
          <tbody>
            {vitals.map(vital => (
              <tr key={vital.id}>
                <td>{new Date(vital.timestamp.seconds * 1000).toLocaleString('es-CO')}</td>
                <td>{vital.heartRate} lpm</td>
                <td>{vital.respiratoryRate} rpm</td>
                <td>{vital.bloodPressure}</td>
                <td>{vital.saturation} %</td>
                <td>{vital.temperature} °C</td>
                <td>{vital.note}</td>
              </tr>
            )).reverse()}
          </tbody>
        </table>
      </figure>
    </main>
  );
};

export default PatientHistory;