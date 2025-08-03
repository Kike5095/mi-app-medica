// src/components/PatientVitals.jsx
import React from 'react';

// Recibe el paciente seleccionado y una función para volver atrás
const PatientVitals = ({ patient, onBack }) => {
  const styles = {
    container: { padding: '20px', fontFamily: 'sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    backButton: { padding: '8px 15px', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer' }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>
          &larr; Volver a la lista
        </button>
        <h1>Historial de: {patient.name}</h1>
      </header>
      <hr />
      <div style={{ marginTop: '20px' }}>
        <p><strong>Cédula:</strong> {patient.id}</p>
        {/* Aquí irá el formulario para añadir signos vitales */}
        <p style={{ marginTop: '30px', color: 'gray' }}>
          (Próximamente: Formulario y lista de signos vitales)
        </p>
      </div>
    </div>
  );
};

export default PatientVitals;