import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import AdminView from './AdminView.jsx';
import AuxiliarView from './AuxiliarView.jsx';
import MedicoView from './MedicoView.jsx';
import AdminRestringidoView from './AdminRestringidoView.jsx';

const Dashboard = ({ usuario }) => {
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

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error al cerrar sesión", error);
        }
    };

    if (!userProfile) {
        return <div className="container" aria-busy="true">Cargando perfil...</div>;
    }

    switch (userProfile.rol) {
        case 'Médico':
            return <AdminView usuario={usuario} handleLogout={handleLogout} />;
        case 'Jefe de Enfermería':
        case 'Auxiliar Admin':
            return <AdminRestringidoView usuario={usuario} handleLogout={handleLogout} />;
        case 'Auxiliar':
            return <AuxiliarView usuario={usuario} handleLogout={handleLogout} />;
        default:
             // Asumimos que un médico sin privilegios especiales tiene el rol 'Medico'
            if (userProfile.rol === 'Medico') {
                return <MedicoView usuario={usuario} handleLogout={handleLogout} />;
            }
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