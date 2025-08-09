import { Navigate } from "react-router-dom";

export default function RoleRoute({ children, allow }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const rol = (user?.rol || "").toLowerCase();
  const ok = allow.some(r => rol.includes(r));
  return ok ? children : <Navigate to="/" replace />;
}
