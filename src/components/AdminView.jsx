import React, { useState } from 'react';
import PatientForm from './PatientForm';
import PatientList from './PatientList';
import StaffForm from './StaffForm';
import StaffList from './StaffList';
import MedicoView from './MedicoView';
import AuxiliarView from './AuxiliarView';
import PatientVitals from './PatientVitals';

const AdminView = ({ usuario, handleLogout }) => {
  const [viewMode, setViewMode] = useState('admin');
  const [selectedPatient, setSelectedPatient] = useState(null);

  if (selectedPatient) {
    return <PatientVitals patient={selectedPatient} onBack={() => setSelectedPatient(null)} />;
  }

  const styles = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' },
    logoutButton: { padding: '8px 15px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    mainContent: { marginTop: '20px' },
    simulationBar: { padding: '10px', backgroundColor: '#e9ecef', marginBottom: '20px', borderRadius: '5px', display: 'flex', gap: '10px', alignItems: 'center' },
    simButton: { padding: '8px 12px', border: '1px solid #ccc', cursor: 'pointer', backgroundColor: 'white', borderRadius: '5px' },
    // --- CAMBIO AQUÍ para solucionar la advertencia ---
    activeSimButton: { backgroundColor: '#007bff', color: 'white', border: '1px solid #007bff' },
    section: { marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #ccc' }
  };

  const renderCurrentView = () => {
    switch (viewMode) {
      case 'medico':
        return <MedicoView usuario={usuario} handleLogout={handleLogout} />;
      case 'auxiliar':
        return <AuxiliarView usuario={usuario} handleLogout={handleLogout} />;
      case 'admin':
      default:
        return (
          <main style={styles.mainContent}>
            <div style={styles.section}>
              <h2>Gestión de Pacientes</h2>
              <PatientForm />
              <PatientList onPatientSelect={(patient) => setSelectedPatient(patient)} />
            </div>
            <div style={styles.section}>
              <h2>Gestión de Personal</h2>
              <StaffForm />
              <StaffList />
            </div>
          </main>
        );
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={styles.header}>
        <h2>Panel de Super-Administrador</h2>
        <div>
          <span>{usuario.email}</span>
          <button onClick={handleLogout} style={styles.logoutButton}>Cerrar Sesión</button>
        </div>
      </header>
      
      <div style={styles.simulationBar}>
        <strong>Simular Vista Como:</strong>
        <button 
          style={viewMode === 'admin' ? {...styles.simButton, ...styles.activeSimButton} : styles.simButton}
          onClick={() => setViewMode('admin')}>
          Administrador
        </button>
        <button 
          style={viewMode === 'medico' ? {...styles.simButton, ...styles.activeSimButton} : styles.simButton}
          onClick={() => setViewMode('medico')}>
          Médico
        </button>
        <button 
          style={viewMode === 'auxiliar' ? {...styles.simButton, ...styles.activeSimButton} : styles.simButton}
          onClick={() => setViewMode('auxiliar')}>
          Auxiliar
        </button>
      </div>

      {renderCurrentView()}
    </div>
  );
};

export default AdminView;