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

  return userProfile 
    ? <Dashboard usuario={userProfile} handleLogout={handleLogout} /> 
    : <Login onLoginSuccess={handleLoginSuccess} />;
}

export default App;