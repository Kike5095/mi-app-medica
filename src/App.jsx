import React, { useState, useEffect } from 'react';
import { auth } from './firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Login from './components/Login';
import Dashboard from './components/Dashboard'; // Importamos el nuevo Dashboard

function App() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuario(user);
      } else {
        setUsuario(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  // Si hay un usuario, muestra el Dashboard y le pasa la info del usuario.
  // Si no, muestra el Login.
  return usuario ? <Dashboard usuario={usuario} handleLogout={handleLogout} /> : <Login />;
}

export default App;