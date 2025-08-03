// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig'; // Asegúrate de importar auth también
import { collection, query, where, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth'; // Importa signOut

// Importamos las vistas reales
import AdminView from './AdminView';
import AuxiliarView from './AuxiliarView';

const Dashboard = ({ usuario }) => { // Ya no necesitamos recibir handleLogout
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (usuario) {
        const q = query(collection(db, "personal"), where("email", "==", usuario.email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setUserProfile(querySnapshot.docs[0].data());
        } else {
          setUserProfile({ rol: 'Desconocido' });
        }
      }
    };
    fetchUserProfile();
  }, [usuario]);

  // La función de logout ahora vive aquí
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  if (!userProfile) {
    return <div>Cargando perfil...</div>;
  }

  switch (userProfile.rol) {
    case 'Médico':
      return <AdminView usuario={usuario} handleLogout={handleLogout} />;
    case 'Auxiliar':
      return <AuxiliarView usuario={usuario} handleLogout={handleLogout} />;
    default:
      return (
        <div>
          <h1>Rol no reconocido</h1>
          <p>No tienes permisos para ver esta página.</p>
          <button onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      );
  }
};

export default Dashboard;