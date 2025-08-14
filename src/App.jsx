import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import LoginByCedula from "./components/LoginByCedula.jsx";
import Landing from "./pages/Landing.jsx";
import Privacidad from "./pages/Privacidad.jsx";
import AvisoLegal from "./pages/AvisoLegal.jsx";
import Terminos from "./pages/Terminos.jsx";
import UserRegister from "./components/UserRegister.jsx";
import MedicoView from "./components/MedicoView.jsx";
import AuxiliarView from "./components/AuxiliarView.jsx";
import AdminView from "./components/AdminView.jsx";
import PatientDetail from "./components/PatientDetail.jsx";
import SuperNav from "./components/SuperNav.jsx";
import RoleRoute from "./components/RoleRoute.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import UsersAdmin from "./components/UsersAdmin.jsx";

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
        <Route path="/" element={<Landing />} />
        <Route path="/acceso" element={<LoginByCedula />} />
        <Route path="/registro" element={<UserRegister />} />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/aviso-legal" element={<AvisoLegal />} />
        <Route path="/terminos" element={<Terminos />} />

        {/* rutas protegidas por rol */}
        <Route
          path="/medico"
          element={
            <RoleRoute allow={["medico", "superadmin"]}>
              <MedicoView />
            </RoleRoute>
          }
        />
        <Route path="/paciente/:id" element={<PatientDetail />} />
        <Route
          path="/auxiliar"
          element={
            <RoleRoute allow={["auxiliar", "superadmin"]}>
              <AuxiliarView />
            </RoleRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <RoleRoute allow={["admin", "superadmin"]}>
              <AdminView />
            </RoleRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute role="admin">
              <UsersAdmin />
            </ProtectedRoute>
          }
        />

        {/* catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
