import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const current = localStorage.getItem("role");
  if (!current) return <Navigate to="/" replace />;
  if (role && current !== role) return <Navigate to="/" replace />;
  return children;
}
