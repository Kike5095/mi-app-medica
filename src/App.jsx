import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import LoginByCedula from "./components/LoginByCedula.jsx";
import UserRegister from "./components/UserRegister.jsx";
import MedicoView from "./components/MedicoView.jsx";
import AuxiliarView from "./components/AuxiliarView.jsx";
import AdminView from "./components/AdminView.jsx";
import PatientDetail from "./components/PatientDetail.jsx";
import SuperNav from "./components/SuperNav.jsx";

export default function App() {
  // Lee el rol desde localStorage pero en estado, para que re-renderice
  const [role, setRole] = useState(() => localStorage.getItem("role") || "");
  const isSuperAdmin = role === "superadmin";
  const location = useLocation();

  // Si otro código cambia el role en localStorage, nos enteramos
  useEffect(() => {
    const onStorage = () => setRole(localStorage.getItem("role") || "");
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Por si el login lo cambia en esta misma pestaña
  useEffect(() => {
    const r = localStorage.getItem("role") || "";
    if (r !== role) setRole(r);
  }, [location.pathname]); // cuando cambias de ruta, re-sync

  return (
    <>
      {isSuperAdmin && <SuperNav />}

      <Routes>
        {/* públicas */}
        <Route path="/" element={<LoginByCedula />} />
        <Route path="/registro" element={<UserRegister />} />

        {/* dejamos rutas SIEMPRE disponibles (más simple p/ superadmin) */}
        <Route path="/medico" element={<MedicoView />} />
        <Route path="/paciente/:id" element={<PatientDetail />} />
        <Route path="/auxiliar" element={<AuxiliarView />} />
        <Route path="/admin" element={<AdminView />} />

        {/* catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
