import { Navigate } from "react-router-dom";
import { getRole } from "../lib/users";

export default function ProtectedRoute({ children, role, allowedRoles = [] }) {
  const current = getRole();
  if (!current) return <Navigate to="/" replace />;

  if (allowedRoles.length > 0) {
    const ok = allowedRoles.includes(current) || current === "superadmin";
    return ok ? children : <Navigate to="/" replace />;
  }

  if (role) {
    const ok = current === role || current === "superadmin";
    return ok ? children : <Navigate to="/" replace />;
  }

  return children;
}
