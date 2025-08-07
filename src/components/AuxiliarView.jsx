import React, { useState } from 'react';
import PatientSearch from './PatientSearch.jsx';

const AuxiliarView = ({ usuario, handleLogout }) => {
  return (
    <div className="container">
      <nav>
        <ul>
          <li><strong>Panel de Auxiliar</strong></li>
        </ul>
        <ul>
          <li>{usuario.email}</li>
          <li><button className="secondary" onClick={handleLogout}>Cerrar Sesión</button></li>
        </ul>
      </nav>
      <main>
        <PatientSearch />
      </main>
    </div>
  );
};

export default AuxiliarView;