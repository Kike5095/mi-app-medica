import React, { useState } from 'react';
// Ya no necesitamos Firebase Auth aquí
import Login from './components/Login.jsx'; 
import Dashboard from './components/Dashboard.jsx';

function App() {
  // Nuestro "usuario" ahora es el perfil que guardamos de Firestore
  const [userProfile, setUserProfile] = useState(null);

  // Función para que el Login nos "pase" el usuario que encontró
  const handleLoginSuccess = (profile) => {
    setUserProfile(profile);
  };

  // Función para cerrar sesión (simplemente borra el perfil)
  const handleLogout = () => {
    setUserProfile(null);
  };

  // Si hay un perfil guardado, muestra el Dashboard. Si no, muestra el Login.
  return userProfile 
    ? <Dashboard usuario={userProfile} handleLogout={handleLogout} /> 
    : <Login onLoginSuccess={handleLoginSuccess} />;
}

export default App;