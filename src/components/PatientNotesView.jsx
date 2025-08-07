import React from 'react';
import Notes from './Notes.jsx'; // Reutilizamos el componente que ya teníamos

const PatientNotesView = ({ patient, onBack }) => {
  return (
    <main className="container">
      <nav>
        <ul>
          <li>
            <button className="secondary outline" onClick={onBack}>
              &larr; Volver al Historial
            </button>
          </li>
        </ul>
        <ul>
          <li>
            <h2>Notas de Enfermería de: {patient.name}</h2>
          </li>
        </ul>
      </nav>

      <Notes patientId={patient.docId} />
    </main>
  );
};

export default PatientNotesView;