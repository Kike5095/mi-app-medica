import React, { useState } from 'react';
import Login from './components/Login.jsx'; 
import Dashboard from './components/Dashboard.jsx';

function App() {
  const [userProfile, setUserProfile] = useState(null);

  const handleLoginSuccess = (profile) => {
    setUserProfile(profile);
  };
  
  const handleLogout = () => {
    setUserProfile(null);
  };

  // Si hay un perfil en el estado, muestra el Dashboard. Si no, muestra el Login.
  // Le pasamos el perfil encontrado como 'usuario' al Dashboard.
  return userProfile 
    ? <Dashboard usuario={userProfile} handleLogout={handleLogout} /> 
    : <Login onLoginSuccess={handleLoginSuccess} />;
}

export default App;