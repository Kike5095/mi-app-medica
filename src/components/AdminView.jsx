// src/components/AdminView.jsx
import React from 'react';
import PatientForm from './PatientForm';
import PatientList from './PatientList';
import StaffForm from './StaffForm';
import StaffList from './StaffList';

const AdminView = ({ usuario, handleLogout }) => {
  const styles = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' },
    mainContent: { marginTop: '30px' },
    logoutButton: { padding: '8px 15px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    section: { marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #ccc' }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={styles.header}>
        <h2>Panel de Administración</h2>
        <div>
          <span>{usuario.email}</span>
          <button onClick={handleLogout} style={styles.logoutButton}>Cerrar Sesión</button>
        </div>
      </header>
      
      <main style={styles.mainContent}>
        <h3>Bienvenido de nuevo, {usuario.displayName}.</h3>
        
        <div style={styles.section}>
          <h2>Gestión de Pacientes</h2>
          <PatientForm />
          <PatientList />
        </div>

        <div style={styles.section}>
          <h2>Gestión de Personal</h2>
          <StaffForm />
          <StaffList />
        </div>
      </main>
    </div>
  );
};

export default AdminView;