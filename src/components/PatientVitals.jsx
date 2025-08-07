import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, addDoc, query, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

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

  const handleAddVital = async (e) => {
    e.preventDefault();
    if (!temperature || !bloodPressure || !heartRate || !respiratoryRate || !saturation) {
      alert("Por favor, llena todos los campos de signos vitales."); return;
    }
    const numbers = bloodPressure.replace(/\D/g, '');
    let formattedBP = bloodPressure;
    if (numbers.length >= 3 && numbers.length <= 6) { const splitPoint = numbers.length > 4 ? 3 : 2; const systolic = numbers.slice(0, splitPoint); const diastolic = numbers.slice(splitPoint); if (systolic && diastolic) { formattedBP = `${systolic}/${diastolic}`; } } else if (!bloodPressure.includes('/')) { alert("Por favor, ingresa la presión arterial en un formato reconocible (ej: 120/80, 12080)."); return; }
    try {
      await addDoc(collection(db, "patients", patient.docId, "vitals"), {
        temperature, bloodPressure: formattedBP, heartRate, respiratoryRate, saturation, note, author: auth.currentUser.displayName || auth.currentUser.email, timestamp: new Date()
      });
      alert("¡Signos y nota guardados con éxito!");
      setTemperature(''); setBloodPressure(''); setHeartRate(''); setRespiratoryRate(''); setSaturation(''); setNote('');
    } catch (error) {
      console.error("Error al guardar: ", error); alert("Hubo un error al guardar.");
    }
  };

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
        <ul><li><h2>Historial de: {patient.name}</h2></li></ul>
      </nav>
      
      <article>
        <form onSubmit={handleAddVital}>
          <h4>Añadir Signos Vitales y Nota</h4>
          <div className="grid">
            <label>Frec. Cardíaca (lpm)<input type="number" value={heartRate} onChange={(e) => setHeartRate(e.target.value)} /></label>
            <label>Frec. Respiratoria (rpm)<input type="number" value={respiratoryRate} onChange={(e) => setRespiratoryRate(e.target.value)} /></label>
          </div>
          <div className="grid">
            <label>Presión Arterial (Sist/Dias)<input type="text" value={bloodPressure} onChange={(e) => setBloodPressure(e.target.value)} /></label>
            <label>Saturación (%)<input type="number" value={saturation} onChange={(e) => setSaturation(e.target.value)} /></label>
            <label>Temperatura (°C)<input type="number" step="0.1" value={temperature} onChange={(e) => setTemperature(e.target.value)} /></label>
          </div>
          <label>Nota de Enfermería</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Añade una nota sobre la toma..."></textarea>
          <button type="submit">Guardar Signos y Nota</button>
        </form>
      </article>

      {vitals.length > 1 && (
        <section>
          <h4>Gráficas de Evolución</h4>
          <div className="grid">
            <article><h6>Temperatura</h6><Line options={chartOptions('')} data={tempData} /></article>
            <article><h6>Frecuencia Cardíaca</h6><Line options={chartOptions('')} data={heartRateData} /></article>
            <article><h6>Frecuencia Respiratoria</h6><Line options={chartOptions('')} data={respiratoryRateData} /></article>
            <article><h6>Saturación</h6><Line options={chartOptions('')} data={saturationData} /></article>
          </div>
          <article><Line options={chartOptions('Evolución de Presión Arterial')} data={bloodPressureData} /></article>
        </section>
      )}

      <figure>
        <table>
          {/* ... (código de la tabla sin cambios) ... */}
        </table>
      </figure>
    </main>
  );
};

export default PatientVitals;