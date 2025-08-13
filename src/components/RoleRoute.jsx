import { Navigate } from "react-router-dom";
import { getRole, isSuperAdminLocal } from "../lib/users";

export default function RoleRoute({ children, allow = [] }) {
  const role = getRole().toLowerCase();
  if (!role) return <Navigate to="/" replace />;
  const ok = allow.map((r) => r.toLowerCase()).includes(role) || isSuperAdminLocal();
  return ok ? children : <Navigate to="/" replace />;
}
