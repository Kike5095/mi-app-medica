// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import AdminView from "./components/AdminView.jsx";
import MedicoView from "./components/MedicoView.jsx";
import AuxiliarView from "./components/AuxiliarView.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RoleRoute from "./components/RoleRoute.jsx";

export default function App() {
  return (
    <Routes>
      {/* Público */}
      <Route path="/" element={<Login />} />
      <Route path="/registrar" element={<Register />} />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleRoute allow={["admin", "administrador"]}>
              <AdminView />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Médico */}
      <Route
        path="/medico"
        element={
          <ProtectedRoute>
            <RoleRoute allow={["medico", "médico"]}>
              <MedicoView />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Auxiliar */}
      <Route
        path="/auxiliar"
        element{
          <ProtectedRoute>
            <RoleRoute allow={["auxiliar"]}>
              <AuxiliarView />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
