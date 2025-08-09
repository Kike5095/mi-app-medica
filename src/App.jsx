import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Register from "./components/Register.jsx";

function App() {
  const [userProfile, setUserProfile] = useState(null);

  const handleLoginSuccess = (profile) => {
    setUserProfile(profile);
  };

  const handleLogout = () => {
    setUserProfile(null);
  };

  return (
    <Router>
      <Routes>
        {/* Ruta para registro */}
        <Route path="/register" element={<Register />} />

        {/* Ruta para login */}
        <Route
          path="/"
          element={
            userProfile ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* Ruta para dashboard */}
        <Route
          path="/dashboard"
          element={
            userProfile ? (
              <Dashboard usuario={userProfile} handleLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
