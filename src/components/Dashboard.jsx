import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import AdminView from './AdminView.jsx';
import AuxiliarView from './AuxiliarView.jsx';
import MedicoView from './MedicoView.jsx';
import AdminRestringidoView from './AdminRestringidoView.jsx';

const Dashboard = ({ usuario, handleLogout }) => {
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        if (usuario && usuario.cedula) {
            const q = query(collection(db, "personal"), where("cedula", "==", usuario.cedula));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                if (!querySnapshot.empty) {
                    setUserProfile(querySnapshot.docs[0].data());
                } else {
                    setUserProfile({ rol: 'Desconocido' });
                }
            });
            return () => unsubscribe();
        }
    }, [usuario]);

    if (!userProfile) {
        return <div className="container" aria-busy="true">Verificando permisos...</div>;
    }

    // Super admin
    if (userProfile.cedula === '1234567890') { // Cambia por tu cédula de admin
        return <AdminView usuario={userProfile} handleLogout={handleLogout} />;
    }

    // Roles
    switch (userProfile.rol) {
        case 'Jefe de Enfermería':
        case 'Auxiliar Admin':
            return <AdminRestringidoView usuario={userProfile} handleLogout={handleLogout} />;
        case 'Médico':
            return <MedicoView usuario={userProfile} handleLogout={handleLogout} />;
        case 'Auxiliar':
            return <AuxiliarView usuario={userProfile} handleLogout={handleLogout} />;
        default:
            return (
                <div className="container">
                    <h1>Acceso Denegado</h1>
                    <p>Tu rol no está reconocido en el sistema.</p>
                    <button onClick={handleLogout}>Cerrar Sesión</button>
                </div>
            );
    }
};

export default Dashboard;
