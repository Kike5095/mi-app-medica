import React, { useState } from 'react';
import PatientForm from './PatientForm.jsx';
import PatientList from './PatientList.jsx';
import PatientVitals from './PatientVitals.jsx';

const AdminRestringidoView = ({ usuario, handleLogout }) => {
  const [selectedPatient, setSelectedPatient] = useState(null);

  if (selectedPatient) {
    return <PatientVitals patient={selectedPatient} onBack={() => setSelectedPatient(null)} />;
  }

  return (
    <div className="container">
      <nav>
        <ul><li><strong>Panel de Administración</strong></li></ul>
        <ul><li>{usuario.email}</li><li><button className="secondary" onClick={handleLogout}>Cerrar Sesión</button></li></ul>
      </nav>
      
      <main>
        <section>
          <h2>Gestión de Pacientes</h2>
          <PatientForm />
          <PatientList onPatientSelect={(patient) => setSelectedPatient(patient)} />
        </section>
      </main>
    </div>
  );
};

export default AdminRestringidoView;