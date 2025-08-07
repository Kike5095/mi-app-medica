import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore'; // Cambiamos getDocs por onSnapshot
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

            // onSnapshot se queda escuchando en tiempo real
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                if (!querySnapshot.empty) {
                    setUserProfile(querySnapshot.docs[0].data());
                } else {
                    // Si no lo encuentra, no hacemos nada todavía, esperamos a que la función lo cree.
                    // Podemos dejar un estado temporal de "cargando" o "verificando".
                    setUserProfile(null); // Forzamos el estado de carga
                }
            });
            return () => unsubscribe(); // Limpiamos el listener al salir
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
        return <div>Verificando permisos...</div>;
    }

    switch (userProfile.rol) {
        case 'Médico': // Super Admin
            return <AdminView usuario={usuario} handleLogout={handleLogout} />;
        case 'Jefe de Enfermería':
        case 'Auxiliar Admin':
            return <AdminRestringidoView usuario={usuario} handleLogout={handleLogout} />;
        case 'Auxiliar':
            return <AuxiliarView usuario={usuario} handleLogout={handleLogout} />;
        default:
             // Este caso es para los médicos que no son super admin
            if (userProfile.rol === 'Medico') {
                 return <MedicoView usuario={usuario} handleLogout={handleLogout} />;
            }
            return (
                <div>
                    <h1>Acceso Denegado</h1>
                    <p>Tu rol no está reconocido o aún no ha sido asignado. Por favor, contacta a un administrador.</p>
                    <button onClick={handleLogout}>Cerrar Sesión</button>
                </div>
            );
    }
};

export default Dashboard;