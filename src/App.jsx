import React, { useState } from 'react';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import Register from './components/Register.jsx';

function App() {
  const [userProfile, setUserProfile] = useState(null);
  const [pendingRegister, setPendingRegister] = useState(null);

  const handleLoginSuccess = (profile) => {
    setUserProfile(profile);
  };

  const handleRegisterRedirect = (data) => {
    setPendingRegister(data);
  };

  const handleLogout = () => {
    setUserProfile(null);
    setPendingRegister(null);
  };

  if (pendingRegister) {
    return <Register cedulaInicial={pendingRegister.cedula} onRegisterComplete={setUserProfile} />;
  }

  return userProfile
    ? <Dashboard usuario={userProfile} handleLogout={handleLogout} />
    : <Login onLoginSuccess={handleLoginSuccess} onRegisterRedirect={handleRegisterRedirect} />;
}

export default App;
