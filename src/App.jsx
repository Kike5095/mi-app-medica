import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import AdminView from "./components/AdminView.jsx";
import MedicoView from "./components/MedicoView.jsx";
import AuxiliarView from "./components/AuxiliarView.jsx";
import PatientDetail from "./components/PatientDetail.jsx";
import Login from "./components/Login.jsx";

export function getRole() {
  try {
    return (localStorage.getItem("role") || "").toLowerCase();
  } catch {
    return "";
  }
}

export function hasAccess(role, route) {
  role = (role || "").toLowerCase();
  const r = (route || "").toLowerCase();
  if (["admin", "superadmin"].includes(role)) {
    return (
      r.startsWith("/admin") ||
      r.startsWith("/medico") ||
      r.startsWith("/auxiliar") ||
      r.startsWith("/paciente/")
    );
  }
  if (role === "medico") {
    return r.startsWith("/medico") || r.startsWith("/paciente/");
  }
  if (role === "auxiliar") {
    return r.startsWith("/auxiliar") || r.startsWith("/paciente/");
  }
  return false;
}

function ProtectedRoute({ element, allow = [] }) {
  const role = getRole();
  const location = useLocation();
  const allowed = allow.map((r) => r.toLowerCase());
  if (!role || !allowed.includes(role) || !hasAccess(role, location.pathname)) {
    return <Navigate to="/" replace />;
  }
  return element;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute
            allow={["admin", "superadmin"]}
            element={<AdminView />}
          />
        }
      />
      <Route
        path="/medico"
        element={
          <ProtectedRoute
            allow={["medico", "admin", "superadmin"]}
            element={<MedicoView />}
          />
        }
      />
      <Route
        path="/auxiliar"
        element={
          <ProtectedRoute
            allow={["auxiliar", "admin", "superadmin"]}
            element={<AuxiliarView />}
          />
        }
      />
      <Route
        path="/paciente/:id"
        element={
          <ProtectedRoute
            allow={["medico", "auxiliar", "admin", "superadmin"]}
            element={<PatientDetail />}
          />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
