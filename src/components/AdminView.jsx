import React, { useState } from 'react';
import PatientForm from './PatientForm.jsx';
import PatientList from './PatientList.jsx';
import MedicoView from './MedicoView.jsx';
import AuxiliarView from './AuxiliarView.jsx';
import PatientHistory from './PatientHistory.jsx';

const AdminView = ({ usuario, handleLogout }) => {
  const [viewMode, setViewMode] = useState('admin');
  const [selectedPatient, setSelectedPatient] = useState(null);

  if (selectedPatient) {
    return <PatientHistory patient={selectedPatient} onBack={() => setSelectedPatient(null)} />;
  }

  const renderCurrentView = () => {
    switch (viewMode) {
      case 'medico':
        return <MedicoView usuario={usuario} handleLogout={handleLogout} />;
      case 'auxiliar':
        return <AuxiliarView usuario={usuario} handleLogout={handleLogout} />;
      case 'admin':
      default:
        return (
          <main>
            <section>
              <h2>Gestión de Pacientes</h2>
              <PatientForm />
              <PatientList onPatientSelect={(patient) => setSelectedPatient(patient)} />
            </section>
            {/* Ya no hay sección de Gestión de Personal aquí */}
          </main>
        );
    }
  };

  return (
    <div className="container">
      <nav>
        <ul><li><strong>Panel de Super-Administrador</strong></li></ul>
        <ul><li>{usuario.email}</li><li><button className="secondary" onClick={handleLogout}>Cerrar Sesión</button></li></ul>
      </nav>

      <nav>
        <ul>
          <li><strong>Simular Vista Como:</strong></li>
          <li><button className={viewMode === 'admin' ? '' : 'secondary'} onClick={() => setViewMode('admin')}>Administrador</button></li>
          <li><button className={viewMode === 'medico' ? '' : 'secondary'} onClick={() => setViewMode('medico')}>Médico</button></li>
          <li><button className={viewMode === 'auxiliar' ? '' : 'secondary'} onClick={() => setViewMode('auxiliar')}>Auxiliar</button></li>
        </ul>
      </nav>

      {renderCurrentView()}
    </div>
  );
};

export default AdminView;