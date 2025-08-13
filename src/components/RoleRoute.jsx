import { Navigate } from "react-router-dom";

export default function RoleRoute({ children, allow = [] }) {
  const role = (localStorage.getItem("role") || "").toLowerCase();
  if (!role) return <Navigate to="/" replace />;
  const ok = allow.map(r => r.toLowerCase()).includes(role);
  return ok ? children : <Navigate to="/" replace />;
}
