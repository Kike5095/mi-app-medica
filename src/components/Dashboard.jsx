import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore'; // onSnapshot añadido
import { signOut } from 'firebase/auth';
import AdminView from './AdminView.jsx';
import AuxiliarView from './AuxiliarView.jsx';
import MedicoView from './MedicoView.jsx';
import AdminRestringidoView from './AdminRestringidoView.jsx';

const Dashboard = ({ usuario }) => {
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        if (usuario) {
            const q = query(collection(db, "personal"), where("email", "==", usuario.email));
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

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error al cerrar sesión", error);
        }
    };

    if (!userProfile) {
        return <div className="container" aria-busy="true">Verificando permisos...</div>;
    }

    // --- LÓGICA DE ROLES ACTUALIZADA ---

    // 1. Condición especial para el Super Admin
    if (userProfile.email === 'doctorcorreap@gmail.com') {
        return <AdminView usuario={userProfile} handleLogout={handleLogout} />;
    }

    // 2. Lógica para el resto de los usuarios
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